'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FollowRelationship {
  _id: string;
  follower: {
    _id: string;
    username: string;
    email: string;
    role: string;
    profileImage?: string | null;
  };
  following: {
    _id: string;
    username: string;
    email: string;
    role: string;
    profileImage?: string | null;
  };
  createdAt: string;
  status?: 'active' | 'suspended';
}

const FollowsPage = () => {
  const [follows, setFollows] = useState<FollowRelationship[]>([]);
  const [filteredFollows, setFilteredFollows] = useState<FollowRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFollows, setSelectedFollows] = useState<string[]>([]);
  const [selectedFollow, setSelectedFollow] = useState<FollowRelationship | null>(null);
  const [showFollowDetails, setShowFollowDetails] = useState(false);

  useEffect(() => {
    const fetchFollows = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/follows');// Debug log
        
        // Extract data from the response structure
        const followsData = response.data?.data || response.data || [];
        const followsArray = Array.isArray(followsData) ? followsData : [];// Debug log
        
        // If no data from API, use mock data for testing
        if (followsArray.length === 0) {const mockFollows: FollowRelationship[] = [
            {
              _id: '1',
              follower: {
                _id: 'user1',
                username: 'john_doe',
                email: 'john@example.com',
                role: 'user',
                profileImage: null
              },
              following: {
                _id: 'user2',
                username: 'jane_admin',
                email: 'jane@example.com',
                role: 'admin',
                profileImage: null
              },
              createdAt: '2024-01-15T10:30:00Z',
              status: 'active'
            },
            {
              _id: '2',
              follower: {
                _id: 'user3',
                username: 'mike_editor',
                email: 'mike@example.com',
                role: 'editor',
                profileImage: null
              },
              following: {
                _id: 'user4',
                username: 'sarah_user',
                email: 'sarah@example.com',
                role: 'user',
                profileImage: null
              },
              createdAt: '2024-01-14T14:20:00Z',
              status: 'active'
            },
            {
              _id: '3',
              follower: {
                _id: 'user5',
                username: 'alex_user',
                email: 'alex@example.com',
                role: 'user',
                profileImage: null
              },
              following: {
                _id: 'user6',
                username: 'admin_bob',
                email: 'bob@example.com',
                role: 'admin',
                profileImage: null
              },
              createdAt: '2024-01-13T09:15:00Z',
              status: 'suspended'
            }
          ];
          setFollows(mockFollows);
          setFilteredFollows(mockFollows);
        } else {
          setFollows(followsArray);
          setFilteredFollows(followsArray);
        }
      } catch (err) {toast.error('Failed to fetch follow relationships.');
        setFollows([]);
        setFilteredFollows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFollows();
  }, []);

  const filterFollows = () => {
    if (!Array.isArray(follows)) {
      setFilteredFollows([]);
      return;
    }

    let filtered = [...follows];

    if (searchTerm) {
      filtered = filtered.filter(follow => 
        follow.follower.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        follow.following.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(follow => {
        switch (filterType) {
          case 'admin-follows':
            return follow.follower.role === 'admin' || follow.following.role === 'admin';
          case 'user-follows':
            return follow.follower.role === 'user' && follow.following.role === 'user';
          case 'suspicious':
            return follow.follower.role === 'user' && follow.following.role === 'admin';
          default:
            return true;
        }
      });
    }

    setFilteredFollows(filtered);
  };

  useEffect(() => {
    filterFollows();
  }, [searchTerm, filterType, follows]);

  const handleDeleteFollow = async (id: string) => {
    try {
      await api.delete(`/admin/follows/${id}`);
      setFollows(follows.filter((follow) => follow._id !== id));
      toast.success('Follow relationship removed successfully.');
    } catch {
      toast.error('Failed to remove follow relationship.');
    }
  };

  const handleSuspendFollow = async (id: string) => {
    try {
      await api.patch(`/admin/follows/${id}`, { status: 'suspended' });
      setFollows(follows.map(follow => 
        follow._id === id ? { ...follow, status: 'suspended' } : follow
      ));
      toast.success('Follow relationship suspended.');
    } catch {
      toast.error('Failed to suspend follow relationship.');
    }
  };

  const handleActivateFollow = async (id: string) => {
    try {
      await api.patch(`/admin/follows/${id}`, { status: 'active' });
      setFollows(follows.map(follow => 
        follow._id === id ? { ...follow, status: 'active' } : follow
      ));
      toast.success('Follow relationship activated.');
    } catch {
      toast.error('Failed to activate follow relationship.');
    }
  };

  const handleSelectAll = () => {
    if (!Array.isArray(filteredFollows)) return;
    
    if (selectedFollows.length === filteredFollows.length) {
      setSelectedFollows([]);
    } else {
      setSelectedFollows(filteredFollows.map(follow => follow._id));
    }
  };

  const handleSelectFollow = (followId: string) => {
    setSelectedFollows(prev => 
      prev.includes(followId) 
        ? prev.filter(id => id !== followId)
        : [...prev, followId]
    );
  };

  const handleExportFollows = () => {
    if (!Array.isArray(filteredFollows)) return;
    
    const selectedData = selectedFollows.length > 0 
      ? follows.filter(follow => selectedFollows.includes(follow._id))
      : filteredFollows;

    const csvContent = [
      ['Follower', 'Follower Email', 'Follower Role', 'Following', 'Following Email', 'Following Role', 'Follow Date', 'Status'],
      ...selectedData.map(follow => [
        follow.follower.username,
        follow.follower.email,
        follow.follower.role,
        follow.following.username,
        follow.following.email,
        follow.following.role,
        new Date(follow.createdAt).toLocaleDateString(),
        follow.status || 'active'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follows-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Follow relationships exported successfully.');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'editor':
        return 'bg-blue-500 text-white';
      case 'user':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow Management</CardTitle>
          <CardDescription>Loading follow relationships...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gray-200 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Follows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{follows.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {follows.filter(f => f.status !== 'suspended').length}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {follows.filter(f => f.status === 'suspended').length}
                </p>
              </div>
              <UserMinus className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspicious</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {follows.filter(f => f.follower.role === 'user' && f.following.role === 'admin').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Follow Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Follow Management ({Array.isArray(filteredFollows) ? filteredFollows.length : 0})
            </CardTitle>
            <CardDescription>Monitor and manage follow relationships between users.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportFollows}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4  rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Follows</SelectItem>
                  <SelectItem value="admin-follows">Admin Involved</SelectItem>
                  <SelectItem value="user-follows">User to User</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Follows Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={Array.isArray(filteredFollows) && filteredFollows.length > 0 && selectedFollows.length === filteredFollows.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Follower</TableHead>
                <TableHead>Following</TableHead>
                <TableHead className="hidden md:table-cell">Follow Date</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(filteredFollows) && filteredFollows.map((follow) => (
                <TableRow key={follow._id} className={selectedFollows.includes(follow._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedFollows.includes(follow._id)}
                      onCheckedChange={() => handleSelectFollow(follow._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {follow.follower.profileImage ? (
                          <img 
                            src={follow.follower.profileImage} 
                            alt={follow.follower.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {follow.follower.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{follow.follower.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{follow.follower.email}</div>
                        <Badge className={`text-xs ${getRoleBadgeColor(follow.follower.role)}`}>
                          {follow.follower.role}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {follow.following.profileImage ? (
                          <img 
                            src={follow.following.profileImage} 
                            alt={follow.following.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {follow.following.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{follow.following.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{follow.following.email}</div>
                        <Badge className={`text-xs ${getRoleBadgeColor(follow.following.role)}`}>
                          {follow.following.role}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(follow.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant={follow.status === 'suspended' ? 'destructive' : 'default'}
                    >
                      {follow.status || 'active'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => {
                          setSelectedFollow(follow);
                          setShowFollowDetails(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {follow.status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => handleActivateFollow(follow._id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendFollow(follow._id)}>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDeleteFollow(follow._id)}
                        >
                          Remove Follow
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Follow Details Dialog */}
      <Dialog open={showFollowDetails} onOpenChange={setShowFollowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-lg font-medium">Follow Details</DialogTitle>
          </DialogHeader>
          {selectedFollow && (
            <div className="space-y-4">
              {/* Users Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                    {selectedFollow.follower.profileImage ? (
                      <img 
                        src={selectedFollow.follower.profileImage} 
                        alt={selectedFollow.follower.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      selectedFollow.follower.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFollow.follower.username}</p>
                    <p className="text-xs text-gray-500">Follower</p>
                  </div>
                  <Badge className={getRoleBadgeColor(selectedFollow.follower.role)}>
                    {selectedFollow.follower.role}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                    {selectedFollow.following.profileImage ? (
                      <img 
                        src={selectedFollow.following.profileImage} 
                        alt={selectedFollow.following.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      selectedFollow.following.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFollow.following.username}</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                  <Badge className={getRoleBadgeColor(selectedFollow.following.role)}>
                    {selectedFollow.following.role}
                  </Badge>
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Follow Date</span>
                  <span>{format(new Date(selectedFollow.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={selectedFollow.status === 'suspended' ? 'destructive' : 'default'}>
                    {selectedFollow.status || 'active'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFollowDetails(false)}>
              Close
            </Button>
            {selectedFollow && (
              <div className="flex gap-2">
                {selectedFollow.status === 'suspended' ? (
                  <Button size="sm" onClick={() => {
                    handleActivateFollow(selectedFollow._id);
                    setShowFollowDetails(false);
                  }}>
                    Activate
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => {
                    handleSuspendFollow(selectedFollow._id);
                    setShowFollowDetails(false);
                  }}>
                    Suspend
                  </Button>
                )}
                <Button 
                  size="sm"
                  variant="destructive" 
                  onClick={() => {
                    handleDeleteFollow(selectedFollow._id);
                    setShowFollowDetails(false);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowsPage; 