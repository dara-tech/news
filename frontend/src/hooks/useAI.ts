import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface AIGenerationOptions {
  type: 'article' | 'summary' | 'headline' | 'description' | 'keywords' | 'translation';
  language?: string;
  tone?: 'professional' | 'casual' | 'formal' | 'friendly' | 'technical';
  length?: 'short' | 'medium' | 'long';
  style?: 'news' | 'blog' | 'academic' | 'creative';
  keywords?: string[];
  context?: string;
  maxWords?: number;
  temperature?: number; // 0.0 to 1.0
  model?: 'gemini-pro' | 'gemini-pro-vision' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
}

export interface AIGenerationRequest {
  prompt: string;
  options: AIGenerationOptions;
  sourceContent?: string;
  metadata?: {
    category?: string;
    tags?: string[];
    author?: string;
    targetAudience?: string;
  };
}

export interface AIGenerationResponse {
  content: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    language: string;
    confidence: number;
    model: string;
    timestamp: string;
    tokensUsed?: number;
    promptTokens?: number;
    responseTokens?: number;
  };
  suggestions?: {
    title?: string;
    keywords?: string[];
    tags?: string[];
    summary?: string;
  };
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  cost: number;
  lastUsed: string;
  dailyLimit: number;
  remainingRequests: number;
  geminiUsage?: {
    requestsToday: number;
    tokensToday: number;
    quotaRemaining: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
  provider: 'google';
}

// Gemini-specific models
export const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Best for text generation and analysis',
    capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation'],
    maxTokens: 30000,
    costPerToken: 0.0005, // $0.50 per 1M input tokens, $1.50 per 1M output tokens
    isAvailable: true,
    provider: 'google'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced model with longer context window',
    capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation', 'long-context'],
    maxTokens: 1000000,
    costPerToken: 0.00375, // $3.75 per 1M input tokens, $10.50 per 1M output tokens
    isAvailable: true,
    provider: 'google'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient for most tasks',
    capabilities: ['text-generation', 'text-analysis', 'summarization', 'translation'],
    maxTokens: 1000000,
    costPerToken: 0.000075, // $0.075 per 1M input tokens, $0.30 per 1M output tokens
    isAvailable: true,
    provider: 'google'
  }
];

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModel[]>(GEMINI_MODELS);
  const [generationHistory, setGenerationHistory] = useState<AIGenerationResponse[]>([]);

  // Generate content using Google Gemini
  const generateContent = useCallback(async (
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse | null> => {
    setIsGenerating(true);
    
    try {
      const { data } = await api.post('/api/ai/gemini/generate', {
        ...request,
        model: request.options.model || 'gemini-pro'
      });
      
      if (data?.success) {
        const response: AIGenerationResponse = data.response;
        
        // Add to history
        setGenerationHistory(prev => [response, ...prev.slice(0, 9)]); // Keep last 10
        
        toast.success('Content generated with Gemini');
        return response;
      } else {
        toast.error(data?.message || 'Failed to generate content with Gemini');
        return null;
      }
    } catch (error: any) {
      console.error('Gemini Generation error:', error);
      toast.error(error?.response?.data?.message || 'Failed to generate content with Gemini');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Generate article from source content using Gemini
  const generateArticle = useCallback(async (
    sourceContent: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    const request: AIGenerationRequest = {
      prompt: `Generate a well-written article based on the following source content. Make it engaging, informative, and suitable for publication. Use Gemini's capabilities to create high-quality, well-structured content.`,
      options: {
        type: 'article',
        tone: 'professional',
        length: 'medium',
        style: 'news',
        model: 'gemini-pro',
        ...options
      },
      sourceContent,
      metadata: {
        category: options.style || 'general',
        targetAudience: 'general'
      }
    };

    return generateContent(request);
  }, [generateContent]);

  // Generate summary from content using Gemini
  const generateSummary = useCallback(async (
    content: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    const request: AIGenerationRequest = {
      prompt: `Create a concise summary of the following content, highlighting the key points and main ideas. Use Gemini's summarization capabilities to extract the most important information.`,
      options: {
        type: 'summary',
        length: 'short',
        tone: 'professional',
        model: 'gemini-1.5-flash', // Use Flash for faster summaries
        ...options
      },
      sourceContent: content
    };

    return generateContent(request);
  }, [generateContent]);

  // Generate headlines using Gemini
  const generateHeadlines = useCallback(async (
    content: string,
    count: number = 3,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<string[]> => {
    const request: AIGenerationRequest = {
      prompt: `Generate ${count} compelling headlines for the following content. Make them engaging, SEO-friendly, and click-worthy. Use Gemini's creative capabilities to craft attention-grabbing titles.`,
      options: {
        type: 'headline',
        length: 'short',
        tone: 'professional',
        model: 'gemini-pro',
        ...options
      },
      sourceContent: content
    };

    const response = await generateContent(request);
    if (response) {
      // Split the response into individual headlines
      return response.content
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, count);
    }
    
    return [];
  }, [generateContent]);

  // Generate keywords using Gemini
  const generateKeywords = useCallback(async (
    content: string,
    count: number = 10,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<string[]> => {
    const request: AIGenerationRequest = {
      prompt: `Extract ${count} relevant keywords from the following content. Focus on SEO-friendly terms that accurately represent the main topics. Use Gemini's analysis capabilities to identify the most important keywords.`,
      options: {
        type: 'keywords',
        length: 'short',
        model: 'gemini-1.5-flash', // Use Flash for keyword extraction
        ...options
      },
      sourceContent: content
    };

    const response = await generateContent(request);
    if (response) {
      return response.content
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .slice(0, count);
    }
    
    return [];
  }, [generateContent]);

  // Translate content using Gemini
  const translateContent = useCallback(async (
    content: string,
    targetLanguage: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    const request: AIGenerationRequest = {
      prompt: `Translate the following content to ${targetLanguage}. Maintain the original tone, style, and meaning while ensuring natural flow in the target language. Use Gemini's multilingual capabilities for accurate translation.`,
      options: {
        type: 'translation',
        language: targetLanguage,
        model: 'gemini-pro',
        ...options
      },
      sourceContent: content
    };

    return generateContent(request);
  }, [generateContent]);

  // Get Gemini usage statistics
  const getUsageStats = useCallback(async (): Promise<AIUsageStats | null> => {
    setIsLoading(true);
    
    try {
      const { data } = await api.get('/api/ai/gemini/usage');
      
      if (data?.success) {
        setUsageStats(data.stats);
        return data.stats;
      } else {
        toast.error('Failed to fetch Gemini usage statistics');
        return null;
      }
    } catch (error: any) {
      console.error('Gemini usage stats error:', error);
      toast.error('Failed to fetch Gemini usage statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get available Gemini models
  const getAvailableModels = useCallback(async (): Promise<AIModel[]> => {
    setIsLoading(true);
    
    try {
      const { data } = await api.get('/api/ai/gemini/models');
      
      if (data?.success) {
        const models = data.models || GEMINI_MODELS;
        setAvailableModels(models);
        return models;
      } else {
        // Fallback to default Gemini models
        setAvailableModels(GEMINI_MODELS);
        return GEMINI_MODELS;
      }
    } catch (error: any) {
      console.error('Gemini models error:', error);
      // Fallback to default Gemini models
      setAvailableModels(GEMINI_MODELS);
      return GEMINI_MODELS;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate Gemini configuration
  const validateAIConfig = useCallback(async (): Promise<boolean> => {
    try {
      const { data } = await api.get('/api/ai/gemini/validate');
      return data?.success || false;
    } catch (error) {
      console.error('Gemini validation error:', error);
      return false;
    }
  }, []);

  // Clear generation history
  const clearHistory = useCallback(() => {
    setGenerationHistory([]);
  }, []);

  // Get generation history
  const getHistory = useCallback(() => {
    return generationHistory;
  }, [generationHistory]);

  // Check if Gemini is available
  const isAIAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const { data } = await api.get('/api/ai/gemini/status');
      return data?.success || false;
    } catch (error) {
      return false;
    }
  }, []);

  // Estimate Gemini generation cost
  const estimateCost = useCallback((contentLength: number, modelId: string = 'gemini-pro'): number => {
    const model = GEMINI_MODELS.find(m => m.id === modelId);
    if (!model) return 0;
    
    // Gemini pricing: input tokens + output tokens
    const estimatedInputTokens = Math.ceil(contentLength / 4); // rough estimation
    const estimatedOutputTokens = Math.ceil(contentLength / 3); // output is usually longer
    
    const inputCost = (estimatedInputTokens / 1000000) * model.costPerToken;
    const outputCost = (estimatedOutputTokens / 1000000) * (model.costPerToken * 3); // output costs more
    
    return inputCost + outputCost;
  }, []);

  // Gemini-specific functions
  const generateWithGeminiPro = useCallback(async (
    prompt: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    return generateContent({
      prompt,
      options: { 
        type: 'article',
        ...options, 
        model: 'gemini-pro' 
      }
    });
  }, [generateContent]);

  const generateWithGeminiFlash = useCallback(async (
    prompt: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    return generateContent({
      prompt,
      options: { 
        type: 'article',
        ...options, 
        model: 'gemini-1.5-flash' 
      }
    });
  }, [generateContent]);

  const generateWithGeminiProVision = useCallback(async (
    prompt: string,
    imageUrl: string,
    options: Partial<AIGenerationOptions> = {}
  ): Promise<AIGenerationResponse | null> => {
    const request: AIGenerationRequest = {
      prompt,
      options: { 
        type: 'article',
        ...options, 
        model: 'gemini-pro-vision' 
      },
      metadata: {
        category: 'vision-analysis'
      }
    };

    return generateContent(request);
  }, [generateContent]);

  return {
    // State
    isGenerating,
    isLoading,
    usageStats,
    availableModels,
    generationHistory,

    // Core functions
    generateContent,
    generateArticle,
    generateSummary,
    generateHeadlines,
    generateKeywords,
    translateContent,

    // Gemini-specific functions
    generateWithGeminiPro,
    generateWithGeminiFlash,
    generateWithGeminiProVision,

    // Utility functions
    getUsageStats,
    getAvailableModels,
    validateAIConfig,
    clearHistory,
    getHistory,
    isAIAvailable,
    estimateCost
  };
};

// Specialized hooks for specific use cases
export const useArticleGenerator = () => {
  const ai = useAI();
  
  return {
    ...ai,
    generateArticle: ai.generateArticle,
    generateHeadlines: ai.generateHeadlines,
    generateKeywords: ai.generateKeywords
  };
};

export const useContentOptimizer = () => {
  const ai = useAI();
  
  return {
    ...ai,
    generateSummary: ai.generateSummary,
    generateKeywords: ai.generateKeywords,
    generateHeadlines: ai.generateHeadlines
  };
};

export const useTranslator = () => {
  const ai = useAI();
  
  return {
    ...ai,
    translateContent: ai.translateContent
  };
};

// Gemini-specific specialized hooks
export const useGeminiPro = () => {
  const ai = useAI();
  
  return {
    ...ai,
    generateContent: ai.generateWithGeminiPro
  };
};

export const useGeminiFlash = () => {
  const ai = useAI();
  
  return {
    ...ai,
    generateContent: ai.generateWithGeminiFlash
  };
};

export const useGeminiVision = () => {
  const ai = useAI();
  
  return {
    ...ai,
    generateContent: ai.generateWithGeminiProVision
  };
};
