'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Flag, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { commentApi, type Comment } from '@/lib/commentApi';
import { useAuth } from '@/context/AuthContext';
import CommentForm from './CommentForm';

interface CommentListProps {
  comments: Comment[];
  newsId: string;
  onCommentDeleted: (commentId: string) => void;
  onCommentLiked: (commentId: string, hasLiked: boolean) => void;
}

type OptimisticComment = Comment & { isOptimistic?: boolean };

export default function CommentList({
  comments = [],
  newsId,
  onCommentDeleted,
  onCommentLiked,
}: CommentListProps) {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [likingComment, setLikingComment] = useState<string | null>(null);
  const [lastLikeTime, setLastLikeTime] = useState<number>(0);

  // Debug logging
  console.log('CommentList received comments:', comments);
  console.log('CommentList comments length:', comments?.length || 0);

  const handleLike = async (comment: Comment) => {
    if (!user) return;

    // Prevent rapid like/unlike actions
    const now = Date.now();
    if (now - lastLikeTime < 1000) { // 1 second debounce
      console.log('Like action too rapid, ignoring');
      return;
    }
    setLastLikeTime(now);

    // Convert user ID to string for comparison
    const userId = user._id?.toString();
    const hasLiked = comment.likes.some(likeId => likeId.toString() === userId);
    setLikingComment(comment._id);

    // Optimistic update - update UI immediately
    onCommentLiked(comment._id, !hasLiked);

    try {
      await commentApi.toggleCommentLike(comment._id);
      // WebSocket will handle the real update, so we don't call onCommentLiked again
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert optimistic update on error
      onCommentLiked(comment._id, hasLiked);
    } finally {
      setLikingComment(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId);
      onCommentDeleted(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  };

  const handleEdit = (commentId: string) => {
    setEditingComment(commentId);
    setReplyingTo(null);
  };

  const canEditComment = (comment: Comment) => {
    return user && comment.user && (comment.user._id === user._id || user.role === 'admin');
  };

  const canDeleteComment = (comment: Comment) => {
    return user && comment.user && (comment.user._id === user._id || user.role === 'admin');
  };

  const isCommentOwner = (comment: Comment): boolean => {
    return !!(user && comment.user && comment.user._id === user._id);
  };

  const getUserInitials = (username: string) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderComment = (comment: OptimisticComment, isReply = false) => {
    // Avoid 'any' by using OptimisticComment type
    const isOptimistic = comment.isOptimistic === true;

    return (
      <div className={`space-y-4 ${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-6' : ''}`}>
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={comment.user?.profileImage || comment.user?.avatar}
              alt={comment.user?.username || 'User'}
            />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
              {getUserInitials(comment.user?.username || 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {comment.user?.username || 'Unknown'}
              </span>
              {isOptimistic && (
                <Badge variant="secondary" className="text-xs">
                  Posting...
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            {editingComment === comment._id ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <CommentForm
                  newsId={newsId}
                  initialContent={comment.content}
                  onCommentCreated={() => {
                    // Just close edit mode
                    setEditingComment(null);
                  }}
                  onCancel={() => setEditingComment(null)}
                />
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {/* Like button - show for all authenticated users */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!user) {
                    // Redirect directly to login
                    window.location.href = '/en/login';
                    return;
                  }
                  handleLike(comment);
                }}
                disabled={likingComment === comment._id}
                className={`flex items-center space-x-1 transition-all duration-200 ${
                  user && (comment.likes || []).some(likeId => likeId.toString() === user._id?.toString())
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${
                  user && (comment.likes || []).some(likeId => likeId.toString() === user._id?.toString()) ? 'fill-current' : ''
                }`} />
                <span className="text-xs font-medium">
                  {(comment.likes || []).length > 0 ? (comment.likes || []).length : ''}
                </span>
              </Button>

              {/* Reply button - show for all authenticated users except comment owner */}
              {!isCommentOwner(comment) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!user) {
                      // Redirect directly to login
                      window.location.href = '/en/login';
                      return;
                    }
                    handleReply(comment._id);
                  }}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Reply</span>
                </Button>
              )}

              {(canEditComment(comment) || canDeleteComment(comment)) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEditComment(comment) && (
                      <DropdownMenuItem onClick={() => handleEdit(comment._id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDeleteComment(comment) && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(comment._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {!canEditComment(comment) && (
                      <DropdownMenuItem>
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <CommentForm
                  newsId={newsId}
                  parentCommentId={comment._id}
                  placeholder={`Replying to ${comment.user?.username || ''}...`}
                  onCommentCreated={() => {
                    // Just close reply mode
                    setReplyingTo(null);
                  }}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}

            {/* Replies */}
            {comment.replies && (comment.replies || []).length > 0 && (
              <div className="mt-4 space-y-4">
                {(comment.replies || []).map((reply) => (
                  <div key={reply._id}>
                    {renderComment(reply, true)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-b-0">
            {renderComment(comment)}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No comments yet
          </h4>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Be the first to share your thoughts on this article.
          </p>
          {!user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/en/login'}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Comment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}