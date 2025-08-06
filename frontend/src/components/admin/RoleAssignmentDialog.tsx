'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, Shield, AlertCircle } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  color: string;
  isActive: boolean;
  isSystemRole: boolean;
  permissions?: string[];
}

interface RoleAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export default function RoleAssignmentDialog({
  isOpen,
  onClose,
  user,
  onSuccess
}: RoleAssignmentDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        // Find the role ID that matches the user's current role
        const currentRole = roles.find(role => role.name === user.role);
        setSelectedRole(currentRole?._id || '');
      }
    }
  }, [isOpen, user, roles]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/roles?active=true');
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;

    try {
      setSubmitting(true);
      const { data } = await api.put(`/admin/roles/${selectedRole}/assign/${user._id}`);
      
      if (data.success) {
        toast.success(`Role assigned to ${user.username} successfully`);
        onSuccess?.();
        onClose();
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message || 'Failed to assign role');
      } else {
        toast.error('Failed to assign role');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoleDetails = roles.find(role => role._id === selectedRole);
  const currentRole = roles.find(role => role.name === user?.role);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Role
          </DialogTitle>
          <DialogDescription>
            Change the role for the selected user
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                {currentRole && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Current:</span>
                    <Badge 
                      style={{ backgroundColor: `${currentRole.color}20`, color: currentRole.color }}
                      className="text-xs"
                    >
                      {currentRole.displayName}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select New Role</label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{role.displayName}</div>
                          <div className="text-xs text-gray-500">Level {role.level}</div>
                        </div>
                        {role.isSystemRole && (
                          <Shield className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Details */}
            {selectedRoleDetails && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedRoleDetails.color }}
                  />
                  <span className="font-medium">{selectedRoleDetails.displayName}</span>
                  <Badge variant="outline" className="text-xs">
                    Level {selectedRoleDetails.level}
                  </Badge>
                </div>
                {selectedRoleDetails.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedRoleDetails.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>{selectedRoleDetails.permissions?.length || 0} permissions</span>
                </div>
              </div>
            )}

            {/* Warning for role changes */}
            {selectedRole && selectedRole !== currentRole?._id && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <div className="font-medium mb-1">Role Change Warning</div>
                  <div>
                    Changing this user's role will immediately affect their access permissions.
                    Make sure this change is intended.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignRole}
            disabled={!selectedRole || selectedRole === currentRole?._id || submitting}
          >
            {submitting ? 'Assigning...' : 'Assign Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}