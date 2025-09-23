/**
 * SEO optimization system for better search engine rankings
 */

interface SEOConfig {
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
}

interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
  structuredData?: any;
  robots: string;
  language: string;
}

interface SEOAudit {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

class SEOOptimizer {
  private static instance: SEOOptimizer;
  private config: SEOConfig;

  constructor() {
    this.config = {
      siteName: 'Razewire',
      siteUrl: 'https://www.razewire.online',
      defaultTitle: 'Razewire - Latest News & Updates',
      defaultDescription: 'Stay informed with the latest news in technology, business, and sports from Cambodia and around the world.',
      defaultImage: 'https://www.razewire.online/og-image.svg',
      twitterHandle: '@razewire',
      facebookAppId: '',
      googleAnalyticsId: '',
      googleSearchConsoleId: '',
      bingWebmasterId: ''
    };
  }

  static getInstance(): SEOOptimizer {
    if (!SEOOptimizer.instance) {
      SEOOptimizer.instance = new SEOOptimizer();
    }
    return SEOOptimizer.instance;
  }

  /**
   * Generate SEO meta tags for a page
   */
  generatePageSEO(pageData: {
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
  }): PageSEO {
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
      tags = []
    } = pageData;

    const fullTitle = title.includes(this.config.siteName) 
      ? title 
      : `${title} | ${this.config.siteName}`;

    const fullDescription = description.length > 160 
      ? description.substring(0, 157) + '...' 
      : description;

    const fullImage = image || this.config.defaultImage;
    const canonicalUrl = url.startsWith('http') ? url : `${this.config.siteUrl}${url}`;

    return {
      title: fullTitle,
      description: fullDescription,
      keywords: [...keywords, 'news', 'updates', 'cambodia'],
      canonicalUrl,
      ogTitle: fullTitle,
      ogDescription: fullDescription,
      ogImage: fullImage,
      ogType: type,
      twitterTitle: fullTitle,
      twitterDescription: fullDescription,
      twitterImage: fullImage,
      twitterCard: 'summary_large_image',
      structuredData: this.generateStructuredData(pageData),
      robots: 'index, follow',
      language: 'en'
    };
  }

  /**
   * Generate structured data for articles
   */
  private generateStructuredData(pageData: any): any {
    if (pageData.type === 'article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: pageData.title,
        description: pageData.description,
        image: pageData.image || this.config.defaultImage,
        datePublished: pageData.publishedTime,
        dateModified: pageData.modifiedTime || pageData.publishedTime,
        author: {
          '@type': 'Person',
          name: pageData.author || 'Razewire Editor'
        },
        publisher: {
          '@type': 'Organization',
          name: this.config.siteName,
          logo: {
            '@type': 'ImageObject',
            url: this.config.defaultImage
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageData.url
        }
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.config.siteUrl,
      description: this.config.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.config.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Generate sitemap data
   */
  generateSitemap(pages: Array<{
    url: string;
    lastModified: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

    return sitemap;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.config.siteUrl}/sitemap.xml
Sitemap: ${this.config.siteUrl}/news-sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /news/
Allow: /categories/
Allow: /search/
`;
  }

  /**
   * Audit page for SEO issues
   */
  auditPage(pageData: any): SEOAudit {
    const issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      suggestion: string;
    }> = [];
    const recommendations: string[] = [];

    // Check title
    if (!pageData.title) {
      issues.push({
        type: 'error',
        message: 'Missing page title',
        suggestion: 'Add a descriptive title tag'
      });
    } else if (pageData.title.length < 30) {
      issues.push({
        type: 'warning',
        message: 'Title is too short',
        suggestion: 'Make title more descriptive (30-60 characters)'
      });
    } else if (pageData.title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Title is too long',
        suggestion: 'Shorten title to under 60 characters'
      });
    }

    // Check description
    if (!pageData.description) {
      issues.push({
        type: 'error',
        message: 'Missing meta description',
        suggestion: 'Add a compelling meta description'
      });
    } else if (pageData.description.length < 120) {
      issues.push({
        type: 'warning',
        message: 'Description is too short',
        suggestion: 'Expand description to 120-160 characters'
      });
    } else if (pageData.description.length > 160) {
      issues.push({
        type: 'warning',
        message: 'Description is too long',
        suggestion: 'Shorten description to under 160 characters'
      });
    }

    // Check keywords
    if (!pageData.keywords || pageData.keywords.length === 0) {
      issues.push({
        type: 'info',
        message: 'No keywords specified',
        suggestion: 'Add relevant keywords for better SEO'
      });
    }

    // Check image
    if (!pageData.image) {
      issues.push({
        type: 'warning',
        message: 'No featured image',
        suggestion: 'Add a featured image for social sharing'
      });
    }

    // Check URL structure
    if (pageData.url && pageData.url.includes('?')) {
      issues.push({
        type: 'warning',
        message: 'URL contains query parameters',
        suggestion: 'Use clean URLs without query parameters'
      });
    }

    // Generate recommendations
    if (pageData.type === 'article') {
      recommendations.push('Add structured data for better search visibility');
      recommendations.push('Include internal links to related articles');
      recommendations.push('Optimize images with alt text');
    }

    recommendations.push('Ensure fast page loading speed');
    recommendations.push('Make content mobile-friendly');
    recommendations.push('Use heading tags (H1, H2, H3) properly');

    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));

    return {
      score,
      issues,
      recommendations
    };
  }

  /**
   * Optimize content for keywords
   */
  optimizeContent(content: string, keywords: string[]): string {
    let optimizedContent = content;

    // Add keywords naturally to content
    keywords.forEach(keyword => {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = optimizedContent.match(keywordRegex);
      
      if (!matches || matches.length < 2) {
        // Add keyword if it appears less than twice
        const sentences = optimizedContent.split('.');
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
          sentences[randomIndex] = sentences[randomIndex].trim() + ` ${keyword}.`;
          optimizedContent = sentences.join('.');
        }
      }
    });

    return optimizedContent;
  }

  /**
   * Generate meta tags HTML
   */
  generateMetaTags(seo: PageSEO): string {
    return `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <meta name="keywords" content="${seo.keywords.join(', ')}">
    <meta name="robots" content="${seo.robots}">
    <meta name="language" content="${seo.language}">
    <link rel="canonical" href="${seo.canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${seo.ogTitle}">
    <meta property="og:description" content="${seo.ogDescription}">
    <meta property="og:image" content="${seo.ogImage}">
    <meta property="og:url" content="${seo.canonicalUrl}">
    <meta property="og:type" content="${seo.ogType}">
    <meta property="og:site_name" content="${this.config.siteName}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${seo.twitterCard}">
    <meta name="twitter:title" content="${seo.twitterTitle}">
    <meta name="twitter:description" content="${seo.twitterDescription}">
    <meta name="twitter:image" content="${seo.twitterImage}">
    <meta name="twitter:site" content="${this.config.twitterHandle}">
    
    ${seo.structuredData ? `<script type="application/ld+json">${JSON.stringify(seo.structuredData)}</script>` : ''}
    `;
  }

  /**
   * Track SEO performance
   */
  async trackSEOPerformance(url: string): Promise<any> {
    try {
      // This would integrate with Google Search Console API
      const response = await fetch(`/api/seo/performance?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to track SEO performance:', error);
    }
    return null;
  }

  /**
   * Get SEO recommendations
   */
  getSEORecommendations(): string[] {
    return [
      'Publish high-quality content regularly',
      'Use long-tail keywords in your content',
      'Optimize images with descriptive alt text',
      'Build high-quality backlinks',
      'Improve page loading speed',
      'Make your site mobile-friendly',
      'Use internal linking strategy',
      'Create compelling meta descriptions',
      'Use header tags (H1, H2, H3) properly',
      'Monitor and fix broken links',
      'Submit sitemap to search engines',
      'Use Google Analytics and Search Console'
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SEOConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): SEOConfig {
    return { ...this.config };
  }
}

export default SEOOptimizer;


