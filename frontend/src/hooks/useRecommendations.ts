'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RecommendationItem {
  _id: string;
  title: {
    en: string;
    kh: string;
  };
  description: {
    en: string;
    kh: string;
  };
  thumbnail?: string;
  publishedAt: string;
  views: number;
  category: {
    _id: string;
    name: string;
  };
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  qualityAssessment?: {
    overallScore: number;
  };
  tags?: string[];
  recommendationScore: number;
  recommendationType: string;
  slug: string;
}

interface RecommendationMetadata {
  userId?: string;
  generatedAt: string;
  algorithm: string;
  factors?: string[];
  sources?: {
    personalized: number;
    trending: number;
    breaking: number;
    categories: number;
  };
}

interface RecommendationData {
  success: boolean;
  message?: string;
  data: {
    recommendations: RecommendationItem[];
    metadata: RecommendationMetadata;
  };
}

interface RecommendationFilters {
  limit: number;
  language: 'en' | 'kh';
  categories: string[];
  tags: string[];
  timeRange: 'today' | 'week' | 'month' | 'all';
  excludeRead: boolean;
  includeBreaking: boolean;
}

interface UseRecommendationsOptions {
  type: 'for-you' | 'trending' | 'explore' | 'similar';
  articleId?: string;
  autoFetch?: boolean;
  initialFilters?: Partial<RecommendationFilters>;
}

export function useRecommendations({
  type,
  articleId,
  autoFetch = true,
  initialFilters = {}
}: UseRecommendationsOptions) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({
    limit: 12,
    language: 'en',
    categories: [],
    tags: [],
    timeRange: 'all',
    excludeRead: true,
    includeBreaking: true,
    ...initialFilters
  });

  const fetchRecommendations = useCallback(async () => {
    if (!user && type !== 'trending' && type !== 'explore') {
      setError('Please log in to view personalized recommendations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      let endpoint = '';

      switch (type) {
        case 'for-you':
          endpoint = '/api/recommendations/for-you';
          break;
        case 'trending':
          endpoint = '/api/recommendations/trending';
          params.append('timeRange', '24h');
          break;
        case 'explore':
          endpoint = '/api/recommendations/explore';
          break;
        case 'similar':
          if (!articleId) {
            setError('Article ID is required for similar content');
            return;
          }
          endpoint = `/api/recommendations/similar/${articleId}`;
          break;
      }

      params.append('limit', filters.limit.toString());
      params.append('language', filters.language);
      
      if (filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data: RecommendationData = await response.json();
      
      if (data.success) {
        setRecommendations(data.data.recommendations || []);
        setMetadata(data.data.metadata || null);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [type, filters, user, articleId]);

  const trackBehavior = useCallback(async (action: string, data: any) => {
    // Tracking disabled to prevent network connection errors
    // if (!user) return;
    // ... tracking code disabled
  }, [user]);

  const submitFeedback = useCallback(async (articleId: string, feedback: 'like' | 'dislike' | 'not_interested' | 'save', reason?: string) => {
    if (!user) return;

    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          feedback,
          reason,
          timestamp: new Date()
        }),
      });
    } catch (err) {}
  }, [user]);

  const getInsights = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await fetch(`/api/recommendations/ai-insights?language=${filters.language}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : null;
      }
    } catch (err) {}
    
    return null;
  }, [user, filters.language]);

  const updateFilters = useCallback((newFilters: Partial<RecommendationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, autoFetch]);

  return {
    recommendations,
    metadata,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    trackBehavior,
    submitFeedback,
    getInsights
  };
}

export type { RecommendationItem, RecommendationMetadata, RecommendationFilters };

