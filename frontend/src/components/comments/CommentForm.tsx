'use client';

import { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
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
  onCancel: () => void;
  placeholder?: string;
}

export default function CommentForm({
  newsId,
  parentCommentId,
  initialContent = '',
  editCommentId,
  onCommentCreated,
  onCommentUpdated,
  onCancel,
  placeholder = 'Share your thoughts...'
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editCommentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to register page for unauthenticated users
      window.location.href = '/register';
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const response = await commentApi.updateComment(editCommentId!, content.trim());
        onCommentUpdated?.(response.data);
      } else {
        const response = await commentApi.createComment(newsId, content.trim(), parentCommentId);
        onCommentCreated(response.data);
        setContent('');
      }
    } catch (error) {
      console.error('Comment operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">?</span>
            </div>
            <div>
              <p className="text-blue-800 text-sm font-medium">Want to join the conversation?</p>
              <p className="text-blue-600 text-xs">Please log in to comment on this article.</p>
            </div>
          </div>
          <div className="mt-3">
            <Button
              onClick={() => window.location.href = '/register'}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Log In / Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.profileImage || user?.avatar} />
          <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
          ) : (
            <Send className="w-4 h-4 mr-1" />
          )}
          {isEditMode ? 'Update' : 'Post'}
        </Button>
      </div>
    </form>
  );
}