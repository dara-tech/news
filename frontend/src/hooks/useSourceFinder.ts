import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface SourceFinderOptions {
  category?: 'news' | 'academic' | 'blog' | 'social' | 'government' | 'all';
  language?: string;
  region?: string;
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  credibility?: 'high' | 'medium' | 'low' | 'all';
  contentType?: 'article' | 'research' | 'report' | 'video' | 'podcast' | 'all';
  maxResults?: number;
  includePaywall?: boolean;
  sortBy?: 'relevance' | 'date' | 'credibility' | 'popularity';
}

export interface SourceSuggestion {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'rss' | 'api' | 'scraper' | 'manual';
  category: 'local' | 'international' | 'tech' | 'development' | 'academic' | 'government';
  credibility: 'high' | 'medium' | 'low';
  language: string;
  region?: string;
  lastUpdated?: string;
  frequency?: string;
  tags: string[];
  relevanceScore: number;
  metadata?: {
    domain?: string;
    favicon?: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    };
    contact?: {
      email?: string;
      phone?: string;
    };
  };
}

export interface SourceFinderRequest {
  context: string;
  keywords?: string[];
  topics?: string[];
  requirements?: string[];
  options: SourceFinderOptions;
}

export interface SourceFinderResponse {
  suggestions: SourceSuggestion[];
  metadata: {
    totalFound: number;
    searchTime: number;
    query: string;
    filters: SourceFinderOptions;
    timestamp: string;
  };
  recommendations?: {
    bestSources: string[];
    alternativeKeywords: string[];
    relatedTopics: string[];
  };
}

export interface SourceAnalysis {
  sourceId: string;
  analysis: {
    contentQuality: number; // 0-100
    updateFrequency: string;
    topicCoverage: string[];
    credibilityFactors: string[];
    audience: string;
    bias: 'neutral' | 'left' | 'right' | 'unknown';
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: string[];
}

export const useSourceFinder = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SourceFinderResponse[]>([]);
  const [favoriteSources, setFavoriteSources] = useState<SourceSuggestion[]>([]);

  // Find sources based on context
  const findSources = useCallback(async (
    request: SourceFinderRequest
  ): Promise<SourceFinderResponse | null> => {
    setIsSearching(true);
    
    try {
      const { data } = await api.post('/api/ai/sources/find', request);
      
      if (data?.success) {
        const response: SourceFinderResponse = data.response;
        
        // Add to search history
        setSearchHistory(prev => [response, ...prev.slice(0, 9)]); // Keep last 10
        
        toast.success(`Found ${response.suggestions.length} relevant sources`);
        return response;
      } else {
        toast.error(data?.message || 'Failed to find sources');
        return null;
      }
    } catch (error: any) {
      console.error('Source finder error:', error);
      toast.error(error?.response?.data?.message || 'Failed to find sources');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Find sources by topic
  const findSourcesByTopic = useCallback(async (
    topic: string,
    options: Partial<SourceFinderOptions> = {}
  ): Promise<SourceFinderResponse | null> => {
    const request: SourceFinderRequest = {
      context: `Find reliable sources for information about ${topic}`,
      topics: [topic],
      options: {
        category: 'all',
        credibility: 'high',
        maxResults: 20,
        sortBy: 'relevance',
        ...options
      }
    };

    return findSources(request);
  }, [findSources]);

  // Find sources by keywords
  const findSourcesByKeywords = useCallback(async (
    keywords: string[],
    options: Partial<SourceFinderOptions> = {}
  ): Promise<SourceFinderResponse | null> => {
    const request: SourceFinderRequest = {
      context: `Find sources that cover these keywords: ${keywords.join(', ')}`,
      keywords,
      options: {
        category: 'all',
        maxResults: 15,
        sortBy: 'relevance',
        ...options
      }
    };

    return findSources(request);
  }, [findSources]);

  // Find sources for specific content type
  const findSourcesForContent = useCallback(async (
    contentDescription: string,
    contentType: string,
    options: Partial<SourceFinderOptions> = {}
  ): Promise<SourceFinderResponse | null> => {
    const request: SourceFinderRequest = {
      context: `Find sources for creating ${contentType} about: ${contentDescription}`,
      requirements: [`${contentType} content`, 'reliable information', 'current data'],
      options: {
        contentType: 'all',
        credibility: 'high',
        maxResults: 25,
        sortBy: 'relevance',
        ...options
      }
    };

    return findSources(request);
  }, [findSources]);

  // Find local sources
  const findLocalSources = useCallback(async (
    region: string,
    topics?: string[],
    options: Partial<SourceFinderOptions> = {}
  ): Promise<SourceFinderResponse | null> => {
    const request: SourceFinderRequest = {
      context: `Find local news and information sources for ${region}`,
      topics: topics || ['local news', 'community events', 'regional developments'],
      options: {
        category: 'news',
        region,
        credibility: 'medium',
        maxResults: 20,
        sortBy: 'relevance',
        ...options
      }
    };

    return findSources(request);
  }, [findSources]);

  // Find academic sources
  const findAcademicSources = useCallback(async (
    researchTopic: string,
    options: Partial<SourceFinderOptions> = {}
  ): Promise<SourceFinderResponse | null> => {
    const request: SourceFinderRequest = {
      context: `Find academic and research sources for: ${researchTopic}`,
      topics: [researchTopic, 'research', 'academic studies'],
      requirements: ['peer-reviewed', 'academic credibility', 'research methodology'],
      options: {
        category: 'academic',
        credibility: 'high',
        contentType: 'research',
        maxResults: 30,
        sortBy: 'credibility',
        ...options
      }
    };

    return findSources(request);
  }, [findSources]);

  // Analyze a specific source
  const analyzeSource = useCallback(async (
    sourceId: string
  ): Promise<SourceAnalysis | null> => {
    setIsAnalyzing(true);
    
    try {
      const { data } = await api.post('/api/ai/sources/analyze', { sourceId });
      
      if (data?.success) {
        toast.success('Source analysis completed');
        return data.analysis;
      } else {
        toast.error(data?.message || 'Failed to analyze source');
        return null;
      }
    } catch (error: any) {
      console.error('Source analysis error:', error);
      toast.error(error?.response?.data?.message || 'Failed to analyze source');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Validate source URL
  const validateSource = useCallback(async (
    url: string
  ): Promise<{
    isValid: boolean;
    type?: string;
    category?: string;
    credibility?: string;
    issues?: string[];
  } | null> => {
    try {
      const { data } = await api.post('/api/ai/sources/validate', { url });
      
      if (data?.success) {
        return data.validation;
      } else {
        toast.error(data?.message || 'Failed to validate source');
        return null;
      }
    } catch (error: any) {
      console.error('Source validation error:', error);
      toast.error('Failed to validate source');
      return null;
    }
  }, []);

  // Get source recommendations
  const getRecommendations = useCallback(async (
    currentSources: string[],
    context: string
  ): Promise<{
    suggestedSources: SourceSuggestion[];
    alternativeSources: SourceSuggestion[];
    relatedTopics: string[];
  } | null> => {
    try {
      const { data } = await api.post('/api/ai/sources/recommendations', {
        currentSources,
        context
      });
      
      if (data?.success) {
        return data.recommendations;
      } else {
        toast.error(data?.message || 'Failed to get recommendations');
        return null;
      }
    } catch (error: any) {
      console.error('Recommendations error:', error);
      toast.error('Failed to get recommendations');
      return null;
    }
  }, []);

  // Add source to favorites
  const addToFavorites = useCallback((source: SourceSuggestion) => {
    setFavoriteSources(prev => {
      const exists = prev.find(s => s.id === source.id);
      if (!exists) {
        toast.success('Source added to favorites');
        return [...prev, source];
      }
      return prev;
    });
  }, []);

  // Remove source from favorites
  const removeFromFavorites = useCallback((sourceId: string) => {
    setFavoriteSources(prev => {
      const filtered = prev.filter(s => s.id !== sourceId);
      toast.success('Source removed from favorites');
      return filtered;
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    toast.success('Search history cleared');
  }, []);

  // Get search history
  const getHistory = useCallback(() => {
    return searchHistory;
  }, [searchHistory]);

  // Get favorite sources
  const getFavorites = useCallback(() => {
    return favoriteSources;
  }, [favoriteSources]);

  return {
    // State
    isSearching,
    isAnalyzing,
    searchHistory,
    favoriteSources,

    // Core functions
    findSources,
    findSourcesByTopic,
    findSourcesByKeywords,
    findSourcesForContent,
    findLocalSources,
    findAcademicSources,

    // Analysis functions
    analyzeSource,
    validateSource,
    getRecommendations,

    // Management functions
    addToFavorites,
    removeFromFavorites,
    clearHistory,
    getHistory,
    getFavorites
  };
};

// Specialized hooks for specific use cases
export const useNewsSourceFinder = () => {
  const finder = useSourceFinder();
  
  return {
    ...finder,
    findNewsSources: (topic: string, region?: string) => 
      finder.findSourcesByTopic(topic, { 
        category: 'news', 
        region,
        timeRange: 'week',
        sortBy: 'date'
      }),
    findBreakingNewsSources: (region?: string) =>
      finder.findSourcesByTopic('breaking news', {
        category: 'news',
        region,
        timeRange: 'today',
        sortBy: 'date'
      })
  };
};

export const useAcademicSourceFinder = () => {
  const finder = useSourceFinder();
  
  return {
    ...finder,
    findResearchSources: (topic: string) =>
      finder.findAcademicSources(topic, {
        category: 'academic',
        credibility: 'high',
        sortBy: 'credibility'
      }),
    findPeerReviewedSources: (topic: string) =>
      finder.findAcademicSources(topic, {
        category: 'academic',
        credibility: 'high',
        contentType: 'research'
      })
  };
};

export const useLocalSourceFinder = () => {
  const finder = useSourceFinder();
  
  return {
    ...finder,
    findLocalNewsSources: (region: string) =>
      finder.findLocalSources(region, ['local news', 'community events'], {
        category: 'news',
        region,
        credibility: 'medium'
      }),
    findRegionalSources: (region: string, topics: string[]) =>
      finder.findLocalSources(region, topics, {
        category: 'all',
        region
      })
  };
};
