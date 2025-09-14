import { useState, useEffect, useCallback } from 'react';
import { likeApi } from '@/lib/likeApi';

interface UseLikeOptions {
  newsId: string;
  initialLikes?: number;
  initialLiked?: boolean;
  autoLoad?: boolean;
  onLikeChange?: (liked: boolean, newCount: number) => void;
}

interface UseLikeReturn {
  isLiked: boolean;
  likeCount: number;
  isLoading: boolean;
  isAnimating: boolean;
  toggleLike: () => Promise<void>;
  like: () => Promise<void>;
  unlike: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function useLike({
  newsId,
  initialLikes = 0,
  initialLiked = false,
  autoLoad = true,
  onLikeChange,
}: UseLikeOptions): UseLikeReturn {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load initial like status from backend
  useEffect(() => {
    if (autoLoad && newsId) {
      const loadLikeStatus = async () => {
        try {
          const status = await likeApi.getLikeStatus(newsId);
          setIsLiked(status.hasLiked);
          setLikeCount(status.count || 0);
        } catch (error) {// Fallback to initial values if API fails
          setIsLiked(initialLiked);
          setLikeCount(initialLikes || 0);
        }
      };
      
      loadLikeStatus();
    }
  }, [newsId, autoLoad, initialLiked, initialLikes]);

  const refreshStatus = useCallback(async () => {
    if (!newsId) return;
    
    try {
      const status = await likeApi.getLikeStatus(newsId);
      setIsLiked(status.hasLiked);
      setLikeCount(status.count);
    } catch (error) {}
  }, [newsId]);

  const toggleLike = useCallback(async () => {
    if (!newsId || isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);
    
    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? (likeCount || 0) + 1 : Math.max(0, (likeCount || 0) - 1);
    
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      // Call backend API
      const response = await likeApi.toggleLike(newsId);
      
      // Update with actual response data
      if (response.success) {
        setIsLiked(response.liked || newLiked);
        // If we have the actual count from backend, use it
        if (response.count !== undefined) {
          setLikeCount(response.count);
        }
      }

      // Call the callback if provided
      if (onLikeChange) {
        await onLikeChange(newLiked, newCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount(newLiked ? Math.max(0, newCount - 1) : newCount + 1);throw error;
    } finally {
      setIsLoading(false);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [newsId, isLoading, isLiked, likeCount, onLikeChange]);

  const like = useCallback(async () => {
    if (!newsId || isLoading || isLiked) return;

    setIsLoading(true);
    setIsAnimating(true);
    
    // Optimistic update
    const newCount = likeCount + 1;
    setIsLiked(true);
    setLikeCount(newCount);

    try {
      // Call backend API
      const response = await likeApi.likeNews(newsId);
      
      // Update with actual response data
      if (response.success && response.count !== undefined) {
        setLikeCount(response.count);
      }

      // Call the callback if provided
      if (onLikeChange) {
        await onLikeChange(true, newCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(false);
      setLikeCount(likeCount);throw error;
    } finally {
      setIsLoading(false);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [newsId, isLoading, isLiked, likeCount, onLikeChange]);

  const unlike = useCallback(async () => {
    if (!newsId || isLoading || !isLiked) return;

    setIsLoading(true);
    setIsAnimating(true);
    
    // Optimistic update
    const newCount = likeCount - 1;
    setIsLiked(false);
    setLikeCount(newCount);

    try {
      // Call backend API
      const response = await likeApi.unlikeNews(newsId);
      
      // Update with actual response data
      if (response.success && response.count !== undefined) {
        setLikeCount(response.count);
      }

      // Call the callback if provided
      if (onLikeChange) {
        await onLikeChange(false, newCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(true);
      setLikeCount(likeCount);throw error;
    } finally {
      setIsLoading(false);
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [newsId, isLoading, isLiked, likeCount, onLikeChange]);

  return {
    isLiked,
    likeCount,
    isLoading,
    isAnimating,
    toggleLike,
    like,
    unlike,
    refreshStatus,
  };
} 