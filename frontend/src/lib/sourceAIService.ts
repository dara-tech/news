// AI-powered source generation service for news sources and RSS feeds
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with error handling
let genAI: GoogleGenerativeAI | null = null;

try {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  genAI = null;
}

// Rate limiting configuration for source generation
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 5, // Very conservative for source generation
  maxRequestsPerHour: 30,
  retryDelay: 3000, // 3 seconds
  maxRetries: 3 // More retries for overloaded model errors
};

// Rate limiting state
let requestCount = 0;
let lastRequestTime = 0;
let hourlyRequestCount = 0;
let lastHourReset = Date.now();

// Service health tracking
let consecutiveFailures = 0;
let lastFailureTime = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
const FAILURE_RESET_TIME = 5 * 60 * 1000; // 5 minutes

// Source generation interfaces
export interface SourceGenerationOptions {
  category?: string;
  language?: string;
  region?: string;
  quality?: 'high' | 'medium' | 'low';
  count?: number;
  includeRSS?: boolean;
  includeWebsites?: boolean;
  includeSocial?: boolean;
}

export interface GeneratedSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'website' | 'social' | 'api';
  category: string;
  language: string;
  region: string;
  description: string;
  reliability: 'high' | 'medium' | 'low';
  lastChecked?: string;
  status: 'active' | 'inactive' | 'unknown';
  tags: string[];
  metadata: {
    frequency?: string;
    format?: string;
    lastArticle?: string;
    articleCount?: number;
    credibility?: number;
  };
}

export interface SourceGenerationResponse {
  sources: GeneratedSource[];
  metadata: {
    totalGenerated: number;
    categories: string[];
    languages: string[];
    regions: string[];
    generationTime: number;
    model: string;
    timestamp: string;
  };
  suggestions: {
    additionalCategories: string[];
    relatedSources: string[];
    optimizationTips: string[];
  };
}

// Rate limiting function
function checkRateLimit(): { allowed: boolean; waitTime?: number; message?: string } {
  const now = Date.now();
  
  // Reset hourly counter if an hour has passed
  if (now - lastHourReset > 60 * 60 * 1000) {
    hourlyRequestCount = 0;
    lastHourReset = now;
  }
  
  // Check hourly limit
  if (hourlyRequestCount >= RATE_LIMIT_CONFIG.maxRequestsPerHour) {
    const timeUntilReset = 60 * 60 * 1000 - (now - lastHourReset);
    return {
      allowed: false,
      waitTime: timeUntilReset,
      message: `Hourly limit reached. Please wait ${Math.ceil(timeUntilReset / 60000)} minutes.`
    };
  }
  
  // Check per-minute limit
  if (now - lastRequestTime < 60000) {
    if (requestCount >= RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
      const timeUntilReset = 60000 - (now - lastRequestTime);
      return {
        allowed: false,
        waitTime: timeUntilReset,
        message: `Rate limit reached. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`
      };
    }
  } else {
    requestCount = 0;
  }
  
  return { allowed: true };
}

// Update rate limit counters
function updateRateLimit() {
  const now = Date.now();
  
  if (now - lastRequestTime < 60000) {
    requestCount++;
  } else {
    requestCount = 1;
  }
  
  lastRequestTime = now;
  hourlyRequestCount++;
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = RATE_LIMIT_CONFIG.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check for retryable errors
      const isRetryableError = 
        error.message?.includes('quota') || 
        error.message?.includes('429') || 
        error.message?.includes('rate limit') ||
        error.message?.includes('too many requests') ||
        error.message?.includes('503') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('service unavailable') ||
        error.message?.includes('internal server error') ||
        error.message?.includes('502') ||
        error.message?.includes('504');
      
      if (isRetryableError && attempt < maxRetries) {
        // Use longer delays for overloaded model errors
        const baseDelay = error.message?.includes('503') || error.message?.includes('overloaded') 
          ? 5000 // 5 seconds base delay for overloaded model
          : RATE_LIMIT_CONFIG.retryDelay;
        
        const delay = baseDelay * Math.pow(2, attempt);
        const maxDelay = 30000; // Max 30 seconds
        const actualDelay = Math.min(delay, maxDelay);
        
        console.log(`🔄 [AI Service] Retry attempt ${attempt + 1}/${maxRetries + 1} after ${actualDelay}ms delay. Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, actualDelay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Generate unique ID for sources
function generateSourceId(): string {
  return `src_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse AI response to extract source information
function parseSourceResponse(response: string): GeneratedSource[] {
  const sources: GeneratedSource[] = [];
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentSource: Partial<GeneratedSource> = {};
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('##')) {
      continue;
    }
    
    // Parse source information
    if (trimmedLine.startsWith('**Name:**') || trimmedLine.startsWith('Name:')) {
      if (currentSource.name) {
        sources.push(currentSource as GeneratedSource);
      }
      currentSource = {
        id: generateSourceId(),
        type: 'rss',
        category: 'general',
        language: 'en',
        region: 'global',
        reliability: 'medium',
        status: 'unknown',
        tags: [],
        metadata: {}
      };
      currentSource.name = trimmedLine.replace(/^\*\*Name:\*\*\s*/, '').replace(/^Name:\s*/, '');
    } else if (trimmedLine.startsWith('**URL:**') || trimmedLine.startsWith('URL:')) {
      currentSource.url = trimmedLine.replace(/^\*\*URL:\*\*\s*/, '').replace(/^URL:\s*/, '');
    } else if (trimmedLine.startsWith('**Type:**') || trimmedLine.startsWith('Type:')) {
      const type = trimmedLine.replace(/^\*\*Type:\*\*\s*/, '').replace(/^Type:\s*/, '').toLowerCase();
      currentSource.type = (type as 'rss' | 'website' | 'social' | 'api') || 'rss';
    } else if (trimmedLine.startsWith('**Category:**') || trimmedLine.startsWith('Category:')) {
      currentSource.category = trimmedLine.replace(/^\*\*Category:\*\*\s*/, '').replace(/^Category:\s*/, '');
    } else if (trimmedLine.startsWith('**Language:**') || trimmedLine.startsWith('Language:')) {
      currentSource.language = trimmedLine.replace(/^\*\*Language:\*\*\s*/, '').replace(/^Language:\s*/, '');
    } else if (trimmedLine.startsWith('**Region:**') || trimmedLine.startsWith('Region:')) {
      currentSource.region = trimmedLine.replace(/^\*\*Region:\*\*\s*/, '').replace(/^Region:\s*/, '');
    } else if (trimmedLine.startsWith('**Description:**') || trimmedLine.startsWith('Description:')) {
      currentSource.description = trimmedLine.replace(/^\*\*Description:\*\*\s*/, '').replace(/^Description:\s*/, '');
    } else if (trimmedLine.startsWith('**Reliability:**') || trimmedLine.startsWith('Reliability:')) {
      const reliability = trimmedLine.replace(/^\*\*Reliability:\*\*\s*/, '').replace(/^Reliability:\s*/, '').toLowerCase();
      currentSource.reliability = (reliability as 'high' | 'medium' | 'low') || 'medium';
    } else if (trimmedLine.startsWith('**Tags:**') || trimmedLine.startsWith('Tags:')) {
      const tags = trimmedLine.replace(/^\*\*Tags:\*\*\s*/, '').replace(/^Tags:\s*/, '');
      currentSource.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }
  
  // Add the last source if it exists
  if (currentSource.name) {
    sources.push(currentSource as GeneratedSource);
  }
  
  return sources;
}

// Main source generation function
export async function generateNewsSources(
  query: string,
  options: SourceGenerationOptions = {}
): Promise<SourceGenerationResponse> {
  const startTime = Date.now();
  
  try {
    if (!query) {
      throw new Error('Query is required for source generation');
    }

    // Check if we should use demo mode due to repeated failures
    if (shouldUseDemoMode()) {
      console.log('🔄 [AI Service] Using demo mode due to repeated failures');
      return await generateDemoSources(query);
    }

    if (!genAI) {
      console.log('🔄 [AI Service] AI not available, falling back to demo mode');
      return await generateDemoSources(query);
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      console.log('🔄 [AI Service] Rate limit exceeded, falling back to demo mode');
      return await generateDemoSources(query);
    }

    // Set default options
    const defaultOptions: SourceGenerationOptions = {
      category: 'general',
      language: 'en',
      region: 'global',
      quality: 'high',
      count: 10,
      includeRSS: true,
      includeWebsites: true,
      includeSocial: false,
      ...options
    };

    // Build the prompt
    const prompt = `Generate ${defaultOptions.count} high-quality news sources for the topic: "${query}"

Requirements:
- Category: ${defaultOptions.category}
- Language: ${defaultOptions.language}
- Region: ${defaultOptions.region}
- Quality: ${defaultOptions.quality}
- Include RSS feeds: ${defaultOptions.includeRSS ? 'Yes' : 'No'}
- Include websites: ${defaultOptions.includeWebsites ? 'Yes' : 'No'}
- Include social media: ${defaultOptions.includeSocial ? 'Yes' : 'No'}

For each source, provide the following information in this exact format:

**Name:** [Source Name]
**URL:** [Full URL]
**Type:** [rss/website/social/api]
**Category:** [News category]
**Language:** [Language code]
**Region:** [Geographic region]
**Description:** [Brief description of the source]
**Reliability:** [high/medium/low]
**Tags:** [comma-separated tags]

Focus on:
1. Reputable news organizations
2. Reliable RSS feeds
3. High-quality content sources
4. Diverse perspectives
5. Recent and active sources

Ensure all URLs are valid and accessible.`;

    // Update rate limit counters
    updateRateLimit();

    // Generate sources with retry logic
    const result = await retryWithBackoff(async () => {
      const model = genAI!.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });

      try {
        const result = await model.generateContent(prompt);
        return result;
      } catch (error: any) {
        // Provide more specific error messages for common issues
        if (error.message?.includes('503') || error.message?.includes('overloaded')) {
          throw new Error('The AI model is currently overloaded. Please try again in a few moments. We are automatically retrying...');
        } else if (error.message?.includes('quota') || error.message?.includes('429')) {
          throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
        } else if (error.message?.includes('API key')) {
          throw new Error('Invalid API key. Please check your Gemini API key configuration.');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
        }
      }
    });

    const response = await result.response;
    const text = response.text();

    // Parse the response to extract sources
    const sources = parseSourceResponse(text);

    // Generate metadata
    const categories = [...new Set(sources.map(s => s.category))];
    const languages = [...new Set(sources.map(s => s.language))];
    const regions = [...new Set(sources.map(s => s.region))];

    // Track successful generation
    trackSuccess();

    const response_data: SourceGenerationResponse = {
      sources,
      metadata: {
        totalGenerated: sources.length,
        categories,
        languages,
        regions,
        generationTime: Date.now() - startTime,
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      },
      suggestions: {
        additionalCategories: getAdditionalCategories(categories),
        relatedSources: getRelatedSources(query),
        optimizationTips: getOptimizationTips(sources)
      }
    };

    return response_data;

  } catch (error) {
    // Track failure for service health monitoring
    trackFailure();
    
    // If it's a 503 error or similar, try demo mode as fallback
    if (error instanceof Error && (
      error.message.includes('503') || 
      error.message.includes('overloaded') ||
      error.message.includes('service unavailable')
    )) {
      console.log('🔄 [AI Service] Service unavailable, falling back to demo mode');
      return await generateDemoSources(query);
    }
    
    throw error;
  }
}

// Generate RSS feed sources specifically
export async function generateRSSSources(
  topic: string,
  count: number = 5,
  language: string = 'en'
): Promise<GeneratedSource[]> {
  const response = await generateNewsSources(topic, {
    category: 'general',
    language,
    region: 'global',
    quality: 'high',
    count,
    includeRSS: true,
    includeWebsites: false,
    includeSocial: false
  });

  return response.sources.filter(source => source.type === 'rss');
}

// Generate website sources specifically
export async function generateWebsiteSources(
  topic: string,
  count: number = 5,
  language: string = 'en'
): Promise<GeneratedSource[]> {
  const response = await generateNewsSources(topic, {
    category: 'general',
    language,
    region: 'global',
    quality: 'high',
    count,
    includeRSS: false,
    includeWebsites: true,
    includeSocial: false
  });

  return response.sources.filter(source => source.type === 'website');
}

// Helper functions
function getAdditionalCategories(existingCategories: string[]): string[] {
  const allCategories = [
    'technology', 'business', 'politics', 'health', 'science', 'sports',
    'entertainment', 'world', 'national', 'local', 'economy', 'environment',
    'education', 'culture', 'lifestyle', 'travel', 'food', 'fashion'
  ];
  
  return allCategories.filter(cat => !existingCategories.includes(cat));
}

function getRelatedSources(topic: string): string[] {
  // This could be enhanced with actual topic analysis
  return [
    `${topic} news`,
    `${topic} updates`,
    `${topic} analysis`,
    `${topic} reports`,
    `${topic} coverage`
  ];
}

function getOptimizationTips(sources: GeneratedSource[]): string[] {
  const tips = [];
  
  if (sources.length < 5) {
    tips.push('Consider generating more sources for better coverage');
  }
  
  const rssCount = sources.filter(s => s.type === 'rss').length;
  if (rssCount === 0) {
    tips.push('Add RSS feeds for automated content updates');
  }
  
  const highReliabilityCount = sources.filter(s => s.reliability === 'high').length;
  if (highReliabilityCount < sources.length * 0.7) {
    tips.push('Focus on high-reliability sources for better content quality');
  }
  
  const uniqueCategories = new Set(sources.map(s => s.category)).size;
  if (uniqueCategories < 3) {
    tips.push('Diversify categories for broader content coverage');
  }
  
  return tips;
}

// Validate source URL
export async function validateSource(source: GeneratedSource): Promise<{
  isValid: boolean;
  status: 'active' | 'inactive' | 'unknown';
  lastChecked: string;
  error?: string;
}> {
  try {
    const response = await fetch(source.url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    return {
      isValid: true,
      status: 'active',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      isValid: false,
      status: 'inactive',
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check if AI is available
export function isSourceAIAvailable(): boolean {
  return !!genAI && !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

// Get service health status
export function getSourceServiceHealth(): {
  isAvailable: boolean;
  isHealthy: boolean;
  consecutiveFailures: number;
  lastFailureTime: string | null;
  usingDemoMode: boolean;
  message: string;
} {
  const isAvailable = isSourceAIAvailable();
  const isHealthy = consecutiveFailures < MAX_CONSECUTIVE_FAILURES;
  const usingDemoMode = shouldUseDemoMode();
  
  let message = '';
  if (!isAvailable) {
    message = 'AI service not available - using demo mode';
  } else if (usingDemoMode) {
    message = 'AI service experiencing issues - using demo mode';
  } else if (consecutiveFailures > 0) {
    message = `AI service has ${consecutiveFailures} recent failures`;
  } else {
    message = 'AI service is healthy';
  }
  
  return {
    isAvailable,
    isHealthy,
    consecutiveFailures,
    lastFailureTime: lastFailureTime > 0 ? new Date(lastFailureTime).toISOString() : null,
    usingDemoMode,
    message
  };
}

// Check if we should use demo mode due to repeated failures
function shouldUseDemoMode(): boolean {
  const now = Date.now();
  
  // Reset failure count if enough time has passed
  if (now - lastFailureTime > FAILURE_RESET_TIME) {
    consecutiveFailures = 0;
  }
  
  return consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
}

// Track failure for service health monitoring
function trackFailure() {
  consecutiveFailures++;
  lastFailureTime = Date.now();
}

// Track success for service health monitoring
function trackSuccess() {
  consecutiveFailures = 0;
}

// Get rate limit status
export function getSourceRateLimitStatus(): {
  requestsThisMinute: number;
  requestsThisHour: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  timeUntilMinuteReset: number;
  timeUntilHourReset: number;
} {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const timeSinceHourReset = now - lastHourReset;
  
  return {
    requestsThisMinute: timeSinceLastRequest < 60000 ? requestCount : 0,
    requestsThisHour: timeSinceHourReset < 60 * 60 * 1000 ? hourlyRequestCount : 0,
    maxRequestsPerMinute: RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    maxRequestsPerHour: RATE_LIMIT_CONFIG.maxRequestsPerHour,
    timeUntilMinuteReset: Math.max(0, 60000 - timeSinceLastRequest),
    timeUntilHourReset: Math.max(0, 60 * 60 * 1000 - timeSinceHourReset)
  };
}

// Demo mode for testing
export async function generateDemoSources(topic: string): Promise<SourceGenerationResponse> {
  const demoSources: GeneratedSource[] = [
    {
      id: generateSourceId(),
      name: `${topic} News RSS`,
      url: `https://example.com/${topic.toLowerCase().replace(/\s+/g, '-')}/rss.xml`,
      type: 'rss',
      category: 'general',
      language: 'en',
      region: 'global',
      description: `Latest news and updates about ${topic}`,
      reliability: 'high',
      status: 'active',
      tags: [topic.toLowerCase(), 'news', 'rss'],
      metadata: {
        frequency: 'hourly',
        format: 'RSS 2.0',
        credibility: 0.9
      }
    },
    {
      id: generateSourceId(),
      name: `${topic} Updates`,
      url: `https://${topic.toLowerCase().replace(/\s+/g, '')}.com/news`,
      type: 'website',
      category: 'general',
      language: 'en',
      region: 'global',
      description: `Comprehensive coverage of ${topic} developments`,
      reliability: 'medium',
      status: 'active',
      tags: [topic.toLowerCase(), 'updates', 'coverage'],
      metadata: {
        frequency: 'daily',
        format: 'HTML',
        credibility: 0.8
      }
    },
    {
      id: generateSourceId(),
      name: `${topic} Analysis`,
      url: `https://analysis-${topic.toLowerCase().replace(/\s+/g, '')}.com/feed`,
      type: 'rss',
      category: 'analysis',
      language: 'en',
      region: 'global',
      description: `In-depth analysis and insights on ${topic}`,
      reliability: 'high',
      status: 'active',
      tags: [topic.toLowerCase(), 'analysis', 'insights'],
      metadata: {
        frequency: 'weekly',
        format: 'RSS 2.0',
        credibility: 0.95
      }
    }
  ];

  return {
    sources: demoSources,
    metadata: {
      totalGenerated: demoSources.length,
      categories: ['general', 'analysis'],
      languages: ['en'],
      regions: ['global'],
      generationTime: 1500,
      model: 'demo-mode',
      timestamp: new Date().toISOString()
    },
    suggestions: {
      additionalCategories: ['technology', 'business', 'politics'],
      relatedSources: [`${topic} news`, `${topic} updates`, `${topic} analysis`],
      optimizationTips: [
        'Add more high-reliability sources',
        'Consider regional sources for better coverage',
        'Include social media sources for real-time updates'
      ]
    }
  };
}
