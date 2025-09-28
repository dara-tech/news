'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Article } from '@/types';

interface UseInfiniteScrollOptions {
  initialData: Article[];
  fetchMore: (page: number) => Promise<Article[]>;
  hasMore?: boolean;
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  data: Article[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadingRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll({
  initialData,
  fetchMore,
  hasMore: initialHasMore = true,
  threshold = 0.01, // More sensitive threshold
  rootMargin = '200px' // Increased rootMargin for easier triggering
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [data, setData] = useState<Article[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // Always true for infinite scroll
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const newData = await fetchMore(page + 1);
      
      if (newData.length === 0) {
        // Just continue without setting hasMore to false
        // The infinite scroll will keep trying
      } else {
        setData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more articles');
      // Don't stop infinite scroll on errors
    } finally {
      setLoading(false);
    }
  }, [loading, page, fetchMore]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true); // Always true for infinite scroll

    try {
      const newData = await fetchMore(1);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh articles');
      console.error('Error refreshing articles:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMore]);

  // Set up intersection observer
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, threshold, rootMargin]);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true); // Always true for infinite scroll
  }, [initialData]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    loadingRef
  };
}