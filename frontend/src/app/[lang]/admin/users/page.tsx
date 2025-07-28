'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, User as UserIcon } from 'lucide-react';
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
import { toast } from 'sonner';

// Add profileImage and avatar as optional fields
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  createdAt: string;
  profileImage?: string;
  avatar?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users');
        setUsers(data);
      } catch {
        setError('Failed to fetch users.');
        toast.error('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      toast.success('User deleted successfully.');
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all users in the system.</CardDescription>
        </div>
        <Link href="/admin/users/create">
          <Button>Create User</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user._id}>
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
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'outline' : 'secondary'}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(user.createdAt).toLocaleDateString()}
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
      </CardContent>
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
    </Card>
  );
};

export default UsersPage;
