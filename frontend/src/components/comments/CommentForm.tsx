'use client';

import { useState, useCallback, useMemo } from 'react';
import { Send, X, Loader2,  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { commentApi, type Comment } from '@/lib/commentApi';
import { useAuth } from '@/context/AuthContext';

interface CommentFormProps {
  newsId: string;
  parentCommentId?: string;
  initialContent?: string;
  editCommentId?: string;
  onCommentCreated: (comment: Comment) => void;
  onCommentUpdated?: (comment: Comment) => void;
  onCommentFailed?: (commentId: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

const MAX_COMMENT_LENGTH = 1000;
const WARNING_THRESHOLD = 700;
const DANGER_THRESHOLD = 900;

export default function CommentForm({
  newsId,
  parentCommentId,
  initialContent = '',
  editCommentId,
  onCommentCreated,
  onCommentUpdated,
  onCommentFailed,
  onCancel,
  placeholder = 'Share your thoughts...'
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!editCommentId;
  
  const characterCountColor = useMemo(() => {
    if (content.length > DANGER_THRESHOLD) return 'text-red-500';
    if (content.length > WARNING_THRESHOLD) return 'text-amber-500';
    return 'text-gray-400 dark:text-gray-500';
  }, [content.length]);

  const isSubmitDisabled = useMemo(() => 
    isSubmitting || !content.trim() || content.length > MAX_COMMENT_LENGTH,
    [isSubmitting, content]
  );

  const generateOptimisticId = useCallback(() => 
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const createOptimisticComment = useCallback((tempId: string): Comment => ({
    _id: tempId,
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
    isOptimistic: true
  } as Comment), [content, user, newsId, parentCommentId]);

  const validateContent = useCallback(() => {
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return false;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`Comment is too long (max ${MAX_COMMENT_LENGTH} characters)`);
      return false;
    }

    return true;
  }, [content]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateContent()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (isEditMode) {
        const response = await commentApi.updateComment(editCommentId!, content.trim());onCommentUpdated?.(response.data);
      } else {
        const optimisticId = generateOptimisticId();
        const optimisticComment = createOptimisticComment(optimisticId);

        // Show optimistic comment immediately
        onCommentCreated(optimisticComment);
        setContent('');

        try {
          // Make actual API call
          const response = await commentApi.createComment(newsId, content.trim(), parentCommentId);} catch (apiError) {
          // Remove optimistic comment on API failure
          onCommentFailed?.(optimisticId);
          throw apiError;
        }
      }
    } catch (err) {// @ts-expect-error: err may be any type
      const errorMessage = err?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} comment`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateContent, isEditMode, editCommentId, content, onCommentUpdated, generateOptimisticId, createOptimisticComment, onCommentCreated, newsId, parentCommentId, onCommentFailed]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const getUserInitials = useCallback((username: string) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const userDisplayName = user?.username || 'Anonymous';
  const userInitials = getUserInitials(userDisplayName);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        {/* User Info */}
        <div className="flex items-center gap-2 ">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage || user?.avatar} />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {userDisplayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEditMode ? 'Editing comment' : 'Add a comment'}
            </p>
          </div>
          {isEditMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel edit</span>
            </Button>
          )}
        </div>

        {/* Comment Input */}
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[120px] resize-none text-sm leading-relaxed border-gray-200 dark:border-gray-700 focus:border-none focus:ring-0 focus:ring-offset-0 bg-white dark:bg-gray-900 transition-all duration-200 pr-20"
            disabled={isSubmitting}
            aria-describedby={error ? 'comment-error' : undefined}
          />
          
          {/* Character count and submit button */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            <span className={`text-xs font-medium transition-colors ${characterCountColor}`}>
              {content.length}/{MAX_COMMENT_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitDisabled}
              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white shadow-sm transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">
                {isEditMode ? 'Update comment' : 'Post comment'}
              </span>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            id="comment-error"
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-in slide-in-from-top-2 duration-200"
            role="alert"
          >
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Action Hint */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> to {isEditMode ? 'update' : 'post'}
        </div>
      </form>
    </div>
  );
}