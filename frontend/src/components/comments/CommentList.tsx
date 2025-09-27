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
  onCommentCreated?: (comment: Comment) => void;
}

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

  const handleLike = async (comment: Comment) => {
    if (!user) return;
    const hasLiked = comment.likes.some(likeId => likeId.toString() === user._id?.toString());
    onCommentLiked(comment._id, !hasLiked);
    try {
      await commentApi.toggleCommentLike(comment._id);
    } catch (error) {
      onCommentLiked(comment._id, hasLiked);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId);
      onCommentDeleted(commentId);
    } catch (error) {}
  };

  const canEditComment = (comment: Comment) => {
    return user && comment.user && (comment.user._id === user._id || user.role === 'admin');
  };

  const canDeleteComment = (comment: Comment) => {
    return user && comment.user && (comment.user._id === user._id || user.role === 'admin');
  };

  const getUserInitials = (username: string) => {
    return username?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const hasLiked = user && comment.likes.some(likeId => likeId.toString() === user._id?.toString());

    return (
      <div className={isReply ? 'ml-6 border-l border-gray-200 pl-4' : ''}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user?.profileImage} />
            <AvatarFallback>{getUserInitials(comment.user?.username)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className=" rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.user?.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {canEditComment(comment) && (
                        <DropdownMenuItem onClick={() => setEditingComment(comment._id)}>
                          <Edit className="w-4 h-4 mr-2" />Edit
                        </DropdownMenuItem>
                      )}
                      {canDeleteComment(comment) && (
                        <DropdownMenuItem onClick={() => handleDelete(comment._id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {editingComment === comment._id ? (
                <CommentForm
                  newsId={newsId}
                  editCommentId={comment._id}
                  initialContent={comment.content}
                  onCommentCreated={() => {}}
                  onCommentUpdated={(c) => {
                    onCommentUpdated?.(c);
                    setEditingComment(null);
                  }}
                  onCancel={() => setEditingComment(null)}
                />
              ) : (
                <div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment)}
                      className={hasLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                      {comment.likes?.length || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(comment._id)}
                    >
                      <Reply className="w-3 h-3 mr-1" />Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {replyingTo === comment._id && (
              <div className="mt-2">
                <CommentForm
                  newsId={newsId}
                  parentCommentId={comment._id}
                  onCommentCreated={() => setReplyingTo(null)}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}

            {!isReply && comment.replies?.map(reply => (
              <div key={reply._id} className="mt-3">
                {renderComment(reply, true)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id}>
            {renderComment(comment)}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto  mb-4" />
          <h4 className="text-lg font-medium mb-2">No comments yet</h4>
          <p className="text-gray-500 mb-4">Be the first to comment</p>
          {!user && (
            <Button onClick={() => window.location.href = '/en/login'}>
              <LogIn className="w-4 h-4 mr-2" />Login to Comment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}