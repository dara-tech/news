import Parser from 'rss-parser';
import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import News from '../models/News.mjs';
import Category from '../models/Category.mjs';
import User from '../models/User.mjs';
import Settings from '../models/Settings.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cloudinary, initializeCloudinary } from '../utils/cloudinary.mjs';
import { formatContentAdvanced } from '../utils/advancedContentFormatter.mjs';
import { cleanContent } from '../utils/contentCleaner.mjs';
import imageGenerationService from './imageGenerationService.mjs';
import logger from '../utils/logger.mjs';

/**
 * Sentinel-PP-01: Enhanced AI News Analyst
 * - Monitors RSS sources with improved reliability
 * - Advanced content filtering and quality scoring
 * - Enhanced AI generation with safety checks
 * - Better error handling and performance optimization
 * - Content deduplication and fact-checking integration
 */
class SentinelService {
  constructor() {
    this.rssParser = new Parser({ 
      timeout: 20000,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SentinelPP01/2.0; +https://news-app.local) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
        }
      }
    });
    
    // Enhanced source configuration with reliability scoring
    this.sources = [
      // Local & Regional (Khmer/Cambodia/ASEAN) - High Priority
      { name: 'Khmer Times', url: 'https://www.khmertimeskh.com/feed/', reliability: 0.9, priority: 'high' },
      { name: 'Phnom Penh Post', url: 'https://www.phnompenhpost.com/rss', enabled: false, reliability: 0.9, priority: 'high' },
      { name: 'VOA Khmer', url: 'https://www.voacambodia.com/rss/', enabled: false, reliability: 0.8, priority: 'high' },
      { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss.xml', enabled: true, reliability: 0.9, priority: 'high' },
      
      // International general - High Reliability
      { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', enabled: true, reliability: 0.95, priority: 'high' },
      { name: 'Reuters World', url: 'https://www.reuters.com/world/rss', enabled: true, reliability: 0.95, priority: 'high' },
      { name: 'Associated Press', url: 'https://apnews.com/hub/ap-top-news.rss', enabled: true, reliability: 0.95, priority: 'high' },
      { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', enabled: true, reliability: 0.85, priority: 'medium' },
      { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', enabled: true, reliability: 0.85, priority: 'medium' },
      
      // Major International News
      { name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', enabled: true, reliability: 0.9, priority: 'high' },
      { name: 'The New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', enabled: true, reliability: 0.9, priority: 'high' },
      { name: 'The Washington Post', url: 'https://feeds.washingtonpost.com/rss/world', enabled: true, reliability: 0.9, priority: 'high' },
      { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', enabled: true, reliability: 0.9, priority: 'high' },
      
      // Business/Tech - Specialized
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', enabled: true, reliability: 0.8, priority: 'medium' },
      { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', enabled: true, reliability: 0.85, priority: 'medium' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', enabled: true, reliability: 0.8, priority: 'medium' },
      
      // Multilateral/Development
      { name: 'World Bank', url: 'https://www.worldbank.org/en/news/all?format=rss', enabled: true, reliability: 0.95, priority: 'medium' },
      { name: 'Asian Development Bank', url: 'https://www.adb.org/news/rss', enabled: true, reliability: 0.95, priority: 'medium' },
      { name: 'ASEAN Secretariat', url: 'https://asean.org/news-events/', enabled: false, reliability: 0.95, priority: 'medium' },

    ];

    // Enhanced state management
    this.intervalHandle = null;
    this.lastSeenGuids = new Set();
    this.contentHashCache = new Map(); // For better deduplication
    this.logBuffer = [];
    this.cooldownUntilMs = 0;
    this.frequencyMs = null;
    this.nextRunAt = null;
    this.lastRunAt = null;
    this.lastCreated = 0;
    this.lastProcessed = 0;
    this.performanceMetrics = {
      totalProcessed: 0,
      totalCreated: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastReset: new Date()
    };
    
    // Content safety filters
    this.safetyFilters = {
      sensitiveKeywords: [
        'suicide', 'self-harm', 'explicit', 'pornography', 'hate speech',
        'terrorism', 'extremism', 'violence', 'gore', 'disturbing'
      ],
      biasIndicators: [
        'fake news', 'conspiracy', 'unverified', 'rumor', 'allegedly',
        'supposedly', 'claimed without evidence'
      ]
    };

    try { if (process.env.CLOUDINARY_CLOUD_NAME) initializeCloudinary(); } catch {}

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
  }

  // Enhanced logging with performance tracking
  pushLog(level, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };
    
    // Mirror to console with enhanced formatting
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (level === 'error') logger.error(formattedMessage);
    else if (level === 'warning') logger.warn(formattedMessage);
    else logger.info(formattedMessage);
    
    // Store last 500 entries (increased from 200)
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 500) {
      this.logBuffer = this.logBuffer.slice(-500);
    }
    return entry;
  }

  // Content safety check
  checkContentSafety(content) {
    const text = `${content.title || ''} ${content.description || ''} ${content.content || ''}`.toLowerCase();
    
    // Check for sensitive content
    const sensitiveMatches = this.safetyFilters.sensitiveKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // Check for bias indicators
    const biasMatches = this.safetyFilters.biasIndicators.filter(indicator => 
      text.includes(indicator.toLowerCase())
    );
    
    return {
      isSafe: sensitiveMatches.length === 0,
      hasBias: biasMatches.length > 0,
      sensitiveKeywords: sensitiveMatches,
      biasIndicators: biasMatches,
      safetyScore: Math.max(0, 100 - (sensitiveMatches.length * 20) - (biasMatches.length * 10))
    };
  }

  // Enhanced content deduplication using content hashing
  generateContentHash(content) {
    const text = `${content.title || ''} ${content.description || ''}`.toLowerCase();
    // Simple hash function for content similarity
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Content Analysis and Enhancement
  async analyzeAndEnhanceContent(item) {
    try {
      if (!this.model || Date.now() < this.cooldownUntilMs) {
        return null;
      }

      const analysisPrompt = `
You are a content analyst for Sentinel-PP-01. Analyze the following news content and provide enhanced, meaningful insights.

Source: ${item.sourceName}
Title: ${item.title}
Content: ${item.contentSnippet || item.content || ''}
Published: ${item.isoDate || item.pubDate || ''}

Please provide a JSON response with the following structure:
{
  "enhancedTitle": "Improved, more engaging title (max 75 chars)",
  "enhancedDescription": "Enhanced description with key insights (max 160 chars)",
  "enhancedContent": "Improved content with better structure, context, and insights (800-1200 words)",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "contextualAnalysis": "Brief analysis of regional/global context",
  "relevanceScore": 85,
  "sentiment": "neutral|positive|negative",
  "impactLevel": "low|medium|high",
  "targetAudience": ["local", "regional", "international"],
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "Politics|Business|Technology|Health|Sports|Entertainment|Education|Environment|Science|Other"
}

Guidelines:
- Make content more meaningful and engaging
- Add relevant context for Southeast Asian readers
- Ensure factual accuracy and clarity
- Provide balanced perspective
- Include actionable insights when relevant
- Maintain journalistic standards
- Consider cultural sensitivity

Return ONLY the JSON object.`;

      const result = await this.model.generateContent(analysisPrompt);
      const text = (await result.response).text().trim();
      const jsonString = this.extractJson(text);
      const analysis = JSON.parse(jsonString);

      // Validate analysis results
      if (!analysis.enhancedTitle || !analysis.enhancedContent || !analysis.enhancedDescription) {
        this.pushLog('warning', `[Sentinel-PP-01] Content analysis validation failed for: ${item.title}`);
        return null;
      }

      this.pushLog('info', `[Sentinel-PP-01] Content analysis completed`, {
        originalTitle: item.title.slice(0, 50) + '...',
        enhancedTitle: analysis.enhancedTitle.slice(0, 50) + '...',
        relevanceScore: analysis.relevanceScore,
        sentiment: analysis.sentiment,
        impactLevel: analysis.impactLevel
      });

      return {
        ...item,
        enhancedTitle: analysis.enhancedTitle,
        enhancedDescription: analysis.enhancedDescription,
        enhancedContent: analysis.enhancedContent,
        keyInsights: analysis.keyInsights || [],
        contextualAnalysis: analysis.contextualAnalysis || '',
        relevanceScore: analysis.relevanceScore || 50,
        sentiment: analysis.sentiment || 'neutral',
        impactLevel: analysis.impactLevel || 'medium',
        targetAudience: analysis.targetAudience || ['international'],
        suggestedTags: analysis.suggestedTags || [],
        suggestedCategory: analysis.category || 'Other'
      };

    } catch (error) {
      const msg = error && error.message ? error.message : String(error);
      this.pushLog('warning', `[Sentinel-PP-01] Content analysis failed: ${msg}`, { title: item.title });
      
      if (/429\s+Too\s+Many\s+Requests/i.test(msg)) {
        const match = msg.match(/retryDelay\\?\"?:\\?\"?(\d+)s/);
        const delaySec = match ? Number(match[1]) : 60;
        const delayMs = Math.min(Math.max(delaySec, 15), 120) * 1000;
        this.cooldownUntilMs = Date.now() + delayMs;
        this.pushLog('info', `[Sentinel-PP-01] Analysis cooldown ${Math.round(delayMs/1000)}s`);
      }
      return null;
    }
  }

  // Enhanced Khmer Translation
  async translateToKhmer(enhancedContent) {
    try {
      if (!this.model || Date.now() < this.cooldownUntilMs) {
        return null;
      }

      const translationPrompt = `
You are a professional translator specializing in English to Khmer (Cambodian) translation for news content.

Please translate the following enhanced news content to Khmer, maintaining the professional tone and cultural appropriateness.

Title: ${enhancedContent.enhancedTitle}
Description: ${enhancedContent.enhancedDescription}
Content: ${enhancedContent.enhancedContent.slice(0, 3000)} // Limit for API constraints

Guidelines for Khmer translation:
- Use formal, professional Khmer language
- Maintain journalistic tone and style
- Ensure cultural sensitivity and appropriateness
- Use proper Khmer grammar and sentence structure
- Preserve the meaning and context accurately
- Use appropriate Khmer terms for technical concepts
- Consider local context and cultural nuances

Return a JSON object with the following structure:
{
  "khmerTitle": "Translated title in Khmer",
  "khmerDescription": "Translated description in Khmer",
  "khmerContent": "Translated content in Khmer",
  "translationQuality": "high|medium|low",
  "culturalNotes": "Any cultural considerations or notes"
}

Return ONLY the JSON object.`;

      const result = await this.model.generateContent(translationPrompt);
      const text = (await result.response).text().trim();
      const jsonString = this.extractJson(text);
      const translation = JSON.parse(jsonString);

      // Validate translation results
      if (!translation.khmerTitle || !translation.khmerContent || !translation.khmerDescription) {
        this.pushLog('warning', `[Sentinel-PP-01] Khmer translation validation failed for: ${enhancedContent.enhancedTitle}`);
        return null;
      }

      this.pushLog('info', `[Sentinel-PP-01] Khmer translation completed`, {
        originalTitle: enhancedContent.enhancedTitle.slice(0, 30) + '...',
        khmerTitle: translation.khmerTitle.slice(0, 30) + '...',
        translationQuality: translation.translationQuality,
        culturalNotes: translation.culturalNotes ? 'Yes' : 'No'
      });

      return {
        khmerTitle: translation.khmerTitle,
        khmerDescription: translation.khmerDescription,
        khmerContent: translation.khmerContent,
        translationQuality: translation.translationQuality || 'medium',
        culturalNotes: translation.culturalNotes || ''
      };

    } catch (error) {
      const msg = error && error.message ? error.message : String(error);
      this.pushLog('warning', `[Sentinel-PP-01] Khmer translation failed: ${msg}`, { title: enhancedContent.enhancedTitle });
      
      if (/429\s+Too\s+Many\s+Requests/i.test(msg)) {
        const match = msg.match(/retryDelay\\?\"?:\\?\"?(\d+)s/);
        const delaySec = match ? Number(match[1]) : 60;
        const delayMs = Math.min(Math.max(delaySec, 15), 120) * 1000;
        this.cooldownUntilMs = Date.now() + delayMs;
        this.pushLog('info', `[Sentinel-PP-01] Translation cooldown ${Math.round(delayMs/1000)}s`);
      }
      return null;
    }
  }

  // Check for duplicate content
  async checkDuplicateContent(content) {
    const contentHash = this.generateContentHash(content);
    
    // Check cache first
    if (this.contentHashCache.has(contentHash)) {
      this.pushLog('info', `[Sentinel-PP-01] Duplicate detected in cache: ${content.title?.slice(0, 50)}...`);
      return { isDuplicate: true, reason: 'content_hash_match' };
    }
    
    // Check database for similar titles (more flexible matching)
    const normalizedTitle = content.title?.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (normalizedTitle) {
      // Use first 4 words for more flexible matching
      const titleWords = normalizedTitle.split(' ').slice(0, 4).join(' ');
      if (titleWords.length > 10) { // Only check if we have enough words
        const existing = await News.findOne({
          'title.en': { $regex: new RegExp(titleWords, 'i') }
        });
        
        if (existing) {
          this.pushLog('info', `[Sentinel-PP-01] Duplicate detected in database: ${content.title?.slice(0, 50)}...`);
          return { isDuplicate: true, reason: 'similar_title', existingId: existing._id };
        }
      }
    }
    
    // Add to cache
    this.contentHashCache.set(contentHash, Date.now());
    
    // Clean old cache entries (older than 12 hours instead of 24)
    const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
    for (const [hash, timestamp] of this.contentHashCache.entries()) {
      if (timestamp < twelveHoursAgo) {
        this.contentHashCache.delete(hash);
      }
    }
    
    return { isDuplicate: false };
  }

  async start() {
    const cfg = await this.loadConfig();
    if (!cfg.enabled) {
      this.pushLog('info', '[Sentinel-PP-01] Disabled by settings');
      return;
    }

    // update sources to only enabled items
    this.sources = (cfg.sources || []).filter(s => s.enabled !== false);
    const frequencyMs = Number(cfg.frequencyMs || 300000); // default 5 min
    if (!this.model) {
      this.pushLog('warning', '[Sentinel-PP-01] GEMINI_API_KEY missing; not starting.');
      return;
    }
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = setInterval(() => {
      this.runOnce({ persistOverride: cfg.autoPersist }).catch((e) => logger.error('[Sentinel-PP-01] runOnce error:', e.message));
    }, frequencyMs);
    this.frequencyMs = frequencyMs;
    this.nextRunAt = new Date(Date.now() + frequencyMs);
    this.pushLog('info', `[Sentinel-PP-01] Started. Interval: ${frequencyMs}ms`);
    // Kick off immediately as well
    this.runOnce({ persistOverride: cfg.autoPersist }).catch((e) => logger.error('[Sentinel-PP-01] initial run error:', e.message));
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      this.pushLog('info', '[Sentinel-PP-01] Stopped');
    }
    this.frequencyMs = null;
    this.nextRunAt = null;
  }

  async runOnce({ persistOverride } = {}) {
    const startTime = Date.now();
    let hasError = false;
    
    try {
      const cfg = await this.loadConfig();
      // ensure sources up to date for one-off runs
      this.sources = (cfg.sources || []).filter(s => s.enabled !== false);
      const persist = typeof persistOverride === 'boolean' ? persistOverride : !!cfg.autoPersist;

      this.pushLog('info', '[Sentinel-PP-01] Enhanced scanning cycle started...', { 
        sourcesCount: this.sources.length,
        persist,
        timestamp: new Date().toISOString()
      });
      
      // Check if we have any enabled sources
      if (!this.sources.length) {
        this.pushLog('warning', '[Sentinel-PP-01] No enabled sources found');
        return { processed: 0, created: 0, previews: [], persist, performance: { processingTime: Date.now() - startTime } };
      }

      const items = await this.fetchAllSources();
      this.pushLog('info', `[Sentinel-PP-01] Fetched ${items.length} items from sources`, { 
        sourcesProcessed: this.sources.length,
        averageItemsPerSource: Math.round(items.length / Math.max(1, this.sources.length))
      });
      
      const significant = await this.filterSignificant(items);
      this.pushLog('info', `[Sentinel-PP-01] Found ${significant.length} significant items`, { 
        qualityThreshold: 30,
        averageQualityScore: significant.length > 0 ? Math.round(significant.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / significant.length) : 0
      });
      
      const previews = [];
      let created = 0;
      let skipped = 0;
      let errors = 0;
      
      // Cap per run
      const maxPerRun = Number(process.env.SENTINEL_MAX_PER_RUN || 3);
      const batch = significant.slice(0, Math.max(1, maxPerRun));
      
      this.pushLog('info', `[Sentinel-PP-01] Processing batch of ${batch.length} items`, { 
        maxPerRun,
        totalSignificant: significant.length
      });
      
      for (const item of batch) {
        try {
          const itemStartTime = Date.now();
          
          const draftJson = await this.generateDraftJson(item);
          if (!draftJson) {
            skipped++;
            this.pushLog('warning', `[Sentinel-PP-01] Failed to generate draft for: ${item.title}`, { 
              qualityScore: item.qualityScore,
              source: item.sourceName
            });
            continue;
          }
          
          if (persist) {
            const saved = await this.persistDraft(draftJson, item);
            if (saved) {
              created += 1;
              this.pushLog('info', `[Sentinel-PP-01] Successfully created article: ${draftJson.title?.en}`, {
                generationTime: Date.now() - itemStartTime,
                qualityScore: item.qualityScore,
                safetyScore: draftJson.generationMetadata?.safetyScore
              });
            }
          } else {
            previews.push({
              source: { name: item.sourceName, url: item.link, publishedAt: item.isoDate || item.pubDate || null },
              title: draftJson.title?.en,
              category: draftJson.category,
              tags: draftJson.tags,
              description: draftJson.description?.en?.slice(0, 200) || '',
              qualityScore: item.qualityScore,
              generationTime: Date.now() - itemStartTime
            });
          }
        } catch (e) {
          errors++;
          this.pushLog('error', `[Sentinel-PP-01] Error handling item: ${item.link}`, { 
            error: e.message,
            source: item.sourceName,
            qualityScore: item.qualityScore
          });
        }
      }
      
      const processingTime = Date.now() - startTime;
      
      // Update performance metrics
      this.updatePerformanceMetrics(batch.length, created, processingTime, hasError);
      
      this.lastRunAt = new Date();
      this.lastProcessed = batch.length;
      this.lastCreated = created;
      if (this.frequencyMs) this.nextRunAt = new Date(Date.now() + this.frequencyMs);
      
      this.pushLog('info', `[Sentinel-PP-01] Enhanced cycle completed`, { 
        processed: batch.length,
        created,
        skipped,
        errors,
        processingTime: Math.round(processingTime / 1000) + 's',
        averageTimePerItem: Math.round(processingTime / Math.max(1, batch.length)) + 'ms',
        persist,
        previewsCount: previews.length
      });
      
      return { 
        processed: batch.length, 
        created, 
        previews, 
        persist,
        performance: {
          processingTime,
          averageTimePerItem: Math.round(processingTime / Math.max(1, batch.length)),
          skipped,
          errors,
          qualityMetrics: {
            averageQualityScore: significant.length > 0 ? Math.round(significant.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / significant.length) : 0,
            totalSignificant: significant.length
          }
        }
      };
    } catch (error) {
      hasError = true;
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(0, 0, processingTime, true);
      
      this.pushLog('error', `[Sentinel-PP-01] RunOnce failed`, { 
        error: error.message,
        processingTime: Math.round(processingTime / 1000) + 's',
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      throw error;
    }
  }

  // Import a single URL (on-demand), returns preview or created flag
  async importUrl(url, { persist = false } = {}) {
    try {
      // Try parse as RSS URL or article page (basic support: if feed, take latest item matching URL)
      const feed = await this.rssParser.parseURL(url).catch(() => null);
      let item = null;
      if (feed && Array.isArray(feed.items)) {
        item = feed.items.find(it => (it.link === url) || (it.guid === url));
        if (!item && feed.items.length > 0) item = feed.items[0];
        if (item) item.sourceName = feed.title || 'Custom Source';
      }
      if (!item) {
        this.pushLog('warning', `[Sentinel-PP-01] Unable to parse URL as RSS: ${url}`);
        return { success: false, message: 'Not a valid RSS feed URL' };
      }
      const draftJson = await this.generateDraftJson(item);
      if (!draftJson) return { success: false, message: 'Generation failed' };
      if (persist) {
        const created = await this.persistDraft(draftJson, { guid: item.guid || url, sourceName: item.sourceName, link: item.link, isoDate: item.isoDate, pubDate: item.pubDate });
        return { success: true, created };
      }
      return { success: true, preview: draftJson };
    } catch (e) {
      this.pushLog('warning', `[Sentinel-PP-01] importUrl error: ${e.message}`);
      return { success: false, message: e.message };
    }
  }

  async fetchAllSources() {
    const allItems = [];
    const fetchPromises = this.sources.map(async (src) => {
      if (src.enabled === false) {
        this.pushLog('info', `[Sentinel-PP-01] Skipping disabled source: ${src.name}`);
        return;
      }

      try {
        // Enhanced RSS parsing with retry logic
        const feed = await this.fetchRSSWithRetry(src.url, src.name);
        if (!feed || !feed.items) {
          this.pushLog('warning', `[Sentinel-PP-01] No items found for ${src.name}`);
          return;
        }

        for (const it of feed.items || []) {
          const guid = it.guid || it.id || it.link || `${src.name}-${it.title}`;
          if (this.lastSeenGuids.has(guid)) continue;
          allItems.push({ 
            ...it, 
            sourceName: src.name, 
            guid,
            sourceReliability: src.reliability,
            sourcePriority: src.priority
          });
        }

        this.pushLog('info', `[Sentinel-PP-01] Successfully fetched ${feed.items.length} items from ${src.name}`);
      } catch (e) {
        this.pushLog('warning', `[Sentinel-PP-01] RSS fetch failed for ${src.name}: ${e.message}`, {
          url: src.url,
          error: e.message
        });
      }
    });

    await Promise.all(fetchPromises);
    return allItems;
  }

  async fetchRSSWithRetry(url, sourceName, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const feed = await this.rssParser.parseURL(url);
        return feed;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        this.pushLog('info', `[Sentinel-PP-01] Retrying ${sourceName} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async filterSignificant(items) {
    // Enhanced filtering with quality scoring and safety checks
    const localKeywords = [/cambodia/i, /phnom\s*penh/i, /asean/i, /mekong/i, /siem\s*reap/i, /angkor/i, /battambang/i];
    const globalKeywords = [/global/i, /world/i, /international/i, /breaking/i, /crisis/i, /economy/i, /technology/i, /climate/i, /politics/i, /health/i, /education/i];
    const techKeywords = [/ai/i, /artificial intelligence/i, /blockchain/i, /crypto/i, /startup/i, /innovation/i, /digital/i, /cyber/i];
    
    const now = Date.now();
    const twoDaysMs = 1000 * 60 * 60 * 48;
    const significant = [];
    
    for (const it of items) {
      const pubDate = it.isoDate ? new Date(it.isoDate).getTime() : (it.pubDate ? new Date(it.pubDate).getTime() : now);
      const isRecent = now - pubDate < twoDaysMs;
      
      if (!isRecent) continue;
      
      const text = `${it.title || ''} ${it.contentSnippet || it.content || ''}`;
      const hasLocalKeywords = localKeywords.some((re) => re.test(text));
      const hasGlobalKeywords = globalKeywords.some((re) => re.test(text));
      const hasTechKeywords = techKeywords.some((re) => re.test(text));
      
      // Get source reliability and priority
      const source = this.sources.find(s => s.name === it.sourceName);
      const sourceReliability = source?.reliability || 0.5;
      const sourcePriority = source?.priority || 'low';
      
      // Content safety check
      const safetyCheck = this.checkContentSafety({
        title: it.title,
        description: it.contentSnippet,
        content: it.content
      });
      
      // Skip unsafe content
      if (!safetyCheck.isSafe) {
        this.pushLog('warning', `[Sentinel-PP-01] Skipping unsafe content: ${it.title}`, { safetyScore: safetyCheck.safetyScore });
        continue;
      }
      
      // Calculate content quality score
      let qualityScore = 0;
      
      // Source reliability bonus
      qualityScore += sourceReliability * 50;
      
      // Priority bonus
      if (sourcePriority === 'high') qualityScore += 30;
      else if (sourcePriority === 'medium') qualityScore += 15;
      
      // Content relevance bonus
      if (hasLocalKeywords) qualityScore += 40;
      if (hasGlobalKeywords) qualityScore += 25;
      if (hasTechKeywords) qualityScore += 20;
      
      // Recency bonus (newer = higher score)
      const hoursSincePublished = (now - pubDate) / (1000 * 60 * 60);
      if (hoursSincePublished < 1) qualityScore += 20;
      else if (hoursSincePublished < 6) qualityScore += 15;
      else if (hoursSincePublished < 24) qualityScore += 10;
      
      // Content length bonus
      const contentLength = (it.contentSnippet || it.content || '').length;
      if (contentLength > 500) qualityScore += 10;
      else if (contentLength > 200) qualityScore += 5;
      
      // Safety score bonus
      qualityScore += safetyCheck.safetyScore * 0.3;
      
      // Include if quality score is above threshold
      const minQualityScore = 30;
      if (qualityScore >= minQualityScore) {
        significant.push({
          ...it,
          qualityScore: Math.round(qualityScore),
          safetyCheck,
          sourceReliability,
          sourcePriority
        });
      }
    }
    
    // Enhanced sorting by quality score and priority
    significant.sort((a, b) => {
      // First by quality score (descending)
      if (b.qualityScore !== a.qualityScore) {
        return b.qualityScore - a.qualityScore;
      }
      
      // Then by local relevance
      const aText = `${a.title || ''} ${a.contentSnippet || a.content || ''}`;
      const bText = `${b.title || ''} ${b.contentSnippet || b.content || ''}`;
      
      const aHasLocal = localKeywords.some((re) => re.test(aText));
      const bHasLocal = localKeywords.some((re) => re.test(bText));
      
      if (aHasLocal && !bHasLocal) return -1;
      if (!aHasLocal && bHasLocal) return 1;
      
      // Then by source priority
      if (a.sourcePriority === 'high' && b.sourcePriority !== 'high') return -1;
      if (a.sourcePriority !== 'high' && b.sourcePriority === 'high') return 1;
      
      // Finally by recency
      const aPubDate = a.isoDate ? new Date(a.isoDate).getTime() : (a.pubDate ? new Date(a.pubDate).getTime() : now);
      const bPubDate = b.isoDate ? new Date(b.isoDate).getTime() : (b.pubDate ? new Date(b.pubDate).getTime() : now);
      return bPubDate - aPubDate;
    });
    
    this.pushLog('info', `[Sentinel-PP-01] Quality scoring complete. Average score: ${Math.round(significant.reduce((sum, item) => sum + item.qualityScore, 0) / Math.max(1, significant.length))}`);
    
    return significant;
  }

  async generateDraftJson(item) {
    // Ensure model is initialized
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        this.pushLog('error', '[Sentinel-PP-01] No Gemini API key available');
        return null;
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.pushLog('info', '[Sentinel-PP-01] Model initialized');
    }

    // Enhanced content safety check before generation
    const safetyCheck = this.checkContentSafety({
      title: item.title,
      description: item.contentSnippet,
      content: item.content
    });

    if (!safetyCheck.isSafe) {
      this.pushLog('warning', `[Sentinel-PP-01] Skipping unsafe content for generation: ${item.title}`, { safetyScore: safetyCheck.safetyScore });
      return null;
    }

    // Check for duplicate content
    const duplicateCheck = await this.checkDuplicateContent({
      title: item.title,
      description: item.contentSnippet
    });

    if (duplicateCheck.isDuplicate) {
      this.pushLog('info', `[Sentinel-PP-01] Skipping duplicate content: ${item.title}`, { reason: duplicateCheck.reason });
      return null;
    }

    // Step 1: Content Analysis and Enhancement
    const enhancedContent = await this.analyzeAndEnhanceContent(item);
    if (!enhancedContent) {
      this.pushLog('warning', `[Sentinel-PP-01] Content analysis failed for: ${item.title}`);
      return null;
    }

    // Step 2: Khmer Translation (if enabled)
    let khmerTranslations = null;
    if (process.env.SENTINEL_TRANSLATE_KH === 'true') {
      khmerTranslations = await this.translateToKhmer(enhancedContent);
      if (khmerTranslations) {
        this.pushLog('info', `[Sentinel-PP-01] Khmer translation completed for: ${item.title}`);
      }
    }

    const clock = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Phnom_Penh',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' Indochina Time';

    const sys = `Role: You are Sentinel-PP-01, an advanced AI News Analyst based in Phnom Penh, Cambodia. 
Current time: ${clock}
Mission: Create high-quality, factual news content for international readers with focus on Southeast Asia.
Ethics: Maintain journalistic integrity, avoid bias, prioritize accuracy, and respect cultural sensitivities.`;

    const src = `Source: ${enhancedContent.sourceName} (Reliability: ${enhancedContent.sourceReliability || 0.8})
Original Title: ${item.title}
Enhanced Title: ${enhancedContent.enhancedTitle}
Enhanced Description: ${enhancedContent.enhancedDescription}
Enhanced Content: ${enhancedContent.enhancedContent}
Link: ${item.link}
Published: ${item.isoDate || item.pubDate || ''}
Quality Score: ${enhancedContent.qualityScore || 'N/A'}
Relevance Score: ${enhancedContent.relevanceScore || 'N/A'}
Sentiment: ${enhancedContent.sentiment || 'neutral'}
Impact Level: ${enhancedContent.impactLevel || 'medium'}
Target Audience: ${enhancedContent.targetAudience?.join(', ') || 'international'}
Key Insights: ${enhancedContent.keyInsights?.join('; ') || 'N/A'}
Contextual Analysis: ${enhancedContent.contextualAnalysis || 'N/A'}`;

    const prompt = `
You will output ONE valid JSON object only. No markdown. English language only.

Schema:
{
  "source": {"name": string, "url": string, "publishedAt": string},
  "category": string, // Use the suggested category from analysis
  "tags": string[],   // Use suggested tags from analysis + additional relevant tags
  "title": {"en": string}, // Use the enhanced title from analysis
  "description": {"en": string}, // Use the enhanced description from analysis
  "content": {"en": string}, // Use the enhanced content from analysis with proper HTML formatting, ensure 800-1200 words
  "thumbnailUrl": string | null,
  "isFeatured": boolean, // true for high-impact stories (based on impact level)
  "isBreaking": boolean, // true for urgent/time-sensitive news
  "seo": {"metaDescription": {"en": string}, "keywords": string},
  "factCheck": {"status": "verified" | "pending" | "unverified", "notes": string},
  "analytics": {
    "relevanceScore": number,
    "sentiment": "neutral|positive|negative",
    "impactLevel": "low|medium|high",
    "targetAudience": string[],
    "keyInsights": string[],
    "contextualAnalysis": string
  }
}

Content Guidelines:
- Use the enhanced content provided from the analysis
- Style: Professional, neutral tone similar to Reuters/AP
- Structure: 
  * Clear introduction with hook and context
  * Well-organized body with logical flow and clear sections
  * Use proper paragraph breaks and transitions
  * Include relevant quotes and expert opinions when available
  * Conclusion with broader implications and regional context
- Format: Use proper HTML structure with <p>, <h2>, <h3>, <blockquote> tags
- HTML Formatting Requirements:
  * Wrap paragraphs in <p> tags
  * Use <h2> for main section headings
  * Use <h3> for subsection headings
  * Use <blockquote> for important quotes
  * Use <strong> for emphasis on key terms
  * Use <em> for subtle emphasis
  * Use <ul> and <li> for lists
- Accuracy: Stick to verifiable facts from the source
- Context: Provide Southeast Asian perspective when relevant
- Balance: Present multiple viewpoints when applicable
- Ethics: Avoid sensationalism, maintain journalistic standards
- Include key insights and contextual analysis in the content
- Length: Ensure 800-1200 words with comprehensive coverage

Safety Requirements:
- No harmful, violent, or inappropriate content
- No unverified claims or conspiracy theories
- No biased or inflammatory language
- Respect cultural sensitivities

${sys}
${src}

Return ONLY the JSON object. Ensure valid JSON, escape all quotes as needed.`;

    try {
      // Enhanced cooldown management
      if (Date.now() < this.cooldownUntilMs) {
        this.pushLog('info', `[Sentinel-PP-01] In cooldown, skipping generation for: ${item.title}`);
        return null;
      }

      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const generationTime = Date.now() - startTime;

      const jsonString = this.extractJson(text);
      const parsed = JSON.parse(jsonString);

      // Enhanced validation
      if (!parsed?.title?.en || !parsed?.content?.en || !parsed?.description?.en) {
        this.pushLog('warning', `[Sentinel-PP-01] Generated content missing required fields`, { title: !!parsed?.title?.en, content: !!parsed?.content?.en, description: !!parsed?.description?.en });
        return null;
      }

      // Post-generation safety check
      const generatedSafetyCheck = this.checkContentSafety({
        title: parsed.title.en,
        description: parsed.description.en,
        content: parsed.content.en
      });

      if (!generatedSafetyCheck.isSafe) {
        this.pushLog('warning', `[Sentinel-PP-01] Generated content failed safety check`, { safetyScore: generatedSafetyCheck.safetyScore });
        return null;
      }

      // Step 3: Auto-process content (format, translate, analyze)
      const autoProcessedContent = await this.autoProcessContent(parsed.content.en, parsed.title.en);
      
      // Update content with auto-processed results
      if (autoProcessedContent) {
        parsed.content = {
          en: autoProcessedContent.en,
          kh: autoProcessedContent.kh || ''
        };
        
        // Update title and description with Khmer translations
        if (autoProcessedContent.khmerTitle) {
          parsed.title.kh = autoProcessedContent.khmerTitle;
        }
        if (autoProcessedContent.khmerDescription) {
          parsed.description.kh = autoProcessedContent.khmerDescription;
        }
        
        // Add auto-processing metadata
        parsed.autoProcessingMetadata = {
          formatted: true,
          translated: !!autoProcessedContent.kh,
          titleTranslated: !!autoProcessedContent.khmerTitle,
          descriptionTranslated: !!autoProcessedContent.khmerDescription,
          analyzed: !!autoProcessedContent.analysis,
          analysis: autoProcessedContent.analysis,
          processedAt: new Date().toISOString()
        };
        
        // Use generated image if no thumbnail is available
        if (!parsed.thumbnailUrl && autoProcessedContent.generatedImage) {
          try {
            // Check if we have an actual image buffer from the new service
            if (autoProcessedContent.generatedImage.imageBuffer) {
              // Upload the generated image to Cloudinary using base64
              const base64Image = autoProcessedContent.generatedImage.imageBuffer.toString('base64');
              const dataURI = `data:image/png;base64,${base64Image}`;
              
              try {
                const uploadResult = await cloudinary.uploader.upload(dataURI, {
                  folder: 'news/thumbnails',
                  public_id: `sentinel-${Date.now()}`,
                  resource_type: 'image',
                  format: 'png'
                });
                
                // Store the Cloudinary URL as thumbnail
                parsed.thumbnailUrl = uploadResult.secure_url;
                
                this.pushLog('info', '[Sentinel-PP-01] Successfully uploaded generated image to Cloudinary', { 
                  publicId: uploadResult.public_id,
                  url: uploadResult.secure_url
                });
              } catch (uploadError) {
                this.pushLog('error', '[Sentinel-PP-01] Failed to upload generated image to Cloudinary', { error: uploadError.message });
                // Continue without setting thumbnailUrl
              }
            }
            
            // Store metadata about the generated image
            parsed.generatedImageMetadata = {
              description: autoProcessedContent.generatedImage.description,
              prompt: autoProcessedContent.generatedImage.prompt,
              generated: true,
              timestamp: autoProcessedContent.generatedImage.timestamp,
              service: autoProcessedContent.generatedImage.service
            };
            
            this.pushLog('info', '[Sentinel-PP-01] Generated image processed successfully', { 
              title: parsed.title.en?.slice(0, 50),
              hasImageBuffer: !!autoProcessedContent.generatedImage.imageBuffer,
              imageDescription: autoProcessedContent.generatedImage.description?.slice(0, 100)
            });
          } catch (uploadError) {
            this.pushLog('error', '[Sentinel-PP-01] Error processing generated image', { error: uploadError.message });
            // Fallback to just storing metadata
            parsed.generatedImageMetadata = {
              description: autoProcessedContent.generatedImage.description,
              prompt: autoProcessedContent.generatedImage.prompt,
              generated: true,
              timestamp: autoProcessedContent.generatedImage.timestamp,
              service: autoProcessedContent.generatedImage.service,
              uploadError: uploadError.message
            };
          }
        }
      }

      // Add Khmer translations if available (fallback to manual translation)
      if (khmerTranslations && !autoProcessedContent?.kh) {
        parsed.title.kh = khmerTranslations.khmerTitle;
        parsed.description.kh = khmerTranslations.khmerDescription;
        parsed.content.kh = khmerTranslations.khmerContent;
        parsed.translationMetadata = {
          quality: khmerTranslations.translationQuality,
          culturalNotes: khmerTranslations.culturalNotes,
          translatedAt: new Date().toISOString()
        };
      }

      // Add generation metadata
      parsed.generationMetadata = {
        model: 'gemini-1.5-flash',
        generationTime: generationTime,
        sourceQualityScore: enhancedContent.qualityScore,
        safetyScore: generatedSafetyCheck.safetyScore,
        analysisMetadata: {
          relevanceScore: enhancedContent.relevanceScore,
          sentiment: enhancedContent.sentiment,
          impactLevel: enhancedContent.impactLevel,
          targetAudience: enhancedContent.targetAudience,
          keyInsights: enhancedContent.keyInsights,
          contextualAnalysis: enhancedContent.contextualAnalysis
        },
        timestamp: new Date().toISOString()
      };

      this.pushLog('info', `[Sentinel-PP-01] Successfully generated enhanced content`, { 
        title: parsed.title.en.slice(0, 50) + '...',
        generationTime: generationTime,
        qualityScore: enhancedContent.qualityScore,
        safetyScore: generatedSafetyCheck.safetyScore,
        relevanceScore: enhancedContent.relevanceScore,
        sentiment: enhancedContent.sentiment,
        impactLevel: enhancedContent.impactLevel,
        hasKhmerTranslation: !!khmerTranslations
      });

      return parsed;

    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.pushLog('warning', `[Sentinel-PP-01] Gemini generation failed: ${msg}`, { title: item.title });
      
      if (/429\s+Too\s+Many\s+Requests/i.test(msg)) {
        const match = msg.match(/retryDelay\\?\"?:\\?\"?(\d+)s/);
        const delaySec = match ? Number(match[1]) : 60;
        const delayMs = Math.min(Math.max(delaySec, 15), 120) * 1000;
        this.cooldownUntilMs = Date.now() + delayMs;
        this.pushLog('info', `[Sentinel-PP-01] Entering cooldown for ${Math.round(delayMs/1000)}s due to quota`);
      }
      return null;
    }
  }

  extractJson(text) {
    let t = text.replace(/```json\s*|```/g, '').trim();
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    return t.slice(start, end + 1);
  }

  extractImageUrlFromItem(item) {
    // Priority 1: Media enclosures (usually highest quality)
    if (item?.enclosure?.url) return item.enclosure.url;
    if (item?.media && item.media.content && item.media.content.url) return item.media.content.url;
    if (item?.['media:content'] && item['media:content'].url) return item['media:content'].url;
    
    // Priority 2: Extract from HTML content with quality filtering
    const html = item?.content || item?.['content:encoded'] || '';
    if (html) {
      // Find all img tags
      const imgMatches = String(html).match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
      if (imgMatches && imgMatches.length > 0) {
        const imageCandidates = [];
        
        for (const imgTag of imgMatches) {
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
          if (!srcMatch) continue;
          
          const src = srcMatch[1];
          if (!src || src.startsWith('data:') || src.endsWith('.svg')) continue;
          
          // Extract dimensions if available
          const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
          const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
          const width = widthMatch ? Number(widthMatch[1]) : 0;
          const height = heightMatch ? Number(heightMatch[1]) : 0;
          
          // Skip very small images
          if (width && height && (width < 300 || height < 200)) continue;
          
          // Calculate quality score
          let score = 0;
          
          // Size-based scoring
          if (width && height) {
            const area = width * height;
            if (area >= 800000) score += 10;
            else if (area >= 400000) score += 8;
            else if (area >= 200000) score += 6;
            else if (area >= 100000) score += 4;
            else score += 2;
          } else {
            score += 1;
          }
          
          // URL-based scoring
          if (src.includes('large') || src.includes('high') || src.includes('original')) score += 3;
          if (src.includes('thumb') || src.includes('small') || src.includes('mini')) score -= 2;
          
          // Class-based scoring
          if (imgTag.includes('featured') || imgTag.includes('hero') || imgTag.includes('main')) score += 2;
          if (imgTag.includes('thumb') || imgTag.includes('small')) score -= 1;
          
          imageCandidates.push({ url: src, score, width, height });
        }
        
        // Return the best image
        if (imageCandidates.length > 0) {
          imageCandidates.sort((a, b) => b.score - a.score);
          return imageCandidates[0].url;
        }
      }
    }
    
    return null;
  }

  async uploadRemoteImage(imageUrl) {
    try {
      if (!imageUrl || !process.env.CLOUDINARY_CLOUD_NAME) return imageUrl || null;
      
      // Enhanced upload with quality optimization
      const res = await cloudinary.uploader.upload(imageUrl, { 
        folder: 'news/sentinel', 
        resource_type: 'image', 
        overwrite: false,
        quality: 'auto:good', // Optimize quality automatically
        fetch_format: 'auto', // Auto-optimize format
        transformation: [
          { width: 1200, height: 800, crop: 'fill', gravity: 'auto' }, // Resize to optimal dimensions
          { quality: 'auto:good' } // Ensure good quality
        ]
      });
      
      return res.secure_url || res.url;
    } catch (e) {
      this.pushLog('warning', `[Sentinel-PP-01] Cloudinary upload failed: ${e.message}`);
      return imageUrl;
    }
  }

  async translateEnToKh(text) {
    try {
      if (!this.model || !text) return null;
      if (Date.now() < this.cooldownUntilMs) return null;
      const prompt = `Translate the following English text into Khmer (km). Output Khmer text only, no quotes or commentary.\n\nText:\n${text}`;
      const result = await this.model.generateContent(prompt);
      const out = (await result.response).text().trim();
      return out || null;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (/429\s+Too\s+Many\s+Requests/i.test(msg)) {
        const match = msg.match(/retryDelay\\?\"?:\\?\"?(\d+)s/);
        const delaySec = match ? Number(match[1]) : 60;
        const delayMs = Math.min(Math.max(delaySec, 15), 120) * 1000;
        this.cooldownUntilMs = Date.now() + delayMs;
        this.pushLog('info', `[Sentinel-PP-01] Translation cooldown ${Math.round(delayMs/1000)}s`);
      }
      return null;
    }
  }

  async persistDraft(draft, item) {
    // Category mapping
    const categoryName = (draft.category || 'Other').toLowerCase();
    const known = ['politics', 'business', 'technology', 'health', 'sports', 'entertainment', 'education', 'other'];
    const normalized = known.includes(categoryName) ? categoryName : 'other';

    // Resolve category id by slug or name
    const slug = normalized.replace(/[^a-z0-9]+/g, '-');
    let categoryDoc = await Category.findOne({ slug });
    if (!categoryDoc) {
      // fallback by English name
      categoryDoc = await Category.findOne({ 'name.en': new RegExp(`^${normalized}$`, 'i') });
    }
    if (!categoryDoc) {
      // Final fallback: any category
      categoryDoc = await Category.findOne();
    }
    if (!categoryDoc) {
      logger.warn('[Sentinel-PP-01] No category found. Skipping.');
      return false;
    }

    // Choose a system author: first admin or any user
    const author = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (!author) {
      logger.warn('[Sentinel-PP-01] No author found. Skipping.');
      return false;
    }

    // Guard against duplicates: by source guid first, then by normalized title
    if (item.guid) {
      const dupByGuid = await News.findOne({ 'source.guid': item.guid });
      if (dupByGuid) {
        this.lastSeenGuids.add(item.guid);
        return false;
      }
    }
    const existing = await News.findOne({ 'title.en': draft.title.en });
    if (existing) {
      this.lastSeenGuids.add(item.guid);
      return false;
    }

    // Thumbnail from draft or RSS; upload to Cloudinary if configured
    let thumbnailUrl = draft.thumbnailUrl || this.extractImageUrlFromItem(item) || null;
    if (!thumbnailUrl && item && item.link) {
      try { thumbnailUrl = await this.fetchOgImage(item.link); } catch {}
      if (!thumbnailUrl) {
        try { thumbnailUrl = await this.fetchMainImageViaCheerio(item.link); } catch {}
      }
    }
    if (thumbnailUrl) {
      thumbnailUrl = await this.uploadRemoteImage(thumbnailUrl);
    }

    // Use Khmer translations from enhanced analysis if available, otherwise fallback to basic translation
    let khTitle = draft.title.kh || draft.title.en;
    let khDesc = draft.description.kh || draft.description.en;
    let khContent = draft.content.kh || draft.content.en;
    
    // Fallback to basic translation if enhanced translation not available
    if (!draft.title.kh && process.env.SENTINEL_TRANSLATE_KH === 'true') {
      const [t1, t2, t3] = await Promise.all([
        this.translateEnToKh(draft.title.en),
        this.translateEnToKh(draft.description.en),
        this.translateEnToKh(draft.content.en.slice(0, 4000)),
      ]);
      khTitle = t1 || khTitle;
      khDesc = t2 || khDesc;
      khContent = t3 || khContent;
    }

    // Build News document with enhanced analytics
    const news = new News({
      title: { en: draft.title.en, kh: khTitle },
      description: { en: draft.description.en, kh: khDesc },
      content: { en: draft.content.en, kh: khContent },
      slug: draft.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: categoryDoc._id,
      tags: Array.isArray(draft.tags) ? draft.tags.slice(0, 7) : [],
      thumbnail: thumbnailUrl || null,
      images: [],
      author: author._id,
      status: 'draft',
      isFeatured: !!draft.isFeatured,
      isBreaking: !!draft.isBreaking,
      source: {
        name: item.sourceName || 'Unknown',
        url: item.link || null,
        publishedAt: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate) : null,
        guid: item.guid || null,
      },
      ingestion: {
        method: 'sentinel',
        model: this.model ? 'gemini-1.5-flash' : null,
        cost: undefined,
        retries: 0,
        enhancedAnalysis: draft.generationMetadata?.analysisMetadata || null,
        translationQuality: draft.translationMetadata?.quality || null,
      },
      // Enhanced analytics metadata
      analytics: draft.generationMetadata?.analysisMetadata ? {
        relevanceScore: draft.generationMetadata.analysisMetadata.relevanceScore,
        sentiment: draft.generationMetadata.analysisMetadata.sentiment,
        impactLevel: draft.generationMetadata.analysisMetadata.impactLevel,
        targetAudience: draft.generationMetadata.analysisMetadata.targetAudience,
        keyInsights: draft.generationMetadata.analysisMetadata.keyInsights,
        contextualAnalysis: draft.generationMetadata.analysisMetadata.contextualAnalysis,
        generatedAt: draft.generationMetadata.timestamp
      } : null,
    });

    if (draft.seo) {
      if (draft.seo.metaDescription?.en) news.metaDescription = { en: draft.seo.metaDescription.en, kh: draft.seo.metaDescription.en };
      if (draft.seo.keywords) news.keywords = draft.seo.keywords;
    }

    await news.save();
    this.lastSeenGuids.add(item.guid);
    this.pushLog('info', `[Sentinel-PP-01] Draft created: ${news.title.en}`);
    return true;
  }

  async loadConfig() {
    try {
      const integrations = await Settings.getCategorySettings('integrations');
      return {
        enabled: integrations.sentinelEnabled ?? (process.env.SENTINEL_ENABLED === 'true'),
        autoPersist: integrations.sentinelAutoPersist ?? false,
        frequencyMs: integrations.sentinelFrequencyMs ?? Number(process.env.SENTINEL_FREQUENCY_MS || 300000),
        sources: integrations.sentinelSources?.length ? integrations.sentinelSources : this.sources,
      };
    } catch {
      return {
        enabled: process.env.SENTINEL_ENABLED === 'true',
        autoPersist: false,
        frequencyMs: Number(process.env.SENTINEL_FREQUENCY_MS || 300000),
        sources: this.sources,
      };
    }
  }

  async fetchOgImage(articleUrl) {
    try {
      const resp = await axios.get(articleUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SentinelPP01/1.0)'
        }
      });
      const html = resp.data || '';
      const pick = (...regs) => {
        for (const re of regs) {
          const m = html.match(re);
          if (m && m[1]) return m[1];
        }
        return null;
      };
      const url = pick(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i
      );
      if (!url) return null;
      try {
        return new URL(url, articleUrl).href;
      } catch {
        return url;
      }
    } catch (e) {
      this.pushLog('warning', `[Sentinel-PP-01] og:image fetch failed: ${e.message}`);
      return null;
    }
  }

  async fetchMainImageViaCheerio(articleUrl) {
    try {
      const resp = await axios.get(articleUrl, {
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
        }
      });
      const $ = cheerioLoad(resp.data || '');
      const toAbs = (u) => {
        if (!u) return null;
        try { return new URL(u, articleUrl).href; } catch { return u; }
      };

      // Site-specific selectors first
      const host = (() => { try { return new URL(articleUrl).host; } catch { return ''; } })();
      const domainRules = {
        'www.khmertimeskh.com': ['article img', '.single-post-content img', 'figure img', '.post-thumbnail img'],
        'www.bbc.com': ['article img', '.ssrcss-uf6wea-RichTextComponentWrapper img', 'figure img'],
        'www.cnn.com': ['article img', '.Article__content img', 'figure img'],
        'edition.cnn.com': ['article img', '.zn-body__paragraph img', 'figure img'],
        'www.aljazeera.com': ['article img', '.wysiwyg img', 'figure img'],
        'www.theguardian.com': ['article img', '.article-body-commercial-selector img', 'figure img'],
        'www.nytimes.com': ['article img', 'figure img', 'main img'],
        'www.reuters.com': ['article img', 'figure img', '.article-body__content img'],
        'apnews.com': ['article img', '.RichTextStoryBody img', 'figure img'],
        'techcrunch.com': ['article img', '.article-content img', 'figure img'],
        'arstechnica.com': ['article img', '.article-guts img', 'figure img'],
        'www.theverge.com': ['article img', '.duet--article--body img', 'figure img'],
      };
      const selectors = domainRules[host] || ['article img', 'main img', '.post-content img', '.entry-content img', 'figure img', 'img'];

      // Collect all potential images with their quality scores
      const imageCandidates = [];

      for (const sel of selectors) {
        const imgs = $(sel).toArray().slice(0, 10); // Increased from 5 to 10
        for (const el of imgs) {
          const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
          if (!src) continue;
          
          const abs = toAbs(src);
          // Skip invalid formats
          if (!abs || abs.startsWith('data:') || abs.endsWith('.svg')) continue;
          
          // Get dimensions
          const w = Number($(el).attr('width') || $(el).attr('data-width') || 0);
          const h = Number($(el).attr('height') || $(el).attr('data-height') || 0);
          
          // Skip very small images
          if (w && h && (w < 300 || h < 200)) continue;
          
          // Calculate quality score
          let score = 0;
          
          // Size-based scoring (prefer larger images)
          if (w && h) {
            const area = w * h;
            if (area >= 800000) score += 10; // 800x1000 or larger
            else if (area >= 400000) score += 8; // 400x1000 or larger
            else if (area >= 200000) score += 6; // 200x1000 or larger
            else if (area >= 100000) score += 4; // 100x1000 or larger
            else score += 2;
          } else {
            score += 1; // Unknown size
          }
          
          // Aspect ratio scoring (prefer landscape for news)
          if (w && h) {
            const ratio = w / h;
            if (ratio >= 1.2 && ratio <= 2.5) score += 3; // Good landscape ratio
            else if (ratio >= 0.8 && ratio <= 1.2) score += 2; // Square-ish
            else score += 1;
          }
          
          // URL-based scoring (prefer high-res versions)
          if (abs.includes('large') || abs.includes('high') || abs.includes('original')) score += 3;
          if (abs.includes('thumb') || abs.includes('small') || abs.includes('mini')) score -= 2;
          
          // Class-based scoring (prefer featured/hero images)
          const className = $(el).attr('class') || '';
          if (className.includes('featured') || className.includes('hero') || className.includes('main')) score += 2;
          if (className.includes('thumb') || className.includes('small')) score -= 1;
          
          imageCandidates.push({ url: abs, score, width: w, height: h });
        }
      }
      
      // Sort by score and return the best image
      if (imageCandidates.length > 0) {
        imageCandidates.sort((a, b) => b.score - a.score);
        const bestImage = imageCandidates[0];
        this.pushLog('info', `[Sentinel-PP-01] Selected image: ${bestImage.url} (score: ${bestImage.score}, size: ${bestImage.width}x${bestImage.height})`);
        return bestImage.url;
      }
      
      return null;
    } catch (e) {
      this.pushLog('warning', `[Sentinel-PP-01] cheerio image scrape failed: ${e.message}`);
      return null;
    }
  }

  // Enhanced performance monitoring and analytics
  getPerformanceMetrics() {
    const now = new Date();
    const uptime = now - this.performanceMetrics.lastReset;
    
    return {
      ...this.performanceMetrics,
      uptime: Math.round(uptime / 1000), // seconds
      averageProcessingTime: this.performanceMetrics.averageProcessingTime,
      errorRate: this.performanceMetrics.errorRate,
      lastRun: this.lastRunAt,
      nextRun: this.nextRunAt,
      sourcesCount: this.sources.filter(s => s.enabled !== false).length,
      cacheSize: this.contentHashCache.size,
      logBufferSize: this.logBuffer.length
    };
  }

  // Reset performance metrics
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalProcessed: 0,
      totalCreated: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastReset: new Date()
    };
    this.pushLog('info', '[Sentinel-PP-01] Performance metrics reset');
  }

  // Clear cache and reset system for testing
  resetSystem() {
    this.lastSeenGuids.clear();
    this.contentHashCache.clear();
    this.cooldownUntilMs = 0;
    this.resetPerformanceMetrics();
    this.pushLog('info', '[Sentinel-PP-01] System reset - cache cleared and cooldown reset');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      lastSeenGuidsSize: this.lastSeenGuids.size,
      contentHashCacheSize: this.contentHashCache.size,
      cooldownUntilMs: this.cooldownUntilMs,
      isInCooldown: Date.now() < this.cooldownUntilMs
    };
  }

  // Update performance metrics
  updatePerformanceMetrics(processed, created, processingTime, hasError = false) {
    this.performanceMetrics.totalProcessed += processed;
    this.performanceMetrics.totalCreated += created;
    
    // Update average processing time
    const currentAvg = this.performanceMetrics.averageProcessingTime;
    const totalRuns = Math.max(1, this.performanceMetrics.totalProcessed);
    this.performanceMetrics.averageProcessingTime = 
      (currentAvg * (totalRuns - 1) + processingTime) / totalRuns;
    
    // Update error rate
    if (hasError) {
      const totalErrors = this.performanceMetrics.errorRate * totalRuns + 1;
      this.performanceMetrics.errorRate = totalErrors / totalRuns;
    }
  }

  // Get system health status
  getHealthStatus() {
    const metrics = this.getPerformanceMetrics();
    const isHealthy = metrics.errorRate < 0.1 && metrics.uptime > 0;
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      metrics,
      issues: isHealthy ? [] : [
        ...(metrics.errorRate >= 0.1 ? ['High error rate'] : []),
        ...(metrics.uptime === 0 ? ['No recent activity'] : [])
      ],
      recommendations: isHealthy ? [] : [
        ...(metrics.errorRate >= 0.1 ? ['Check API quotas and network connectivity'] : []),
        ...(metrics.uptime === 0 ? ['Verify service is running and configured'] : [])
      ]
    };
  }

  // Enhanced source management
  async updateSourceConfig(sourceName, updates) {
    const sourceIndex = this.sources.findIndex(s => s.name === sourceName);
    if (sourceIndex === -1) {
      throw new Error(`Source '${sourceName}' not found`);
    }
    
    this.sources[sourceIndex] = { ...this.sources[sourceIndex], ...updates };
    
    // Update settings in database
    const settings = await Settings.findOne();
    if (settings) {
      const sourceSettings = settings.integrations?.sentinelSources || [];
      const settingIndex = sourceSettings.findIndex(s => s.name === sourceName);
      
      if (settingIndex !== -1) {
        sourceSettings[settingIndex] = { ...sourceSettings[settingIndex], ...updates };
        settings.integrations.sentinelSources = sourceSettings;
        await settings.save();
      }
    }
    
    this.pushLog('info', `[Sentinel-PP-01] Updated source configuration: ${sourceName}`, updates);
  }

  // Get detailed source statistics
  async getSourceStatistics() {
    const stats = {};
    
    for (const source of this.sources) {
      try {
        const feed = await this.rssParser.parseURL(source.url);
        stats[source.name] = {
          enabled: source.enabled !== false,
          reliability: source.reliability || 0.5,
          priority: source.priority || 'low',
          lastFetch: new Date().toISOString(),
          itemCount: feed.items?.length || 0,
          feedTitle: feed.title || 'Unknown',
          feedDescription: feed.description || '',
          isHealthy: true
        };
      } catch (error) {
        stats[source.name] = {
          enabled: source.enabled !== false,
          reliability: source.reliability || 0.5,
          priority: source.priority || 'low',
          lastFetch: new Date().toISOString(),
          itemCount: 0,
          feedTitle: 'Error',
          feedDescription: error.message,
          isHealthy: false,
          error: error.message
        };
      }
    }
    
    return stats;
  }

  // Auto-process content: format, translate, and analyze
  async autoProcessContent(englishContent, title) {
    try {
      this.pushLog('info', '[Sentinel-PP-01] Starting auto-processing of content...', { title: title?.slice(0, 50) });
      
      // Step 1: Auto-format content
      const formattedContent = await this.autoFormatContent(englishContent);
      
      // Step 2: Auto-translate to Khmer (content, title, description)
      const khmerContent = await this.autoTranslateToKhmer(formattedContent);
      const khmerTitle = await this.autoTranslateTitle(title);
      const khmerDescription = await this.autoTranslateDescription(englishContent);
      
      // Step 3: Auto-analyze content quality
      const analysis = await this.autoAnalyzeContent(formattedContent);
      
      // Step 4: Auto-generate image if needed
      const generatedImage = await this.autoGenerateImage(title, formattedContent);
      
      this.pushLog('info', '[Sentinel-PP-01] Auto-processing completed successfully', { 
        title: title?.slice(0, 50),
        formatted: !!formattedContent,
        translated: !!khmerContent,
        titleTranslated: !!khmerTitle,
        descriptionTranslated: !!khmerDescription,
        analyzed: !!analysis,
        imageGenerated: !!generatedImage
      });
      
      return {
        en: formattedContent,
        kh: khmerContent,
        khmerTitle: khmerTitle,
        khmerDescription: khmerDescription,
        analysis: analysis,
        generatedImage: generatedImage
      };
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-processing error:', error);
      // Return original content if processing fails
      return {
        en: englishContent,
        kh: '',
        khmerTitle: '',
        khmerDescription: '',
        analysis: null,
        generatedImage: null
      };
    }
  }

  // Auto-format content using advanced formatter
  async autoFormatContent(content) {
    try {
      // Clean content first to remove unwanted HTML structure
      const cleanedContent = cleanContent(content);
      
      const formattingOptions = {
        enableAIEnhancement: false, // Disable AI enhancement to avoid API key issues
        enableReadabilityOptimization: true,
        enableSEOOptimization: true,
        enableVisualEnhancement: true,
        addSectionHeadings: true,
        enhanceQuotes: true,
        optimizeLists: true,
        enableContentAnalysis: false, // Disable AI analysis
        addKeyPoints: false, // Disable AI features
        enhanceStructure: true
      };

      const result = await formatContentAdvanced(cleanedContent, formattingOptions);
      return result.success ? result.content : cleanedContent;
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-format error:', error);
      return cleanContent(content); // Return cleaned content even if formatting fails
    }
  }

  // Auto-translate content to Khmer
  async autoTranslateToKhmer(englishContent) {
    try {
      if (!this.model) return '';

      const prompt = `
        Translate the following English news article to Khmer (Cambodian language). 
        
        Requirements:
        - Maintain the original meaning, tone, and context
        - Preserve all HTML tags and formatting structure
        - Use proper Khmer grammar and vocabulary
        - Ensure cultural appropriateness for Cambodian readers
        - Maintain professional journalistic style
        - Keep the same paragraph structure and headings
        - Translate numbers and dates appropriately
        
        English text:
        ${englishContent}
        
        Provide only the Khmer translation without any additional text or explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-translate error:', error);
      return '';
    }
  }

  // Auto-translate title to Khmer
  async autoTranslateTitle(englishTitle) {
    try {
      if (!this.model || !englishTitle) return '';

      const prompt = `
        Translate the following English news title to Khmer (Cambodian language).
        
        Requirements:
        - Maintain the original meaning and impact
        - Use proper Khmer grammar and vocabulary
        - Ensure cultural appropriateness
        - Keep it concise and engaging
        - Maintain professional journalistic style
        
        English title:
        ${englishTitle}
        
        Provide only the Khmer translation without any additional text or explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-translate title error:', error);
      return '';
    }
  }

  // Auto-translate description to Khmer
  async autoTranslateDescription(englishContent) {
    try {
      if (!this.model || !englishContent) return '';

      // Extract first few sentences for description
      const sentences = englishContent.replace(/<[^>]*>/g, '').split(/[.!?]+/).filter(s => s.trim().length > 10);
      const descriptionText = sentences.slice(0, 2).join('. ') + '.';

      const prompt = `
        Translate the following English news description to Khmer (Cambodian language).
        
        Requirements:
        - Maintain the original meaning and context
        - Use proper Khmer grammar and vocabulary
        - Ensure cultural appropriateness
        - Keep it concise (2-3 sentences)
        - Maintain professional journalistic style
        
        English description:
        ${descriptionText}
        
        Provide only the Khmer translation without any additional text or explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-translate description error:', error);
      return '';
    }
  }

  // Auto-analyze content quality
  async autoAnalyzeContent(content) {
    try {
      if (!this.model) return null;

      const prompt = `
        Analyze the following news article content and provide a JSON response with quality metrics:
        
        Content: ${content}
        
        Please analyze and return a JSON object with the following structure:
        {
          "readability": {
            "score": number (0-100),
            "level": "Excellent|Good|Fair|Poor",
            "suggestions": ["suggestion1", "suggestion2"]
          },
          "seo": {
            "score": number (0-100),
            "keywords": ["keyword1", "keyword2"],
            "suggestions": ["suggestion1", "suggestion2"]
          },
          "engagement": {
            "score": number (0-100),
            "factors": ["factor1", "factor2"]
          }
        }
        
        Return only the JSON object without any additional text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-analyze error:', error);
      return null;
    }
  }

  // Auto-generate image using Google Gemini
  async autoGenerateImage(title, content) {
    try {
      // Use the dedicated image generation service
      const generatedImage = await imageGenerationService.generateImageForArticle(title, content);
      
      if (generatedImage) {
        this.pushLog('info', '[Sentinel-PP-01] Generated image successfully', { 
          title: title?.slice(0, 50),
          description: generatedImage.description?.slice(0, 100),
          service: generatedImage.service
        });
      }

      return generatedImage;
    } catch (error) {
      this.pushLog('error', '[Sentinel-PP-01] Auto-generate image error:', error);
      return null;
    }
  }

  // Get logs for real-time tracking
  getLogs() {
    return this.logBuffer.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      metadata: log.metadata
    }));
  }

  // Get metrics for real-time tracking
  getMetrics() {
    return {
      enabled: this.intervalHandle !== null,
      running: this.isRunning,
      lastRunAt: this.lastRunAt,
      nextRunAt: this.nextRunAt,
      lastCreated: this.lastCreated,
      lastProcessed: this.lastProcessed,
      cooldownUntil: this.cooldownUntilMs > Date.now() ? new Date(this.cooldownUntilMs) : null,
      maxPerRun: this.maxPerRun,
      frequencyMs: this.frequencyMs,
      sourcesCount: this.sources.filter(s => s.enabled !== false).length,
      performanceMetrics: this.performanceMetrics,
      logBufferSize: this.logBuffer.length
    };
  }
}

const sentinelService = new SentinelService();
export default sentinelService;

