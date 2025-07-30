'use client';

import { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { commentApi, type Comment } from '@/lib/commentApi';
import { useAuth } from '@/context/AuthContext';

interface CommentFormProps {
  newsId: string;
  parentCommentId?: string;
  initialContent?: string;
  onCommentCreated: (comment: Comment) => void;
  onCommentFailed?: (commentId: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function CommentForm({
  newsId,
  parentCommentId,
  initialContent = '',
  onCommentCreated,
  onCommentFailed,
  onCancel,
  placeholder = 'Share your thoughts...'
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment is too long (max 1000 characters)');
      return;
    }

    // Create optimistic comment for immediate UI feedback
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      user: {
        _id: user?._id || 'current-user',
        username: user?.username || 'You',
        profileImage: user?.profileImage,
        avatar: user?.avatar
      },
      news: newsId,
      parentComment: parentCommentId,
      isEdited: false,
      likes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add a flag to identify optimistic comments
      isOptimistic: true
    } as Comment;

    try {
      setIsSubmitting(true);
      setError(null);

      // Show optimistic comment immediately
      onCommentCreated(optimisticComment);
      setContent('');

      // Make actual API call
      const response = await commentApi.createComment(newsId, content.trim(), parentCommentId);
      console.log('Comment created successfully:', response);

      // The WebSocket will update the comment list with the real data
      // and replace the optimistic comment
    } catch (err) {
      console.error('Error creating comment:', err);
      // @ts-expect-error: err may be any type
      setError(err?.response?.data?.message || 'Failed to create comment');

      // Remove optimistic comment on failure
      if (onCommentFailed) {
        onCommentFailed(optimisticComment._id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px] resize-none pr-12"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            {content.length}/1000
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="h-8 w-8 p-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Press Cmd+Enter to submit
        </p>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}