'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  User as UserIcon, 
  Search, 
  Download, 
  Upload,
  UserCheck,
  Users,
  Shield,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import RoleAssignmentDialog from '@/components/admin/RoleAssignmentDialog';

// Enhanced User interface with additional fields
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  createdAt: string;
  profileImage?: string;
  avatar?: string;
  lastLogin?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  totalArticles?: number;
}

// Simple ProfileImage component
const ProfileImage = ({
  src,
  alt,
  size = 32,
  fallback,
}: {
  src?: string;
  alt: string;
  size?: number;
  fallback?: React.ReactNode;
}) => {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover border border-gray-200 bg-white"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }
  if (fallback) return fallback;
  // Default fallback: colored circle with first letter
  return (
    <div
      className="rounded-full bg-gray-200 flex items-center justify-center border border-gray-200"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <UserIcon className="w-5 h-5 text-gray-400" />
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [isRoleAssignmentOpen, setIsRoleAssignmentOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const usersPerPage = 10;

  // Function to refresh user data
  const refreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      
      // Fetch real data for each user more efficiently
      const usersWithRealData = await Promise.all(
        data.map(async (user: User) => {
          try {
            // Fetch articles count for this user from News collection
            const articlesResponse = await api.get('/news', {
              params: { 
                author: user._id,
                limit: 1,
                status: 'published'
              }
            });
            const totalArticles = articlesResponse.data.total || 0;
            
            // Get last login from user's lastLogin field (if available) or fetch from UserLogin
            let lastLogin = user.lastLogin;
            if (!lastLogin) {
              try {
                const lastLoginResponse = await api.get('/admin/user-logins/recent', {
                  params: { 
                    userId: user._id,
                    limit: 1
                  }
                });
                lastLogin = lastLoginResponse.data?.data?.[0]?.loginTime || null;
              } catch (loginError) {
                console.warn(`Could not fetch last login for user ${user._id}:`, loginError);
                lastLogin = null;
              }
            }
            
            return {
              ...user,
              status: user.status || 'active',
              lastLogin: lastLogin,
              totalArticles: totalArticles
            };
          } catch (error) {
            console.error(`Error fetching data for user ${user._id}:`, error);
            // If data fetch fails, use fallback values
            return {
              ...user,
              status: user.status || 'active',
              lastLogin: user.lastLogin || null,
              totalArticles: 0
            };
          }
        })
      );
      
      setUsers(usersWithRealData);
      setFilteredUsers(usersWithRealData);
    } catch (error) {
      console.error('Error refreshing users:', error);
      toast.error('Failed to refresh users.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced user fetching with real data
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Filter and search functionality
  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'username':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLogin || 0).getTime();
          bValue = new Date(b.lastLogin || 0).getTime();
          break;
        case 'totalArticles':
          aValue = a.totalArticles || 0;
          bValue = b.totalArticles || 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  // Individual user actions
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
      toast.success('User deleted successfully.');
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user._id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}`)));
      setUsers(users.filter(user => !selectedUsers.includes(user._id)));
      setSelectedUsers([]);
      setShowBulkActions(false);
      toast.success(`${selectedUsers.length} users deleted successfully.`);
    } catch {
      toast.error('Failed to delete selected users.');
    }
  };

  const handleBulkRoleChange = async () => {
    if (!newRole) return;
    
    try {
      await Promise.all(selectedUsers.map(id => 
        api.patch(`/users/${id}`, { role: newRole })
      ));
      setUsers(users.map(user => 
        selectedUsers.includes(user._id) ? { ...user, role: newRole as any } : user
      ));
      setSelectedUsers([]);
      setShowBulkActions(false);
      setNewRole('');
      toast.success(`Role updated for ${selectedUsers.length} users.`);
    } catch {
      toast.error('Failed to update user roles.');
    }
  };

  const handleExportUsers = () => {
    const selectedData = selectedUsers.length > 0 
      ? users.filter(user => selectedUsers.includes(user._id))
      : filteredUsers;

    const csvContent = [
      ['Username', 'Email', 'Role', 'Status', 'Joined', 'Last Login', 'Articles'],
      ...selectedData.map(user => [
        user.username,
        user.email,
        user.role,
        user.status || 'active',
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
        (user.totalArticles || 0).toString()
      ])
    ].map(row => row.join(',')).join('\n');

    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const csvData = BOM + csvContent;
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully!');
  };

  const handleDownloadTemplate = () => {
    const templateContent = [
      ['username', 'email', 'role', 'password'],
      ['john_doe', 'john@example.com', 'user', 'password123'],
      ['jane_admin', 'jane@example.com', 'admin', 'securepass456'],
      ['editor_mike', 'mike@example.com', 'editor', 'editpass789'],
      ['sarah_writer', 'sarah@example.com', 'editor', 'writerpass2024'],
      ['demo_user', 'demo@example.com', 'user', 'demopass123']
    ].map(row => row.join(',')).join('\n');

    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const csvContent = BOM + templateContent;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-import-template-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV template downloaded successfully!');
  };

  const handleImportUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        const requiredHeaders = ['username', 'email', 'role'];
        const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.toLowerCase().includes(h)));
        
        if (missingHeaders.length > 0) {
          toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        const newUsers = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim());
          const userObj: any = {};
          
          headers.forEach((header, index) => {
            const key = header.toLowerCase();
            if (key.includes('username')) userObj.username = values[index];
            else if (key.includes('email')) userObj.email = values[index];
            else if (key.includes('role')) userObj.role = values[index];
            else if (key.includes('password')) userObj.password = values[index] || 'defaultPassword123';
          });

          // Set default password if not provided
          if (!userObj.password) userObj.password = 'defaultPassword123';
          
          if (userObj.username && userObj.email && userObj.role) {
            newUsers.push(userObj);
          }
        }

        if (newUsers.length === 0) {
          toast.error('No valid users found in CSV file');
          return;
        }

        // Mock bulk user creation (in real app, would be API call)
        const createdUsers: User[] = newUsers.map((user, index) => ({
          _id: `imported_${Date.now()}_${index}`,
          username: user.username,
          email: user.email,
          role: user.role as 'user' | 'editor' | 'admin',
          createdAt: new Date().toISOString(),
          status: 'active' as const,
          lastLogin: undefined,
          totalArticles: 0
        }));

        setUsers(prev => [...prev, ...createdUsers]);
        toast.success(`Successfully imported ${createdUsers.length} users!`);
        
        // Reset the file input
        event.target.value = '';
        
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    
    reader.readAsText(file);
  };

  // Pagination logic with filtered users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gray-200 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Manage all users in the system with advanced filtering and bulk operations.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={handleImportUsers}
              className="hidden"
              id="user-import"
            />
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('user-import')?.click()}
                className="w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDownloadTemplate}
                title="Download CSV template"
                className="shrink-0 hover:bg-accent/50"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={handleExportUsers} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshUsers}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
            <Link href="/admin/users/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create User</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Advanced Search and Filters */}
          <div className="flex flex-col gap-4 mb-6 p-4 rounded-lg bg-muted/30">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="lastLogin">Last Login</SelectItem>
                  <SelectItem value="totalArticles">Articles</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <UserCheck className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Bulk Actions</span>
                      <span className="sm:hidden">Actions</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Actions</DialogTitle>
                      <DialogDescription>
                        Apply actions to {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Action:</label>
                        <Select value={bulkAction} onValueChange={setBulkAction}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delete">Delete Users</SelectItem>
                            <SelectItem value="changeRole">Change Role</SelectItem>
                            <SelectItem value="export">Export Selected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {bulkAction === 'changeRole' && (
                        <div>
                          <label className="text-sm font-medium">New Role:</label>
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (bulkAction === 'delete') handleBulkDelete();
                          else if (bulkAction === 'changeRole') handleBulkRoleChange();
                          else if (bulkAction === 'export') {
                            handleExportUsers();
                            setShowBulkActions(false);
                          }
                        }}
                        disabled={!bulkAction || (bulkAction === 'changeRole' && !newRole)}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Clear Selection</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="hidden xl:table-cell">Last Login</TableHead>
                <TableHead className="hidden 2xl:table-cell">Articles</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user._id} className={selectedUsers.includes(user._id) ? 'bg-blue-50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => handleSelectUser(user._id)}
                  />
                </TableCell>
                <TableCell>
                  <ProfileImage
                    src={user.profileImage || user.avatar}
                    alt={user.username}
                    size={32}
                    fallback={
                      <div
                        className="rounded-full bg-gray-200 flex items-center justify-center border border-gray-200"
                        style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                      >
                        {user.username?.charAt(0)?.toUpperCase() || <UserIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'outline' : 'secondary'}
                    className="text-xs"
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  <span className="font-medium">{user.totalArticles || 0}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUserForRole(user);
                          setIsRoleAssignmentOpen(true);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Assign Role
                      </DropdownMenuItem>
                      <Link href={`/admin/users/edit/${user._id}`}>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
            </Table>
          </div>
          
          {/* Pagination with additional info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-4 gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              {users.length !== filteredUsers.length && ` (filtered from ${users.length} total)`}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        isOpen={isRoleAssignmentOpen}
        onClose={() => {
          setIsRoleAssignmentOpen(false);
          setSelectedUserForRole(null);
        }}
        user={selectedUserForRole}
        onSuccess={() => {
          // Refresh the page to get updated user data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default UsersPage;
