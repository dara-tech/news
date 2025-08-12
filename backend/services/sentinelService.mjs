import Parser from 'rss-parser';
import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import News from '../models/News.mjs';
import Category from '../models/Category.mjs';
import User from '../models/User.mjs';
import Settings from '../models/Settings.mjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectCloudinary, { cloudinary } from '../utils/cloudinary.mjs';

/**
 * Sentinel-PP-01: AI News Analyst
 * - Monitors RSS sources
 * - Detects significant events
 * - Generates English draft JSON via Gemini
 * - Converts to News document (with Khmer filled by translation hook if available later)
 */
class SentinelService {
  constructor() {
    this.rssParser = new Parser({ 
      timeout: 20000,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SentinelPP01/1.0; +https://news-app.local) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
        }
      }
    });
    this.sources = [
      // Local & Regional (Khmer/Cambodia/ASEAN)
      { name: 'Khmer Times', url: 'https://www.khmertimeskh.com/feed/' },
      { name: 'Phnom Penh Post', url: 'https://www.phnompenhpost.com/rss', enabled: false },
      { name: 'VOA Khmer', url: 'https://www.voacambodia.com/rss/', enabled: false },
      { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss', enabled: true },
      // International general
      { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', enabled: true },
      { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', enabled: true },
      { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', enabled: true },
      { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', enabled: true },
      { name: 'NYTimes World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', enabled: true },
      { name: 'Reuters World', url: 'https://www.reuters.com/world/rss', enabled: true },
      { name: 'AP Top News', url: 'https://apnews.com/hub/ap-top-news?utm_source=apnews.com&utm_medium=referral&utm_campaign=rss', enabled: true },
      // Business/Tech
      { name: 'Bloomberg (ETFs feed sample)', url: 'https://www.bloomberg.com/feeds/podcasts/etf-report.xml', enabled: false },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
      { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', enabled: true },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', enabled: true },
      // Multilateral/Dev
      { name: 'World Bank', url: 'https://www.worldbank.org/en/news/all?format=rss', enabled: true },
    ];

    this.intervalHandle = null;
    this.lastSeenGuids = new Set();
    this.logBuffer = [];
    this.cooldownUntilMs = 0;
    this.frequencyMs = null;
    this.nextRunAt = null;
    this.lastRunAt = null;
    this.lastCreated = 0;
    this.lastProcessed = 0;
    try { if (process.env.CLOUDINARY_CLOUD_NAME) connectCloudinary(); } catch {}

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
  }

  pushLog(level, message) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    // Mirror to console
    if (level === 'error') console.error(message);
    else if (level === 'warning') console.warn(message);
    else console.log(message);
    // Store last 200 entries
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 200) {
      this.logBuffer = this.logBuffer.slice(-200);
    }
    return entry;
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
      this.runOnce({ persistOverride: cfg.autoPersist }).catch((e) => console.error('[Sentinel-PP-01] runOnce error:', e.message));
    }, frequencyMs);
    this.frequencyMs = frequencyMs;
    this.nextRunAt = new Date(Date.now() + frequencyMs);
    this.pushLog('info', `[Sentinel-PP-01] Started. Interval: ${frequencyMs}ms`);
    // Kick off immediately as well
    this.runOnce({ persistOverride: cfg.autoPersist }).catch((e) => console.error('[Sentinel-PP-01] initial run error:', e.message));
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
    try {
      const cfg = await this.loadConfig();
      // ensure sources up to date for one-off runs
      this.sources = (cfg.sources || []).filter(s => s.enabled !== false);
      const persist = typeof persistOverride === 'boolean' ? persistOverride : !!cfg.autoPersist;

      this.pushLog('info', '[Sentinel-PP-01] Scanning sources...');
      
      // Check if we have any enabled sources
      if (!this.sources.length) {
        this.pushLog('warning', '[Sentinel-PP-01] No enabled sources found');
        return { processed: 0, created: 0, previews: [], persist };
      }

      const items = await this.fetchAllSources();
      this.pushLog('info', `[Sentinel-PP-01] Fetched ${items.length} items from sources`);
      
      const significant = await this.filterSignificant(items);
      this.pushLog('info', `[Sentinel-PP-01] Found ${significant.length} significant items`);
      
      const previews = [];
      let created = 0;
      // Cap per run
      const maxPerRun = Number(process.env.SENTINEL_MAX_PER_RUN || 3);
      const batch = significant.slice(0, Math.max(1, maxPerRun));
      
      for (const item of batch) {
        try {
          const draftJson = await this.generateDraftJson(item);
          if (!draftJson) {
            this.pushLog('warning', `[Sentinel-PP-01] Failed to generate draft for: ${item.title}`);
            continue;
          }
          if (persist) {
            const saved = await this.persistDraft(draftJson, item);
            if (saved) created += 1;
          } else {
            previews.push({
              source: { name: item.sourceName, url: item.link, publishedAt: item.isoDate || item.pubDate || null },
              title: draftJson.title?.en,
              category: draftJson.category,
              tags: draftJson.tags,
              description: draftJson.description?.en?.slice(0, 200) || ''
            });
          }
        } catch (e) {
          this.pushLog('warning', `[Sentinel-PP-01] Error handling item: ${item.link} ${e.message}`);
        }
      }
      
      this.lastRunAt = new Date();
      this.lastProcessed = batch.length;
      this.lastCreated = created;
      if (this.frequencyMs) this.nextRunAt = new Date(Date.now() + this.frequencyMs);
      
      this.pushLog('info', `[Sentinel-PP-01] Cycle done. Processed ${batch.length}/${significant.length} significant items. ${persist ? `Created: ${created}` : `Previews: ${previews.length}`}`);
      return { processed: batch.length, created, previews, persist };
    } catch (error) {
      this.pushLog('error', `[Sentinel-PP-01] RunOnce failed: ${error.message}`);
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
    await Promise.all(this.sources.map(async (src) => {
      try {
        const feed = await this.rssParser.parseURL(src.url);
        for (const it of feed.items || []) {
          const guid = it.guid || it.id || it.link || `${src.name}-${it.title}`;
          if (this.lastSeenGuids.has(guid)) continue;
          allItems.push({ ...it, sourceName: src.name, guid });
        }
      } catch (e) {
        this.pushLog('warning', `[Sentinel-PP-01] RSS fetch failed for ${src.name}: ${e.message}`);
      }
    }));
    return allItems;
  }

  async filterSignificant(items) {
    // Balanced filtering: include both local and international news
    const localKeywords = [/cambodia/i, /phnom\s*penh/i, /asean/i, /mekong/i, /siem\s*reap/i];
    const globalKeywords = [/global/i, /world/i, /international/i, /breaking/i, /crisis/i, /economy/i, /technology/i, /climate/i, /politics/i];
    
    // High-priority sources (always include if recent)
    const highPrioritySources = ['Reuters', 'Associated Press', 'BBC World', 'CNN World', 'Al Jazeera', 'The Guardian World', 'NYTimes World'];
    
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
      
      const isHighPrioritySource = highPrioritySources.includes(it.sourceName);
      
      // Include if:
      // 1. Has local keywords (Cambodia/ASEAN focus)
      // 2. Has global keywords (international news)
      // 3. Is from high-priority source
      // 4. Is from tech sources (TechCrunch, Ars Technica, The Verge)
      const isTechSource = ['TechCrunch', 'Ars Technica', 'The Verge'].includes(it.sourceName);
      
      if (hasLocalKeywords || hasGlobalKeywords || isHighPrioritySource || isTechSource) {
        significant.push(it);
      }
    }
    
    // Sort by priority: local news first, then high-priority sources, then others
    significant.sort((a, b) => {
      const aText = `${a.title || ''} ${a.contentSnippet || a.content || ''}`;
      const bText = `${b.title || ''} ${b.contentSnippet || b.content || ''}`;
      
      const aHasLocal = localKeywords.some((re) => re.test(aText));
      const bHasLocal = localKeywords.some((re) => re.test(bText));
      
      const aIsHighPriority = highPrioritySources.includes(a.sourceName);
      const bIsHighPriority = highPrioritySources.includes(b.sourceName);
      
      if (aHasLocal && !bHasLocal) return -1;
      if (!aHasLocal && bHasLocal) return 1;
      if (aIsHighPriority && !bIsHighPriority) return -1;
      if (!aIsHighPriority && bIsHighPriority) return 1;
      
      return 0;
    });
    
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

    const clock = 'Saturday, August 9, 2025, 12:43 PM Indochina Time';
    const sys = `Role: You are an AI News Analyst, designated Sentinel-PP-01. Location: Phnom Penh, Cambodia. Internal clock: ${clock}. Audience: International readers with focus on Southeast Asia.`;
    const src = `Source: ${item.sourceName}\nTitle: ${item.title}\nLink: ${item.link}\nPublished: ${item.isoDate || item.pubDate || ''}\nSummary: ${(item.contentSnippet || '').slice(0, 500)}`;

    const prompt = `
You will output ONE valid JSON object only. No markdown. English language only.
Schema:
{
  "source": {"name": string, "url": string, "publishedAt": string},
  "category": string, // e.g., Politics, Business, Technology, Health, Sports, Entertainment, Education, Other
  "tags": string[],   // 3-7 lowercase tags
  "title": {"en": string},
  "description": {"en": string},
  "content": {"en": string}, // 600-1200 words, structured paragraphs, who/what/when/where/why/how
  "thumbnailUrl": string | null,
  "isFeatured": boolean,
  "isBreaking": boolean,
  "seo": {"metaDescription": {"en": string}, "keywords": string}
}

Constraints:
- Audience: International readers with interest in Southeast Asia, neutral professional tone, AP/Reuters style.
- For Cambodia/ASEAN news: Emphasize local context and regional implications.
- For international news: Provide global context with Southeast Asian perspective when relevant.
- For tech news: Focus on practical applications and regional impact.
- Prefer concise headline (<= 75 chars) and meta description (<= 160 chars).
- Choose one category from the list only.
- tags: 5-7, comma-separated keywords, no '#'.

${sys}
${src}

Return ONLY the JSON object. Ensure valid JSON, escape all quotes as needed.`;

    try {
      // Basic cooldown if prior 429
      if (Date.now() < this.cooldownUntilMs) {
        return null;
      }
      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonString = this.extractJson(text);
      const parsed = JSON.parse(jsonString);
      // Minimal validation
      if (!parsed?.title?.en || !parsed?.content?.en || !parsed?.description?.en) return null;
      return parsed;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      this.pushLog('warning', `[Sentinel-PP-01] Gemini generation failed: ${msg}`);
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
      console.warn('[Sentinel-PP-01] No category found. Skipping.');
      return false;
    }

    // Choose a system author: first admin or any user
    const author = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (!author) {
      console.warn('[Sentinel-PP-01] No author found. Skipping.');
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

    // Optional Khmer translation (controlled by env SENTINEL_TRANSLATE_KH)
    let khTitle = draft.title.en;
    let khDesc = draft.description.en;
    let khContent = draft.content.en;
    if (process.env.SENTINEL_TRANSLATE_KH === 'true') {
      const [t1, t2, t3] = await Promise.all([
        this.translateEnToKh(draft.title.en),
        this.translateEnToKh(draft.description.en),
        this.translateEnToKh(draft.content.en.slice(0, 4000)),
      ]);
      khTitle = t1 || khTitle;
      khDesc = t2 || khDesc;
      khContent = t3 || khContent;
    }

    // Build News document
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
        model: this.model ? 'gemini-2.0-flash' : null,
        cost: undefined,
        retries: 0,
      },
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
}

const sentinelService = new SentinelService();
export default sentinelService;

