import { useState, useEffect, useCallback } from 'react';
import { commentApi, CommentStats } from '@/lib/commentApi';

interface UseArticleCommentsProps {
  article: {
    _id: string;
  };
  locale: string;
}

interface UseArticleCommentsReturn {
  commentCount: number;
  isLoading: boolean;
  error: string | null;
  refreshCommentCount: () => Promise<void>;
}

export const useArticleComments = ({ article, locale }: UseArticleCommentsProps): UseArticleCommentsReturn => {
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommentCount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the article ID directly
      const statsResponse = await commentApi.getCommentStats(article._id);
      
      if (statsResponse.success && statsResponse.data) {
        setCommentCount(statsResponse.data.totalComments || 0);
      } else {
        setCommentCount(0);
      }
    } catch (err) {
      console.error('Failed to load comment count:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comment count');
      setCommentCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [article._id]);

  const refreshCommentCount = useCallback(async () => {
    await loadCommentCount();
  }, [loadCommentCount]);

  // Load comment count on mount
  useEffect(() => {
    loadCommentCount();
  }, [loadCommentCount]);

  return {
    commentCount,
    isLoading,
    error,
    refreshCommentCount
  };
};
