'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Flag, LogIn, Reply } from 'lucide-react';
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
  onCommentUpdated?: (comment: Comment) => void;
  onCommentCreated?: (comment: Comment) => void; // Bubble new replies up
}

type OptimisticComment = Comment & { isOptimistic?: boolean };

export default function CommentList({
  comments = [],
  newsId,
  onCommentDeleted,
  onCommentLiked,
  onCommentUpdated,
  onCommentCreated,
}: CommentListProps) {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [likingComment, setLikingComment] = useState<string | null>(null);
  const [lastLikeTime, setLastLikeTime] = useState<number>(0);

  const handleLike = async (comment: Comment) => {
    if (!user) return;

    // Prevent rapid like/unlike actions
    const now = Date.now();
    if (now - lastLikeTime < 1000) {
      return;
    }
    setLastLikeTime(now);

    const userId = user._id?.toString();
    const hasLiked = comment.likes.some(likeId => likeId.toString() === userId);
    setLikingComment(comment._id);

    // Optimistic update
    onCommentLiked(comment._id, !hasLiked);

    try {
      await commentApi.toggleCommentLike(comment._id);
    } catch (error) {
      console.error('Error toggling comment like:', error);
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

  const handleCommentUpdated = (updatedComment: Comment) => {
    onCommentUpdated?.(updatedComment);
    setEditingComment(null);
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

  // Collect all descendant replies as a flat list with their immediate parent's username
  const collectRepliesWithParents = (replies: Comment[] | undefined, parentUserName: string): Array<{ node: Comment; parentUserName: string }> => {
    if (!replies || replies.length === 0) return [];
    const result: Array<{ node: Comment; parentUserName: string }> = [];
    for (const r of replies) {
      result.push({ node: r, parentUserName });
      // Recurse to include deeper levels, but keep parentUserName as the immediate parent (r.user?.username) for their children
      const childParent = r.user?.username || parentUserName;
      if (r.replies && r.replies.length > 0) {
        result.push(...collectRepliesWithParents(r.replies, childParent));
      }
    }
    return result;
  };

  const renderComment = (comment: OptimisticComment, isReply = false, replyingToName?: string) => {
    const isOptimistic = comment.isOptimistic === true;
    const hasLiked = user && comment.likes.some(likeId => likeId.toString() === user._id?.toString());

    return (
      <div className={`${isReply ? 'ml-3 sm:ml-6 border-l border-gray-200 dark:border-gray-700 pl-3 sm:pl-4' : ''}`}>
        <div className="flex gap-3 sm:gap-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage
              src={comment.user?.profileImage || comment.user?.avatar}
              alt={comment.user?.username || 'User'}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium">
              {getUserInitials(comment.user?.username || 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {comment.user?.username || 'Unknown'}
                  </span>
                  {isOptimistic && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Posting...
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canEditComment(comment) && (
                        <DropdownMenuItem onClick={() => handleEdit(comment._id)} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDeleteComment(comment) && (
                        <DropdownMenuItem 
                          onClick={() => handleDelete(comment._id)}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {!canEditComment(comment) && (
                        <DropdownMenuItem className="cursor-pointer">
                          <Flag className="w-4 h-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Content */}
              {editingComment === comment._id ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CommentForm
                    newsId={newsId}
                    editCommentId={comment._id}
                    initialContent={comment.content}
                    onCommentUpdated={handleCommentUpdated}
                    onCommentCreated={() => setEditingComment(null)}
                    onCancel={() => setEditingComment(null)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {isReply && replyingToName && (
                    <div className="text-xs text-gray-500">Replying to <span className="font-medium">{replyingToName}</span></div>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!user) {
                          window.location.href = '/en/login';
                          return;
                        }
                        handleLike(comment);
                      }}
                      disabled={likingComment === comment._id}
                      className={`h-8 px-2 text-xs font-medium transition-all duration-200 ${
                        hasLiked
                          ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 mr-1.5 ${hasLiked ? 'fill-current' : ''}`} />
                      {comment.likes?.length || 0}
                    </Button>

                    {!isCommentOwner(comment) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!user) {
                            window.location.href = '/en/login';
                            return;
                          }
                          handleReply(comment._id);
                        }}
                        className="h-8 px-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <Reply className="w-3.5 h-3.5 mr-1.5" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4">
                <CommentForm
                  newsId={newsId}
                  parentCommentId={comment._id}
                  placeholder={`Replying to ${comment.user?.username || ''}...`}
                  onCommentCreated={() => setReplyingTo(null)}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}
            {/* Replies (flat: only 2 levels in UI) */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {collectRepliesWithParents(comment.replies, comment.user?.username || '').map(({ node, parentUserName }) => (
                  <div key={node._id}>
                    {renderComment(node as OptimisticComment, true, parentUserName)}
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
    <div className="space-y-4">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="pb-4 last:pb-0">
            {renderComment(comment)}
          </div>
        ))
      ) : (
        <div className="text-center py-12 px-4">
          <div className="text-gray-300 dark:text-gray-600 mb-4">
            <MessageCircle className="w-12 h-12 mx-auto sm:w-16 sm:h-16" />
          </div>
          <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            No comments yet
          </h4>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Be the first to share your thoughts on this article.
          </p>
          {!user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/en/login'}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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