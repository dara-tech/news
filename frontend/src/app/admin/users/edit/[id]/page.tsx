'use client';

import { useState, useEffect, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

interface UserFormData {
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
}

const EditUserPage = () => {
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const { data } = await api.get(`/users/${id}`);
          setFormData(data);
        } catch (err) {
          toast.error('Failed to fetch user data.');
          console.error(err);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleRoleChange = (value: 'user' | 'editor' | 'admin') => {
    if (!formData) return;
    setFormData(prev => (prev ? { ...prev, role: value } : null));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      await api.put(`/users/${id}`, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      });
      toast.success('User updated successfully!');
      router.push('/admin/users');
        } catch (err) {
      if (err instanceof AxiosError) {
        console.error('Failed to update user:', err);
        toast.error(err.response?.data?.message || 'Failed to update user.');
      } else {
        console.error('An unexpected error occurred:', err);
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching user data, please wait.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
        <CardDescription>Update the user&apos;s details below. Password cannot be changed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditUserPage;
