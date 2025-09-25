'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  RefreshCw,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
    name: string | { en: string; kh: string };
  };
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  recommendationScore: number;
  recommendationType: string;
  slug: string;
}

interface RecommendationWidgetProps {
  type?: 'for-you' | 'trending' | 'explore';
  limit?: number;
  language?: 'en' | 'kh';
  showHeader?: boolean;
  className?: string;
  onArticleClick?: (article: RecommendationItem) => void;
}

export default function RecommendationWidget({
  type = 'for-you',
  limit = 6,
  language = 'en',
  showHeader = true,
  className = '',
  onArticleClick
}: RecommendationWidgetProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!user && type !== 'trending' && type !== 'explore') {
      setError('Please log in to view personalized recommendations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      const params = new URLSearchParams();

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
      }

      params.append('limit', limit.toString());
      params.append('language', language);

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data.recommendations || []);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const trackBehavior = async (action: string, data: any) => {
    // Tracking disabled to prevent network connection errors
    // if (!user) return;
    // ... tracking code disabled
  };

  const handleArticleClick = async (article: RecommendationItem) => {
    await trackBehavior('read_article', { 
      articleId: article._id,
      timestamp: new Date()
    });
    
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      // Default behavior - navigate to article
      window.location.href = `/article/${article.slug}`;
    }
  };

  const handleInteraction = async (articleId: string, action: string) => {
    await trackBehavior(action, { articleId });
    
    if (action === 'like') {
      toast.success('Added to your interests!');
    } else if (action === 'dislike') {
      toast.success('We\'ll show you less content like this');
    } else if (action === 'save') {
      toast.success('Article saved!');
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [type, limit, language, user]);

  const getTypeIcon = () => {
    switch (type) {
      case 'for-you':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'explore':
        return <Eye className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'for-you':
        return 'For You';
      case 'trending':
        return 'Trending Now';
      case 'explore':
        return 'Explore';
      default:
        return 'Recommendations';
    }
  };

  const getCategoryName = (category: { name: string | { en: string; kh: string } }) => {
    if (typeof category.name === 'string') {
      return category.name;
    }
    return language === 'kh' ? category.name.kh : category.name.en;
  };

  if (loading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              {getTypeIcon()}
              <span>{getTypeTitle()}</span>
            </h3>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              {getTypeIcon()}
              <span>{getTypeTitle()}</span>
            </h3>
          </div>
        )}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button size="sm" onClick={fetchRecommendations}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="mb-4">
            <h3 className="font-semibold text-lg flex items-center space-x-2">
              {getTypeIcon()}
              <span>{getTypeTitle()}</span>
            </h3>
          </div>
        )}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No recommendations available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            {getTypeIcon()}
            <span>{getTypeTitle()}</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {recommendations.map((article, index) => (
          <div
            key={article._id}
            className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 transition-colors"
            onClick={() => handleArticleClick(article)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryName(article.category)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                  </span>
                </div>
                
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {language === 'kh' ? article.title.kh : article.title.en}
                </h3>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {language === 'kh' ? article.description.kh : article.description.en}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{article.author.name}</span>
                    <span>•</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(article._id, 'like');
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction(article._id, 'save');
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Bookmark className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
