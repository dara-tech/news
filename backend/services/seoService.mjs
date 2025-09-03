/**
 * Comprehensive SEO Service for News Articles
 * Handles all aspects of SEO optimization and ranking
 */

import { extractContentInfo, calculateReadTime } from '../utils/contentFormatter.mjs';
import logger from '../utils/logger.mjs';

export class SEOService {
  constructor() {
    this.seoFactors = {
      contentQuality: 0.25,      // 25% - Content quality and relevance
      technicalSEO: 0.20,        // 20% - Technical SEO factors
      userEngagement: 0.20,      // 20% - User engagement metrics
      socialSignals: 0.15,       // 15% - Social media and sharing
      backlinks: 0.10,           // 10% - Backlinks and references
      freshness: 0.10            // 10% - Content freshness and updates
    };
  }

  /**
   * Calculate comprehensive SEO score for an article
   */
  async calculateSEOScore(article) {
    try {
      const scores = {
        contentQuality: await this.analyzeContentQuality(article),
        technicalSEO: await this.analyzeTechnicalSEO(article),
        userEngagement: await this.analyzeUserEngagement(article),
        socialSignals: await this.analyzeSocialSignals(article),
        backlinks: await this.analyzeBacklinks(article),
        freshness: await this.analyzeFreshness(article)
      };

      // Calculate weighted score
      let totalScore = 0;
      let totalWeight = 0;

      for (const [factor, weight] of Object.entries(this.seoFactors)) {
        totalScore += scores[factor] * weight;
        totalWeight += weight;
      }

      const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

      return {
        overallScore: Math.round(finalScore * 100),
        factorScores: scores,
        recommendations: await this.generateRecommendations(scores, article),
        seoGrade: this.getSEOGrade(finalScore),
        priorityActions: await this.getPriorityActions(scores, article)
      };
    } catch (error) {
      logger.error('Error calculating SEO score:', error);
      return null;
    }
  }

  /**
   * Analyze content quality (25% of total score)
   */
  async analyzeContentQuality(article) {
    let score = 0;
    const content = article.content?.en || '';
    const title = article.title?.en || '';
    const description = article.description?.en || '';

    // Content length analysis
    const contentInfo = extractContentInfo(content);
    const wordCount = contentInfo.wordCount;
    
    if (wordCount >= 1500) score += 25;        // Excellent length
    else if (wordCount >= 1000) score += 20;   // Good length
    else if (wordCount >= 600) score += 15;    // Acceptable length
    else if (wordCount >= 300) score += 10;    // Minimum length
    else score += 5;                           // Too short

    // Title optimization
    const titleLength = title.length;
    if (titleLength >= 30 && titleLength <= 60) score += 20;
    else if (titleLength >= 20 && titleLength <= 70) score += 15;
    else score += 10;

    // Description optimization
    const descLength = description.length;
    if (descLength >= 120 && descLength <= 160) score += 20;
    else if (descLength >= 100 && descLength <= 180) score += 15;
    else score += 10;

    // Content structure
    if (content.includes('<h2>')) score += 15;
    if (content.includes('<blockquote>')) score += 5;
    if (content.includes('<ul>') || content.includes('<ol>')) score += 5;

    // Keyword density and relevance
    const keywordScore = this.analyzeKeywordOptimization(article);
    score += keywordScore;

    return Math.min(100, score);
  }

  /**
   * Analyze technical SEO factors (20% of total score)
   */
  async analyzeTechnicalSEO(article) {
    let score = 0;

    // URL structure
    const slug = article.slug || '';
    if (slug.length > 0 && slug.length <= 60) score += 20;
    else if (slug.length <= 80) score += 15;
    else score += 10;

    // Meta tags
    if (article.metaDescription?.en) score += 15;
    if (article.keywords) score += 10;

    // Image optimization
    if (article.thumbnail) score += 15;
    if (article.images && article.images.length > 0) score += 10;

    // Schema markup potential
    score += 10; // Base score for having structured data potential

    // Mobile optimization (assumed good with modern framework)
    score += 10;

    // Page speed optimization (assumed good with Next.js)
    score += 10;

    return Math.min(100, score);
  }

  /**
   * Analyze user engagement metrics (20% of total score)
   */
  async analyzeUserEngagement(article) {
    let score = 0;

    // View count
    const views = article.views || 0;
    if (views >= 1000) score += 30;
    else if (views >= 500) score += 25;
    else if (views >= 100) score += 20;
    else if (views >= 50) score += 15;
    else if (views >= 10) score += 10;
    else score += 5;

    // Featured status
    if (article.isFeatured) score += 20;

    // Breaking news status
    if (article.isBreaking) score += 15;

    // Read time optimization
    const content = article.content?.en || '';
    const readTime = calculateReadTime(content);
    if (readTime >= 3 && readTime <= 8) score += 20; // Optimal read time
    else if (readTime >= 2 && readTime <= 10) score += 15;
    else score += 10;

    // Content freshness (recent articles get bonus)
    const daysSincePublished = this.getDaysSincePublished(article.publishedAt);
    if (daysSincePublished <= 7) score += 15;
    else if (daysSincePublished <= 30) score += 10;
    else if (daysSincePublished <= 90) score += 5;

    return Math.min(100, score);
  }

  /**
   * Analyze social signals (15% of total score)
   */
  async analyzeSocialSignals(article) {
    let score = 0;

    // Social sharing potential
    const title = article.title?.en || '';
    const hasEmotionalTriggers = this.hasEmotionalTriggers(title);
    if (hasEmotionalTriggers) score += 25;

    // Trending topics
    const isTrending = await this.checkTrendingTopics(article);
    if (isTrending) score += 25;

    // Social media optimization
    if (article.thumbnail) score += 20; // Good for social sharing

    // Content virality potential
    const viralityScore = this.calculateViralityPotential(article);
    score += viralityScore;

    // Engagement potential
    const engagementScore = this.calculateEngagementPotential(article);
    score += engagementScore;

    return Math.min(100, score);
  }

  /**
   * Analyze backlinks and references (10% of total score)
   */
  async analyzeBacklinks(article) {
    let score = 0;

    // Internal linking potential
    const content = article.content?.en || '';
    const internalLinks = this.countInternalLinks(content);
    if (internalLinks >= 3) score += 30;
    else if (internalLinks >= 1) score += 20;
    else score += 10;

    // External reference potential
    const externalReferences = this.countExternalReferences(content);
    if (externalReferences >= 2) score += 25;
    else if (externalReferences >= 1) score += 15;
    else score += 10;

    // Authority building potential
    const authorityScore = this.calculateAuthorityPotential(article);
    score += authorityScore;

    return Math.min(100, score);
  }

  /**
   * Analyze content freshness (10% of total score)
   */
  async analyzeFreshness(article) {
    let score = 0;

    const daysSincePublished = this.getDaysSincePublished(article.publishedAt);
    const daysSinceUpdated = this.getDaysSinceUpdated(article.updatedAt);

    // Publication recency
    if (daysSincePublished <= 1) score += 40;
    else if (daysSincePublished <= 7) score += 30;
    else if (daysSincePublished <= 30) score += 20;
    else if (daysSincePublished <= 90) score += 10;
    else score += 5;

    // Update recency
    if (daysSinceUpdated <= 7) score += 30;
    else if (daysSinceUpdated <= 30) score += 20;
    else if (daysSinceUpdated <= 90) score += 10;
    else score += 5;

    // Content evergreen potential
    const evergreenScore = this.calculateEvergreenPotential(article);
    score += evergreenScore;

    return Math.min(100, score);
  }

  /**
   * Generate SEO recommendations
   */
  async generateRecommendations(scores, article) {
    const recommendations = [];

    // Content quality recommendations
    if (scores.contentQuality < 70) {
      const content = article.content?.en || '';
      const wordCount = content.split(/\s+/).length;
      
      if (wordCount < 600) {
        recommendations.push({
          priority: 'high',
          category: 'content',
          title: 'Expand Content Length',
          description: `Current content has ${wordCount} words. Aim for at least 600-1000 words for better SEO.`,
          action: 'add_more_content'
        });
      }

      if (!content.includes('<h2>')) {
        recommendations.push({
          priority: 'high',
          category: 'content',
          title: 'Add Section Headings',
          description: 'Break content into sections with H2 headings for better structure.',
          action: 'add_headings'
        });
      }
    }

    // Technical SEO recommendations
    if (scores.technicalSEO < 70) {
      if (!article.metaDescription?.en) {
        recommendations.push({
          priority: 'high',
          category: 'technical',
          title: 'Add Meta Description',
          description: 'Meta descriptions improve click-through rates from search results.',
          action: 'add_meta_description'
        });
      }

      if (!article.keywords) {
        recommendations.push({
          priority: 'medium',
          category: 'technical',
          title: 'Add Keywords',
          description: 'Keywords help search engines understand your content.',
          action: 'add_keywords'
        });
      }
    }

    // User engagement recommendations
    if (scores.userEngagement < 60) {
      if (!article.isFeatured) {
        recommendations.push({
          priority: 'medium',
          category: 'engagement',
          title: 'Consider Featured Status',
          description: 'Featured articles typically get more visibility and engagement.',
          action: 'make_featured'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get priority actions for SEO improvement
   */
  async getPriorityActions(scores, article) {
    const actions = [];

    // High priority actions
    if (scores.contentQuality < 60) {
      actions.push({
        priority: 'high',
        action: 'improve_content_quality',
        description: 'Expand content and add proper structure'
      });
    }

    if (scores.technicalSEO < 60) {
      actions.push({
        priority: 'high',
        action: 'fix_technical_seo',
        description: 'Add missing meta tags and optimize URL'
      });
    }

    // Medium priority actions
    if (scores.userEngagement < 70) {
      actions.push({
        priority: 'medium',
        action: 'boost_engagement',
        description: 'Improve user engagement metrics'
      });
    }

    return actions;
  }

  /**
   * Get SEO grade based on score
   */
  getSEOGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B+';
    if (score >= 0.6) return 'B';
    if (score >= 0.5) return 'C+';
    if (score >= 0.4) return 'C';
    if (score >= 0.3) return 'D';
    return 'F';
  }

  /**
   * Helper methods
   */
  analyzeKeywordOptimization(article) {
    let score = 0;
    const title = article.title?.en || '';
    const content = article.content?.en || '';
    const keywords = article.keywords || '';

    // Title keyword presence
    if (keywords && title.toLowerCase().includes(keywords.toLowerCase())) {
      score += 10;
    }

    // Content keyword density
    if (keywords && content.toLowerCase().includes(keywords.toLowerCase())) {
      score += 10;
    }

    return score;
  }

  hasEmotionalTriggers(title) {
    const emotionalWords = [
      'breaking', 'urgent', 'shocking', 'amazing', 'incredible', 'exclusive',
      'latest', 'new', 'first', 'only', 'best', 'worst', 'top', 'critical'
    ];
    return emotionalWords.some(word => title.toLowerCase().includes(word));
  }

  async checkTrendingTopics(article) {
    // This would integrate with trending topics API
    // For now, return false
    return false;
  }

  calculateViralityPotential(article) {
    let score = 0;
    const title = article.title?.en || '';
    
    // Check for viral triggers
    if (title.includes('?')) score += 5; // Question titles
    if (title.includes('!')) score += 5; // Exclamation marks
    if (title.includes('How') || title.includes('Why')) score += 5; // How/Why titles
    
    return score;
  }

  calculateEngagementPotential(article) {
    let score = 0;
    const content = article.content?.en || '';
    
    // Content that encourages engagement
    if (content.includes('?')) score += 5; // Questions in content
    if (content.includes('comment') || content.includes('share')) score += 5;
    
    return score;
  }

  countInternalLinks(content) {
    // Count potential internal link opportunities
    const internalKeywords = ['Cambodia', 'Thailand', 'ASEAN', 'government'];
    return internalKeywords.filter(keyword => content.includes(keyword)).length;
  }

  countExternalReferences(content) {
    // Count potential external references
    const externalIndicators = ['according to', 'reported by', 'said', 'announced'];
    return externalIndicators.filter(indicator => content.includes(indicator)).length;
  }

  calculateAuthorityPotential(article) {
    let score = 0;
    
    // Author credibility
    if (article.author?.role === 'admin') score += 10;
    
    // Content type
    if (article.isBreaking) score += 5;
    if (article.isFeatured) score += 5;
    
    return score;
  }

  calculateEvergreenPotential(article) {
    let score = 0;
    const title = article.title?.en || '';
    const content = article.content?.en || '';
    
    // Evergreen content indicators
    const evergreenKeywords = ['guide', 'how to', 'tips', 'best practices', 'complete'];
    const hasEvergreenKeywords = evergreenKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
    );
    
    if (hasEvergreenKeywords) score += 20;
    
    return score;
  }

  getDaysSincePublished(publishedAt) {
    if (!publishedAt) return 999;
    const now = new Date();
    const published = new Date(publishedAt);
    const diffTime = Math.abs(now - published);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSinceUpdated(updatedAt) {
    if (!updatedAt) return 999;
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffTime = Math.abs(now - updated);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate SEO-optimized meta tags
   */
  generateMetaTags(article) {
    const title = article.title?.en || '';
    const description = article.description?.en || '';
    const keywords = article.keywords || '';
    const url = `${process.env.FRONTEND_URL}/news/${article.slug}`;
    const image = article.thumbnail || '';

    return {
      title: this.optimizeTitle(title),
      description: this.optimizeDescription(description),
      keywords: this.optimizeKeywords(keywords, title),
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogUrl: url,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: image,
      canonicalUrl: url,
      structuredData: this.generateStructuredData(article)
    };
  }

  optimizeTitle(title) {
    // Ensure title is between 30-60 characters
    if (title.length < 30) {
      return `${title} - Latest News | Razewire`;
    } else if (title.length > 60) {
      return title.substring(0, 57) + '...';
    }
    return title;
  }

  optimizeDescription(description) {
    // Ensure description is between 120-160 characters
    if (description.length < 120) {
      return `${description} Read more about this breaking news story.`;
    } else if (description.length > 160) {
      return description.substring(0, 157) + '...';
    }
    return description;
  }

  optimizeKeywords(keywords, title) {
    const baseKeywords = ['Cambodia', 'news', 'Southeast Asia'];
    const titleKeywords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const allKeywords = [...baseKeywords, ...titleKeywords];
    
    return allKeywords.slice(0, 10).join(', ');
  }

  generateStructuredData(article) {
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title?.en,
      "description": article.description?.en,
      "image": article.thumbnail,
      "author": {
        "@type": "Person",
        "name": article.author?.username || "Razewire Staff"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Razewire",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.FRONTEND_URL}/logo.png`
        }
      },
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${process.env.FRONTEND_URL}/news/${article.slug}`
      }
    };
  }
}

export default new SEOService();

