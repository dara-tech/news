'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Key,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  level: number;
  isSystemRole: boolean;
  isActive: boolean;
  color: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  [category: string]: string[];
}

interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  roleDistribution: Array<{
    role: string;
    count: number;
    displayName: string;
    color: string;
  }>;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission>({});
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    level: 10,
    color: '#6b7280',
    isActive: true
  });

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/roles');
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/roles/permissions');
      if (data.success) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/roles/stats');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch role statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchStats();
  }, [fetchRoles, fetchPermissions, fetchStats]);

  const handleCreateRole = async () => {
    try {
      const { data } = await api.post('/admin/roles', formData);
      if (data.success) {
        toast.success('Role created successfully');
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          displayName: '',
          description: '',
          permissions: [],
          level: 10,
          color: '#6b7280',
          isActive: true
        });
        fetchRoles();
        fetchStats();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message || 'Failed to create role');
      } else {
        toast.error('Failed to create role');
      }
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const { data } = await api.put(`/admin/roles/${selectedRole._id}`, formData);
      if (data.success) {
        toast.success('Role updated successfully');
        setIsEditDialogOpen(false);
        setSelectedRole(null);
        fetchRoles();
        fetchStats();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message || 'Failed to update role');
      } else {
        toast.error('Failed to update role');
      }
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const { data } = await api.delete(`/admin/roles/${selectedRole._id}`);
      if (data.success) {
        toast.success('Role deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
        fetchRoles();
        fetchStats();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message || 'Failed to delete role');
      } else {
        toast.error('Failed to delete role');
      }
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
      level: role.level,
      color: role.color,
      isActive: role.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'active' && role.isActive) ||
                         (activeFilter === 'inactive' && !role.isActive) ||
                         (activeFilter === 'system' && role.isSystemRole) ||
                         (activeFilter === 'custom' && !role.isSystemRole);

    return matchesSearch && matchesFilter;
  });

  const getRoleLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-600 bg-red-50';
    if (level >= 50) return 'text-orange-600 bg-orange-50';
    if (level >= 20) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const PermissionSelector = () => (
    <div className="space-y-4">
      <Label>Permissions</Label>
      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
        {Object.entries(permissions).map(([category, perms]) => (
          <div key={category} className="mb-4">
            <h4 className="font-medium text-sm mb-2 capitalize text-gray-700">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {perms.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                  />
                  <label
                    htmlFor={permission}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.split('.').pop()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Role Management
          </h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchRoles}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Create a new role with specific permissions and access levels.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., content-moderator"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g., Content Moderator"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role's purpose and responsibilities"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Access Level (1-100)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <PermissionSelector />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="system">System Roles</SelectItem>
                    <SelectItem value="custom">Custom Roles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Roles ({filteredRoles.length})</CardTitle>
              <CardDescription>
                Manage user roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading roles...
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            <div>
                              <div className="font-medium">{role.displayName}</div>
                              <div className="text-sm text-gray-500">{role.name}</div>
                              {role.description && (
                                <div className="text-xs text-gray-400 max-w-xs truncate">
                                  {role.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleLevelColor(role.level)}>
                            Level {role.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{role.permissions.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{role.userCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {role.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className={role.isActive ? 'text-green-600' : 'text-orange-600'}>
                              {role.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {role.isSystemRole && (
                              <Badge variant="outline" className="ml-2">System</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(role)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            {!role.isSystemRole && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(role)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Available Permissions
              </CardTitle>
              <CardDescription>
                All available permissions grouped by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(permissions).map(([category, perms]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 capitalize text-gray-800">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <div key={permission} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRoles}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.activeRoles}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">System Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.systemRoles}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{stats.customRoles}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>Number of users per role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.roleDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.displayName || item.role}</span>
                        </div>
                        <Badge variant="outline">{item.count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={selectedRole?.isSystemRole}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">Display Name</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Access Level (1-100)</Label>
                <Input
                  id="edit-level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="edit-isActive">Active Role</Label>
            </div>
            <PermissionSelector />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.displayName}"? 
              {selectedRole?.userCount && selectedRole.userCount > 0 && (
                <span className="block mt-2 text-red-600">
                  This role is currently assigned to {selectedRole.userCount} user(s). 
                  They will need to be reassigned to another role.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}