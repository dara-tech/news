'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Calendar,
  ThumbsUp,
  Eye,
  AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';

interface Comment {
  _id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
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
  };
  likes: Array<{ username: string }>;
  moderatedBy?: string;
  moderatedAt?: string;
  rejectionReason?: string;
}

interface CommentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

// Skeleton component for comments table
const CommentsTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="p-4 text-left">Comment</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Article</th>
              <th className="p-4 text-left">Status</th>
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
                  <div className="max-w-xs">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
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
                  <div className="max-w-xs">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-16" />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
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
  <div className="grid gap-4 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
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

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedCommentForReject, setSelectedCommentForReject] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [filters, pagination.page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/comments?${params}`);
      
      if (response.data.success) {
        setComments(response.data.data);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      const data = status === 'rejected' ? { reason } : {};
      
      await api.put(`/admin/comments/${commentId}/${endpoint}`, data);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, status, rejectionReason: reason }
          : comment
      ));
      
      fetchComments(); // Refresh to update stats
      toast.success(`Comment ${status} successfully`);
    } catch (error) {
      console.error(`Error ${status}ing comment:`, error);
      setError(`Failed to ${status} comment. Please try again.`);
      toast.error(`Failed to ${status} comment`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/admin/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      fetchComments(); // Refresh to update stats
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
      toast.error('Failed to delete comment');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedComments.length === 0) return;

    try {
      if (action === 'delete') {
        await api.delete('/admin/comments/bulk-delete', { data: { commentIds: selectedComments } });
      } else {
        const endpoint = action === 'approve' ? 'bulk-approve' : 'bulk-reject';
        const data = action === 'reject' ? { commentIds: selectedComments, reason: rejectionReason } : { commentIds: selectedComments };
        await api.put(`/admin/comments/${endpoint}`, data);
      }
      
      setSelectedComments([]);
      fetchComments();
      toast.success(`Comments ${action}${action === 'approve' ? 'd' : action === 'reject' ? 'ed' : 'd'} successfully`);
    } catch (error) {
      console.error(`Error bulk ${action}ing comments:`, error);
      setError(`Failed to ${action} comments. Please try again.`);
      toast.error(`Failed to ${action} comments`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComments(comments.map(comment => comment._id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleSingleReject = (commentId: string) => {
    setSelectedCommentForReject(commentId);
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = () => {
    if (selectedCommentForReject) {
      handleStatusChange(selectedCommentForReject, 'rejected', rejectionReason);
      setSelectedCommentForReject(null);
    } else {
      handleBulkAction('reject');
    }
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <CommentsTableSkeleton />

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
              onClick={fetchComments}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Comment Management</CardTitle>
          <CardDescription>Manage and moderate user comments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments or users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sort} onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="mostLiked">Most Liked</SelectItem>
                <SelectItem value="pending">Pending First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedComments.length > 0 && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedComments.length} selected</span>
              <Button
                size="sm"
                onClick={() => handleBulkAction('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedCommentForReject(null);
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedComments.length === comments.length && comments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left">Comment</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Article</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment._id} className="border-b">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedComments.includes(comment._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedComments(prev => [...prev, comment._id]);
                          } else {
                            setSelectedComments(prev => prev.filter(id => id !== comment._id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">{comment.content}</p>
                        {comment.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {comment.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={comment.user.profileImage} 
                            alt={comment.user.username}
                          />
                          <AvatarFallback>
                            {comment.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{comment.user.username}</p>
                          <p className="text-xs text-muted-foreground">{comment.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        {comment.news ? (
                          <>
                            <p className="text-sm font-medium">{comment.news.title?.en || 'Unknown Article'}</p>
                            <p className="text-xs text-muted-foreground">{comment.news.slug || 'No slug'}</p>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium">Article Deleted</p>
                            <p className="text-xs">This article no longer exists</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(comment.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(comment.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {comment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(comment._id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSingleReject(comment._id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteComment(comment._id)}
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
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} comments
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Comment{selectedCommentForReject ? '' : 's'}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the {selectedCommentForReject ? 'comment' : 'selected comments'}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim()}
            >
              Reject Comment{selectedCommentForReject ? '' : 's'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 