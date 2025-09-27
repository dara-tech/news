'use client';

import { useState, useEffect, useCallback } from 'react';
import { likeApi, type LikeStatus } from '@/lib/likeApi';
import { resolveArticleIdCached } from '@/lib/articleResolver';
import type { Article } from '@/types';

interface UseArticleLikesProps {
  article: Article;
  locale: 'en' | 'kh';
  initialCount?: number;
  initialLiked?: boolean;
}

interface UseArticleLikesReturn {
  likeCount: number;
  isLiked: boolean;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
  error: string | null;
}

export const useArticleLikes = ({ 
  article, 
  locale,
  initialCount = 0, 
  initialLiked = false 
}: UseArticleLikesProps): UseArticleLikesReturn => {
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);

  // Resolve article slug to ID on mount
  useEffect(() => {
    const resolveId = async () => {
      if (!article?.slug) return;
      
      try {
        const id = await resolveArticleIdCached(article.slug, locale);
        setArticleId(id);
      } catch (err) {
        console.error('Error resolving article ID:', err);
        setError('Failed to resolve article');
      }
    };

    resolveId();
  }, [article?.slug, locale]);

  // Load like status when article ID is available
  useEffect(() => {
    const loadLikeStatus = async () => {
      if (!articleId) {
        console.log('useArticleLikes: No articleId available yet');
        return;
      }
      
      console.log('useArticleLikes: Loading like status for articleId:', articleId);
      
      try {
        // First try to get full status (for authenticated users)
        const status = await likeApi.getLikeStatus(articleId);
        console.log('useArticleLikes: Full status loaded:', status);
        setLikeCount(status.count);
        setIsLiked(status.hasLiked);
      } catch (err) {
        console.warn('Could not load full like status, trying public endpoint:', err);
        try {
          // Fallback to public endpoint for unauthenticated users
          const count = await likeApi.getLikeCount(articleId);
          console.log('useArticleLikes: Public count loaded:', count);
          setLikeCount(count);
          setIsLiked(false); // Always false for unauthenticated users
        } catch (publicErr) {
          console.error('Error loading like count:', publicErr);
          setError('Failed to load like count');
        }
      }
    };

    loadLikeStatus();
  }, [articleId]);

  const toggleLike = useCallback(async () => {
    if (!articleId || isLoading) return;

    // Check if user is authenticated
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // Redirect to register page for unauthenticated users
      window.location.href = `/${locale}/register`;
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Optimistic update
    const previousCount = likeCount;
    const previousLiked = isLiked;
    
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(prev => !prev);

    try {
      const response = await likeApi.toggleLike(articleId);
      if (response.success) {
        setLikeCount(response.liked ? previousCount + 1 : previousCount - 1);
        setIsLiked(response.liked || false);
      } else {
        // Revert optimistic update on failure
        setLikeCount(previousCount);
        setIsLiked(previousLiked);
        setError('Failed to update like');
      }
    } catch (err) {
      // Revert optimistic update on error
      setLikeCount(previousCount);
      setIsLiked(previousLiked);
      setError('Failed to update like');
      console.error('Error toggling like:', err);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, isLoading, likeCount, isLiked]);

  return {
    likeCount,
    isLiked,
    isLoading,
    toggleLike,
    error
  };
};
