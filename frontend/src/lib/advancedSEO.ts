/**
 * Advanced SEO optimization system with comprehensive features
 */

import SEOOptimizer from './seoOptimizer';

interface AdvancedSEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle: string;
  facebookAppId?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  bingWebmasterId?: string;
  yandexWebmasterId?: string;
  baiduWebmasterId?: string;
  naverWebmasterId?: string;
}

interface SEOAuditResult {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    action: string;
  }>;
  metrics: {
    titleLength: number;
    descriptionLength: number;
    keywordDensity: number;
    headingStructure: number;
    imageOptimization: number;
    internalLinks: number;
    externalLinks: number;
    pageSpeed: number;
    mobileFriendly: boolean;
  };
}

interface KeywordAnalysis {
  primary: string;
  secondary: string[];
  longTail: string[];
  density: number;
  distribution: { [keyword: string]: number };
  suggestions: string[];
}

interface ContentOptimization {
  readabilityScore: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  passiveVoicePercentage: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFogIndex: number;
  automatedReadabilityIndex: number;
}

class AdvancedSEO {
  private static instance: AdvancedSEO;
  private config: AdvancedSEOConfig;
  private seoOptimizer: SEOOptimizer;

  constructor() {
    this.config = {
      siteName: 'Razewire',
      siteUrl: 'https://www.razewire.online',
      defaultTitle: 'Razewire - Latest News & Updates',
      defaultDescription: 'Stay informed with the latest news in technology, business, and sports from Cambodia and around the world.',
      defaultImage: 'https://www.razewire.online/og-image.svg',
      twitterHandle: '@razewire',
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
      googleSearchConsoleId: process.env.NEXT_PUBLIC_GSC_ID || '',
      bingWebmasterId: process.env.NEXT_PUBLIC_BING_ID || '',
      yandexWebmasterId: process.env.NEXT_PUBLIC_YANDEX_ID || '',
      baiduWebmasterId: process.env.NEXT_PUBLIC_BAIDU_ID || '',
      naverWebmasterId: process.env.NEXT_PUBLIC_NAVER_ID || '',
    };
    this.seoOptimizer = SEOOptimizer.getInstance();
  }

  static getInstance(): AdvancedSEO {
    if (!AdvancedSEO.instance) {
      AdvancedSEO.instance = new AdvancedSEO();
    }
    return AdvancedSEO.instance;
  }

  /**
   * Perform comprehensive SEO audit
   */
  async auditPage(url: string, content?: string): Promise<SEOAuditResult> {
    const issues: SEOAuditResult['issues'] = [];
    const recommendations: SEOAuditResult['recommendations'] = [];
    let score = 100;

    // Fetch page content if not provided
    if (!content) {
      try {
        const response = await fetch(url);
        content = await response.text();
      } catch (error) {
        issues.push({
          type: 'error',
          category: 'Technical',
          message: 'Failed to fetch page content',
          suggestion: 'Check if the URL is accessible',
          impact: 'high'
        });
        score -= 20;
      }
    }

    let title: string | null = null;
    let description: string | null = null;
    let headingStructure: { score: number; issues: string[] } = { score: 0, issues: [] };
    let imageOptimization: { score: number; issues: string[] } = { score: 0, issues: [] };
    let internalLinks: { count: number; issues: string[] } = { count: 0, issues: [] };

    if (content) {
      const dom = new DOMParser().parseFromString(content, 'text/html');
      
      // Analyze title
      title = this.extractTitle(dom);
      if (!title) {
        issues.push({
          type: 'error',
          category: 'On-Page SEO',
          message: 'Missing title tag',
          suggestion: 'Add a descriptive title tag',
          impact: 'high'
        });
        score -= 15;
      } else {
        if (title.length < 30) {
          issues.push({
            type: 'warning',
            category: 'On-Page SEO',
            message: 'Title is too short',
            suggestion: 'Make title more descriptive (30-60 characters)',
            impact: 'medium'
          });
          score -= 5;
        } else if (title.length > 60) {
          issues.push({
            type: 'warning',
            category: 'On-Page SEO',
            message: 'Title is too long',
            suggestion: 'Shorten title to under 60 characters',
            impact: 'medium'
          });
          score -= 5;
        }
      }

      // Analyze meta description
      description = this.extractMetaDescription(dom);
      if (!description) {
        issues.push({
          type: 'error',
          category: 'On-Page SEO',
          message: 'Missing meta description',
          suggestion: 'Add a compelling meta description',
          impact: 'high'
        });
        score -= 15;
      } else {
        if (description.length < 120) {
          issues.push({
            type: 'warning',
            category: 'On-Page SEO',
            message: 'Description is too short',
            suggestion: 'Expand description to 120-160 characters',
            impact: 'medium'
          });
          score -= 5;
        } else if (description.length > 160) {
          issues.push({
            type: 'warning',
            category: 'On-Page SEO',
            message: 'Description is too long',
            suggestion: 'Shorten description to under 160 characters',
            impact: 'medium'
          });
          score -= 5;
        }
      }

      // Analyze headings
      headingStructure = this.analyzeHeadingStructure(dom);
      if (headingStructure.score < 80) {
        issues.push({
          type: 'warning',
          category: 'Content Structure',
          message: 'Poor heading structure',
          suggestion: 'Use proper H1, H2, H3 hierarchy',
          impact: 'medium'
        });
        score -= 10;
      }

      // Analyze images
      imageOptimization = this.analyzeImages(dom);
      if (imageOptimization.score < 80) {
        issues.push({
          type: 'warning',
          category: 'Image Optimization',
          message: 'Images need optimization',
          suggestion: 'Add alt text and optimize image sizes',
          impact: 'medium'
        });
        score -= 10;
      }

      // Analyze internal links
      internalLinks = this.analyzeInternalLinks(dom);
      if (internalLinks.count < 3) {
        issues.push({
          type: 'info',
          category: 'Link Building',
          message: 'Few internal links',
          suggestion: 'Add more internal links to related content',
          impact: 'low'
        });
        score -= 5;
      }

      // Analyze content quality
      const contentAnalysis = this.analyzeContent(content);
      if (contentAnalysis.wordCount < 300) {
        issues.push({
          type: 'warning',
          category: 'Content Quality',
          message: 'Content is too short',
          suggestion: 'Add more valuable content (300+ words)',
          impact: 'medium'
        });
        score -= 10;
      }

      // Generate recommendations
      recommendations.push(...this.generateRecommendations(issues));
    }

    // Calculate grade
    const grade = this.calculateGrade(score);

    return {
      score: Math.max(0, score),
      grade,
      issues,
      recommendations,
      metrics: {
        titleLength: title?.length || 0,
        descriptionLength: description?.length || 0,
        keywordDensity: 0, // Would need keyword analysis
        headingStructure: headingStructure?.score || 0,
        imageOptimization: imageOptimization?.score || 0,
        internalLinks: internalLinks?.count || 0,
        externalLinks: 0, // Would need external link analysis
        pageSpeed: 0, // Would need performance analysis
        mobileFriendly: true, // Would need mobile analysis
      }
    };
  }

  /**
   * Analyze keyword density and distribution
   */
  analyzeKeywords(content: string, targetKeywords: string[]): KeywordAnalysis {
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    const distribution: { [keyword: string]: number } = {};
    
    targetKeywords.forEach(keyword => {
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      let count = 0;
      
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        if (words.slice(i, i + keywordWords.length).join(' ') === keyword.toLowerCase()) {
          count++;
        }
      }
      
      distribution[keyword] = count;
    });

    const primary = targetKeywords[0] || '';
    const secondary = targetKeywords.slice(1, 4);
    const longTail = targetKeywords.filter(k => k.split(' ').length > 2);
    
    const totalKeywordCount = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const density = totalWords > 0 ? (totalKeywordCount / totalWords) * 100 : 0;

    return {
      primary,
      secondary,
      longTail,
      density,
      distribution,
      suggestions: this.generateKeywordSuggestions(content, targetKeywords)
    };
  }

  /**
   * Analyze content readability and quality
   */
  analyzeContentQuality(content: string): ContentOptimization {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Calculate readability scores
    const fleschReadingEase = this.calculateFleschReadingEase(sentences, words);
    const fleschKincaidGrade = this.calculateFleschKincaidGrade(sentences, words);
    const gunningFogIndex = this.calculateGunningFogIndex(sentences, words);
    const automatedReadabilityIndex = this.calculateAutomatedReadabilityIndex(sentences, words);

    // Calculate passive voice percentage
    const passiveVoicePercentage = this.calculatePassiveVoicePercentage(sentences);

    return {
      readabilityScore: fleschReadingEase,
      wordCount,
      sentenceCount,
      averageWordsPerSentence,
      passiveVoicePercentage,
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFogIndex,
      automatedReadabilityIndex,
    };
  }

  /**
   * Generate comprehensive meta tags
   */
  generateAdvancedMetaTags(pageData: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url: string;
    type?: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
    tags?: string[];
    locale?: string;
  }): string {
    const {
      title,
      description,
      keywords = [],
      image,
      url,
      type = 'website',
      publishedTime,
      modifiedTime,
      author,
      category,
      tags = [],
      locale = 'en'
    } = pageData;

    const fullTitle = title.includes(this.config.siteName) 
      ? title 
      : `${title} | ${this.config.siteName}`;

    const fullDescription = description.length > 160 
      ? description.substring(0, 157) + '...' 
      : description;

    const fullImage = image || this.config.defaultImage;
    const canonicalUrl = url.startsWith('http') ? url : `${this.config.siteUrl}${url}`;

    return `
    <!-- Primary Meta Tags -->
    <title>${fullTitle}</title>
    <meta name="title" content="${fullTitle}">
    <meta name="description" content="${fullDescription}">
    <meta name="keywords" content="${keywords.join(', ')}">
    <meta name="author" content="${author || 'Razewire'}">
    <meta name="robots" content="index, follow">
    <meta name="language" content="${locale}">
    <meta name="revisit-after" content="1 days">
    <meta name="distribution" content="global">
    <meta name="rating" content="general">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${fullDescription}">
    <meta property="og:image" content="${fullImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${this.config.siteName}">
    <meta property="og:locale" content="${locale === 'kh' ? 'km_KH' : 'en_US'}">
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
    ${author ? `<meta property="article:author" content="${author}">` : ''}
    ${category ? `<meta property="article:section" content="${category}">` : ''}
    ${tags.length > 0 ? `<meta property="article:tag" content="${tags.join(', ')}">` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${canonicalUrl}">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${fullDescription}">
    <meta name="twitter:image" content="${fullImage}">
    <meta name="twitter:site" content="${this.config.twitterHandle}">
    <meta name="twitter:creator" content="${this.config.twitterHandle}">

    <!-- Additional Meta Tags -->
    <meta name="theme-color" content="#000000">
    <meta name="msapplication-TileColor" content="#000000">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="${this.config.siteName}">
    <meta name="application-name" content="${this.config.siteName}">
    <meta name="msapplication-tooltip" content="${fullDescription}">
    <meta name="msapplication-starturl" content="${this.config.siteUrl}">

    <!-- Verification Tags -->
    ${this.config.googleSearchConsoleId ? `<meta name="google-site-verification" content="${this.config.googleSearchConsoleId}">` : ''}
    ${this.config.bingWebmasterId ? `<meta name="msvalidate.01" content="${this.config.bingWebmasterId}">` : ''}
    ${this.config.yandexWebmasterId ? `<meta name="yandex-verification" content="${this.config.yandexWebmasterId}">` : ''}
    ${this.config.baiduWebmasterId ? `<meta name="baidu-site-verification" content="${this.config.baiduWebmasterId}">` : ''}
    ${this.config.naverWebmasterId ? `<meta name="naver-site-verification" content="${this.config.naverWebmasterId}">` : ''}

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "${type === 'article' ? 'Article' : 'WebPage'}",
      "headline": "${fullTitle}",
      "description": "${fullDescription}",
      "image": "${fullImage}",
      "url": "${canonicalUrl}",
      "publisher": {
        "@type": "Organization",
        "name": "${this.config.siteName}",
        "logo": {
          "@type": "ImageObject",
          "url": "${this.config.siteUrl}/logo.png"
        }
      }${type === 'article' ? `,
      "datePublished": "${publishedTime || ''}",
      "dateModified": "${modifiedTime || ''}",
      "author": {
        "@type": "Person",
        "name": "${author || 'Razewire Author'}"
      }` : ''}
    }
    </script>
    `;
  }

  /**
   * Generate sitemap with advanced features
   */
  generateAdvancedSitemap(pages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    images?: Array<{
      url: string;
      title?: string;
      caption?: string;
    }>;
  }>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    ${page.images ? page.images.map(image => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      ${image.title ? `<image:title>${image.title}</image:title>` : ''}
      ${image.caption ? `<image:caption>${image.caption}</image:caption>` : ''}
    </image:image>`).join('') : ''}
  </url>`).join('')}
</urlset>`;

    return sitemap;
  }

  /**
   * Generate robots.txt with advanced features
   */
  generateAdvancedRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${this.config.siteUrl}/sitemap.xml
Sitemap: ${this.config.siteUrl}/news-sitemap.xml
Sitemap: ${this.config.siteUrl}/image-sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /private/
Disallow: /temp/
Disallow: /*.json$
Disallow: /*.xml$

# Allow important pages
Allow: /news/
Allow: /categories/
Allow: /search/
Allow: /sitemap-page/

# Crawl delay for different bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2

User-agent: Slurp
Crawl-delay: 3

User-agent: DuckDuckBot
Crawl-delay: 1

User-agent: Baiduspider
Crawl-delay: 2

User-agent: YandexBot
Crawl-delay: 2

User-agent: facebookexternalhit
Crawl-delay: 1

User-agent: Twitterbot
Crawl-delay: 1

User-agent: LinkedInBot
Crawl-delay: 1

# Host
Host: ${this.config.siteUrl}
`;
  }

  // Helper methods
  private extractTitle(dom: Document): string | null {
    const title = dom.querySelector('title');
    return title ? title.textContent : null;
  }

  private extractMetaDescription(dom: Document): string | null {
    const description = dom.querySelector('meta[name="description"]');
    return description ? description.getAttribute('content') : null;
  }

  private analyzeHeadingStructure(dom: Document): { score: number; issues: string[] } {
    const headings = dom.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const h1Count = dom.querySelectorAll('h1').length;
    const issues: string[] = [];
    let score = 100;

    if (h1Count === 0) {
      issues.push('Missing H1 tag');
      score -= 30;
    } else if (h1Count > 1) {
      issues.push('Multiple H1 tags');
      score -= 20;
    }

    if (headings.length < 2) {
      issues.push('Insufficient heading structure');
      score -= 20;
    }

    return { score, issues };
  }

  private analyzeImages(dom: Document): { score: number; issues: string[] } {
    const images = dom.querySelectorAll('img');
    const issues: string[] = [];
    let score = 100;

    images.forEach(img => {
      if (!img.alt) {
        issues.push('Image missing alt text');
        score -= 10;
      }
      if (!img.src) {
        issues.push('Image missing src');
        score -= 20;
      }
    });

    return { score, issues };
  }

  private analyzeInternalLinks(dom: Document): { count: number; issues: string[] } {
    const links = dom.querySelectorAll('a[href]');
    const internalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href');
      return href && (href.startsWith('/') || href.includes(this.config.siteUrl));
    });

    return { count: internalLinks.length, issues: [] };
  }

  private analyzeContent(content: string): { wordCount: number; issues: string[] } {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    return { wordCount: words.length, issues: [] };
  }

  private generateRecommendations(issues: SEOAuditResult['issues']): SEOAuditResult['recommendations'] {
    const recommendations: SEOAuditResult['recommendations'] = [];

    if (issues.some(i => i.category === 'On-Page SEO')) {
      recommendations.push({
        priority: 'high',
        category: 'On-Page SEO',
        title: 'Optimize Meta Tags',
        description: 'Improve title and description tags for better search visibility',
        action: 'Update meta tags with relevant keywords and compelling descriptions'
      });
    }

    if (issues.some(i => i.category === 'Content Quality')) {
      recommendations.push({
        priority: 'high',
        category: 'Content Quality',
        title: 'Improve Content Quality',
        description: 'Add more valuable and comprehensive content',
        action: 'Expand content to 300+ words with relevant information'
      });
    }

    return recommendations;
  }

  private calculateGrade(score: number): SEOAuditResult['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateKeywordSuggestions(content: string, targetKeywords: string[]): string[] {
    // Simple keyword suggestion based on content analysis
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: { [word: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Readability calculation methods
  private calculateFleschReadingEase(sentences: string[], words: string[]): number {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    if (totalSentences === 0 || totalWords === 0) return 0;
    
    return 206.835 - (1.015 * (totalWords / totalSentences)) - (84.6 * (totalSyllables / totalWords));
  }

  private calculateFleschKincaidGrade(sentences: string[], words: string[]): number {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    if (totalSentences === 0 || totalWords === 0) return 0;
    
    return (0.39 * (totalWords / totalSentences)) + (11.8 * (totalSyllables / totalWords)) - 15.59;
  }

  private calculateGunningFogIndex(sentences: string[], words: string[]): number {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const complexWords = words.filter(word => this.countSyllables(word) > 2).length;
    
    if (totalSentences === 0 || totalWords === 0) return 0;
    
    return 0.4 * ((totalWords / totalSentences) + (100 * (complexWords / totalWords)));
  }

  private calculateAutomatedReadabilityIndex(sentences: string[], words: string[]): number {
    const totalWords = words.length;
    const totalSentences = sentences.length;
    const totalCharacters = words.join('').length;
    
    if (totalSentences === 0 || totalWords === 0) return 0;
    
    return (4.71 * (totalCharacters / totalWords)) + (0.5 * (totalWords / totalSentences)) - 21.43;
  }

  private calculatePassiveVoicePercentage(sentences: string[]): number {
    const passiveVoicePatterns = [
      /\b(was|were|been|being)\s+\w+ed\b/gi,
      /\b(was|were|been|being)\s+\w+en\b/gi,
      /\b(was|were|been|being)\s+\w+ing\b/gi
    ];
    
    let passiveCount = 0;
    sentences.forEach(sentence => {
      passiveVoicePatterns.forEach(pattern => {
        if (pattern.test(sentence)) {
          passiveCount++;
        }
      });
    });
    
    return sentences.length > 0 ? (passiveCount / sentences.length) * 100 : 0;
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    if (word.endsWith('e')) syllableCount--;
    if (syllableCount === 0) syllableCount = 1;
    
    return syllableCount;
  }
}

export default AdvancedSEO;


