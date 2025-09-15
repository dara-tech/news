'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import NewsCard from '@/components/news/NewsCard';
import { RecommendationInsights } from './RecommendationInsights';
import { RecommendationFilters } from './RecommendationFilters';

interface RecommendationItem {
  _id: string;
  title: {
    en: string;
    km: string;
  };
  description: {
    en: string;
    km: string;
  };
  thumbnail?: string;
  publishedAt: string;
  views: number;
  category: {
    _id: string;
    name: string | { en: string; km: string };
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
  recommendationType: 'behavior-based' | 'content-based' | 'trending' | 'quality-based' | 'similar-content' | 'category-based' | 'explore-diverse' | 'breaking-news' | 'popular' | 'fallback';
  similarityScore?: number;
  sources?: string[];
  combinedScore?: number;
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

interface RecommendationEngineProps {
  initialTab?: 'for-you' | 'trending' | 'explore' | 'similar';
  articleId?: string; // For similar content recommendations
  className?: string;
}

export default function RecommendationEngine({ 
  initialTab = 'for-you', 
  articleId,
  className = '' 
}: RecommendationEngineProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    limit: 12,
    language: 'en',
    categories: [] as string[],
    tags: [] as string[],
    authors: [] as string[],
    timeRange: 'all' as 'today' | 'week' | 'month' | 'year' | 'all',
    excludeRead: true,
    includeBreaking: true,
    minViews: 0,
    maxViews: 1000000,
    minRating: 0,
    sortBy: 'relevance' as 'relevance' | 'date' | 'views' | 'rating' | 'trending',
    contentType: 'all' as 'all' | 'articles' | 'videos' | 'podcasts',
    readingTime: [1, 60] as number[],
    savedOnly: false,
    verifiedAuthorsOnly: false,
    premiumContent: false,
    searchQuery: ''
  });
  const [insights, setInsights] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch recommendations based on active tab
  const fetchRecommendations = useCallback(async () => {
    if (!user && (activeTab === 'for-you' || activeTab === 'similar')) {
      // Switch to trending tab for non-logged-in users
      setActiveTab('trending');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      const params = new URLSearchParams();

      switch (activeTab) {
        case 'for-you':
          endpoint = '/api/recommendations/for-you';
          params.append('limit', filters.limit.toString());
          params.append('language', filters.language);
          break;
        case 'trending':
          endpoint = '/api/recommendations/trending';
          params.append('limit', filters.limit.toString());
          params.append('language', filters.language);
          params.append('timeRange', '24h');
          break;
        case 'explore':
          endpoint = '/api/recommendations/explore';
          params.append('limit', filters.limit.toString());
          params.append('language', filters.language);
          if (filters.categories.length > 0) {
            params.append('categories', filters.categories.join(','));
          }
          break;
        case 'similar':
          if (!articleId) {
            setError('Article ID is required for similar content');
            return;
          }
          endpoint = `/api/recommendations/similar/${articleId}`;
          params.append('limit', filters.limit.toString());
          params.append('language', filters.language);
          break;
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view personalized recommendations');
          return;
        }
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
  }, [activeTab, filters, user, articleId]);

  // Fetch user insights
  const fetchInsights = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/recommendations/ai-insights?language=${filters.language}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInsights(data.data);
        }
      } else if (response.status === 401) {
        // User not authenticated, skip insights
      }
    } catch (err) {}
  }, [user, filters.language]);

  // Track user behavior
  const trackBehavior = useCallback(async (action: string, data: any) => {
    if (!user) return;

    try {
      await fetch('/api/recommendations/track-behavior', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });
    } catch (err) {}
  }, [user]);

  // Handle article interaction
  const handleArticleInteraction = useCallback(async (articleId: string, action: string, data?: any) => {
    await trackBehavior(action, { articleId, ...data });
    
    // Update local state for immediate feedback
    if (action === 'like') {
      toast.success('Added to your interests!');
    } else if (action === 'dislike') {
      toast.success('We\'ll show you less content like this');
    } else if (action === 'save') {
      toast.success('Article saved!');
    }
  }, [trackBehavior]);

  // Load recommendations on mount and when filters change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Load insights when user changes
  useEffect(() => {
    if (user && activeTab === 'for-you') {
      fetchInsights();
    }
  }, [user, activeTab, fetchInsights]);

  const getRecommendationTypeIcon = (type: string) => {
    switch (type) {
      case 'behavior-based':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'content-based':
        return <Bookmark className="h-4 w-4 text-green-500" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'quality-based':
        return <ThumbsUp className="h-4 w-4 text-purple-500" />;
      case 'similar-content':
        return <RefreshCw className="h-4 w-4 text-indigo-500" />;
      case 'breaking-news':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationTypeLabel = (type: string) => {
    switch (type) {
      case 'behavior-based':
        return 'Based on your reading';
      case 'content-based':
        return 'Similar content';
      case 'trending':
        return 'Trending now';
      case 'quality-based':
        return 'High quality';
      case 'similar-content':
        return 'Similar articles';
      case 'breaking-news':
        return 'Breaking news';
      case 'explore-diverse':
        return 'Explore';
      default:
        return 'Recommended';
    }
  };

  const renderRecommendationCard = (article: RecommendationItem, index: number) => (
    <div key={article._id} className="relative group">
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getRecommendationTypeIcon(article.recommendationType)}
              <Badge variant="secondary" className="text-xs">
                {getRecommendationTypeLabel(article.recommendationType)}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArticleInteraction(article._id, 'like')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArticleInteraction(article._id, 'dislike')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArticleInteraction(article._id, 'save')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {filters.language === 'km' ? article.title.km : article.title.en}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {filters.language === 'km' ? article.description.km : article.description.en}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>{filters.language === 'km' ? (article.category.name as { km: string }).km : (article.category.name as { en: string }).en}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article.views.toLocaleString()}</span>
            </div>
          </div>

          {article.recommendationScore && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span>Relevance</span>
                <span>{Math.round(article.recommendationScore)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${article.recommendationScore}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
          <p className="text-muted-foreground">
            Discover content tailored to your interests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <RecommendationFilters
          filters={filters as any}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="for-you" disabled={!user}>
            <Sparkles className="h-4 w-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="explore">
            <Eye className="h-4 w-4 mr-2" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="similar" disabled={!articleId}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Similar
          </TabsTrigger>
        </TabsList>

        {/* For You Tab */}
        <TabsContent value="for-you" className="space-y-6">
          {insights ? (
            <RecommendationInsights insights={insights} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  AI insights are being generated based on your reading patterns. 
                  Keep reading to see personalized recommendations!
                </p>
              </CardContent>
            </Card>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-3 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded"></div>
                      <div className="h-3 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchRecommendations}>Try Again</Button>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((article, index) => renderRecommendationCard(article, index))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recommendations available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start reading articles to get personalized recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-3 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded"></div>
                      <div className="h-3 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchRecommendations}>Try Again</Button>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((article, index) => renderRecommendationCard(article, index))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No trending content available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-3 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded"></div>
                      <div className="h-3 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchRecommendations}>Try Again</Button>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((article, index) => renderRecommendationCard(article, index))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No content to explore</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Similar Tab */}
        <TabsContent value="similar" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-3 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 rounded"></div>
                      <div className="h-3 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchRecommendations}>Try Again</Button>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((article, index) => renderRecommendationCard(article, index))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No similar content found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      {metadata && (
        <div className="text-xs text-muted-foreground text-center">
          Generated {formatDistanceToNow(new Date(metadata.generatedAt), { addSuffix: true })} using {metadata.algorithm} algorithm
        </div>
      )}
    </div>
  );
}