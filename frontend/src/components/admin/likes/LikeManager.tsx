'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Trash2, 
  Search, 
  User,
  Calendar,
  ThumbsUp,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';
import api from '@/lib/api';

interface Like {
  _id: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  news?: {
    _id: string;
    title: { en: string; kh: string };
    slug: string;
    thumbnail?: string;
  };
}

interface LikeStats {
  total: number;
  uniqueUsers: number;
  uniqueArticles: number;
}

// Skeleton component for likes table
const LikesTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Article</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-8 rounded" />
                    <div className="max-w-xs">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// Skeleton component for stats cards
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function LikeManager() {
  const [likes, setLikes] = useState<Like[]>([]);
  const [stats, setStats] = useState<LikeStats>({ total: 0, uniqueUsers: 0, uniqueArticles: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLikes, setSelectedLikes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLikes();
  }, [filters, pagination.page]);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/likes?${params}`);
      
      if (response.data.success) {
        setLikes(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      } else {
        throw new Error('Failed to fetch likes');
      }
    } catch (error) {setError('Failed to load likes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLike = async (likeId: string) => {
    try {
      await api.delete(`/admin/likes/${likeId}`);
      setLikes(prev => prev.filter(like => like._id !== likeId));
      fetchLikes(); // Refresh to update stats
    } catch (error) {}
  };

  const handleBulkDelete = async () => {
    if (selectedLikes.length === 0) return;

    try {
      await api.delete('/admin/likes/bulk-delete', { data: { likeIds: selectedLikes } });
      setSelectedLikes([]);
      fetchLikes();
    } catch (error) {}
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLikes(likes.map(like => like._id));
    } else {
      setSelectedLikes([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <StatsSkeleton />
        
        {/* Filters Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <LikesTableSkeleton />

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={fetchLikes}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liked Articles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueArticles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Like Management</CardTitle>
          <CardDescription>Manage user likes and engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users or articles..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filters.sort} onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="user">By User</SelectItem>
                <SelectItem value="article">By Article</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedLikes.length > 0 && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedLikes.length} selected</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Likes List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedLikes.length === likes.length && likes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Article</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {likes.map((like) => (
                  <tr key={like._id} className="border-b">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedLikes.includes(like._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLikes(prev => [...prev, like._id]);
                          } else {
                            setSelectedLikes(prev => prev.filter(id => id !== like._id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={like.user.profileImage} 
                            alt={like.user.username}
                          />
                          <AvatarFallback>
                            {like.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{like.user.username}</p>
                          <p className="text-xs text-muted-foreground">{like.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {like.news?.thumbnail && (
                          <img 
                            src={like.news.thumbnail} 
                            alt={like.news?.title?.en || 'Article'}
                            className="w-12 h-8 object-cover rounded"
                          />
                        )}
                        <div className="max-w-xs">
                          {like.news ? (
                            <>
                              <p className="text-sm font-medium">{like.news.title?.en || 'Unknown Article'}</p>
                              <p className="text-xs text-muted-foreground">{like.news.slug || 'No slug'}</p>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <p className="font-medium">Article Deleted</p>
                              <p className="text-xs">This article no longer exists</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(like.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLike(like._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} likes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 