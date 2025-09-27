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
  threshold = 0.1,
  rootMargin = '100px'
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [data, setData] = useState<Article[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      console.log('Load more skipped:', { loading, hasMore });
      return;
    }

    console.log('Loading more articles, page:', page + 1);
    setLoading(true);
    setError(null);

    try {
      const newData = await fetchMore(page + 1);
      console.log('Fetched new data:', newData.length, 'articles');
      
      if (newData.length === 0) {
        console.log('No more data available, setting hasMore to false');
        setHasMore(false);
      } else {
        setData(prev => {
          const updated = [...prev, ...newData];
          console.log('Updated data length:', updated.length);
          return updated;
        });
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error loading more articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more articles');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchMore]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(initialHasMore);

    try {
      const newData = await fetchMore(1);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh articles');
      console.error('Error refreshing articles:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, initialHasMore]);

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
  }, [loadMore, loading, hasMore, threshold, rootMargin]);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialData, initialHasMore]);

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