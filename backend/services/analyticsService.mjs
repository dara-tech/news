import mongoose from 'mongoose';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

class AnalyticsService {
  constructor() {
    this.metrics = new Map();
    this.realTimeData = new Map();
    this.aggregationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Track page view
   */
  async trackPageView(page, userId = null, metadata = {}) {
    try {
      const viewData = {
        page,
        userId,
        timestamp: new Date(),
        userAgent: metadata.userAgent,
        referrer: metadata.referrer,
        ip: metadata.ip,
        sessionId: metadata.sessionId,
        ...metadata
      };

      // Store in real-time data
      this.updateRealTimeMetric('pageViews', 1);
      
      // Store in database (you might want to create a PageView model)
      // await PageView.create(viewData);
      
      logger.debug(`Page view tracked: ${page} by user ${userId || 'anonymous'}`);
      return viewData;
    } catch (error) {
      logger.error('Page view tracking error:', error);
    }
  }

  /**
   * Track article view
   */
  async trackArticleView(articleId, userId = null, metadata = {}) {
    try {
      // Update article view count
      await News.findByIdAndUpdate(articleId, {
        $inc: { views: 1 }
      });

      // Track detailed view data
      const viewData = {
        articleId,
        userId,
        timestamp: new Date(),
        readTime: metadata.readTime,
        scrollDepth: metadata.scrollDepth,
        userAgent: metadata.userAgent,
        referrer: metadata.referrer,
        ip: metadata.ip,
        sessionId: metadata.sessionId
      };

      // Update real-time metrics
      this.updateRealTimeMetric('articleViews', 1);
      this.updateRealTimeMetric('totalViews', 1);

      logger.debug(`Article view tracked: ${articleId} by user ${userId || 'anonymous'}`);
      return viewData;
    } catch (error) {
      logger.error('Article view tracking error:', error);
    }
  }

  /**
   * Track user engagement
   */
  async trackEngagement(userId, action, metadata = {}) {
    try {
      const engagementData = {
        userId,
        action,
        timestamp: new Date(),
        metadata
      };

      // Update real-time metrics
      this.updateRealTimeMetric('engagements', 1);
      this.updateRealTimeMetric(`engagement_${action}`, 1);

      logger.debug(`Engagement tracked: ${action} by user ${userId}`);
      return engagementData;
    } catch (error) {
      logger.error('Engagement tracking error:', error);
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(timeRange = '7d') {
    try {
      const cacheKey = `dashboard_${timeRange}`;
      const cached = this.aggregationCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const timeFilter = this.getTimeFilter(timeRange);
      
      const [
        totalArticles,
        publishedArticles,
        totalViews,
        totalUsers,
        trendingArticles,
        categoryStats,
        authorStats,
        recentActivity
      ] = await Promise.all([
        this.getTotalArticles(timeFilter),
        this.getPublishedArticles(timeFilter),
        this.getTotalViews(timeFilter),
        this.getTotalUsers(timeFilter),
        this.getTrendingArticles(timeFilter),
        this.getCategoryStats(timeFilter),
        this.getAuthorStats(timeFilter),
        this.getRecentActivity(timeFilter)
      ]);

      const dashboardData = {
        overview: {
          totalArticles,
          publishedArticles,
          totalViews,
          totalUsers,
          averageViewsPerArticle: publishedArticles > 0 ? Math.round(totalViews / publishedArticles) : 0
        },
        trending: trendingArticles,
        categories: categoryStats,
        authors: authorStats,
        recentActivity,
        realTime: this.getRealTimeMetrics(),
        timeRange
      };

      // Cache the result
      this.aggregationCache.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now()
      });

      return dashboardData;
    } catch (error) {
      logger.error('Dashboard data error:', error);
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }

  /**
   * Get content performance analytics
   */
  async getContentPerformance(articleId = null, timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      const matchFilter = { ...timeFilter };
      
      if (articleId) {
        matchFilter._id = new mongoose.Types.ObjectId(articleId);
      }

      const pipeline = [
        { $match: matchFilter },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryData'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorData'
          }
        },
        {
          $project: {
            title: 1,
            views: 1,
            publishedAt: 1,
            category: { $arrayElemAt: ['$categoryData.name.en', 0] },
            author: { $arrayElemAt: ['$authorData.name', 0] },
            isFeatured: 1,
            isBreaking: 1,
            status: 1
          }
        },
        {
          $sort: { views: -1 }
        }
      ];

      const results = await News.aggregate(pipeline);
      
      return {
        articles: results,
        summary: {
          totalArticles: results.length,
          totalViews: results.reduce((sum, article) => sum + article.views, 0),
          averageViews: results.length > 0 ? Math.round(results.reduce((sum, article) => sum + article.views, 0) / results.length) : 0,
          topPerformer: results[0] || null
        }
      };
    } catch (error) {
      logger.error('Content performance error:', error);
      throw new Error(`Failed to get content performance: ${error.message}`);
    }
  }

  /**
   * Get user engagement analytics
   */
  async getUserEngagement(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const pipeline = [
        { $match: timeFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [{ $gt: ['$lastLogin', null] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ];

      const results = await User.aggregate(pipeline);
      
      return {
        dailyEngagement: results,
        summary: {
          totalUsers: results.reduce((sum, day) => sum + day.totalUsers, 0),
          activeUsers: results.reduce((sum, day) => sum + day.activeUsers, 0),
          averageDailyActive: results.length > 0 ? Math.round(results.reduce((sum, day) => sum + day.activeUsers, 0) / results.length) : 0
        }
      };
    } catch (error) {
      logger.error('User engagement error:', error);
      throw new Error(`Failed to get user engagement: ${error.message}`);
    }
  }

  /**
   * Get SEO analytics
   */
  async getSEOAnalytics(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const pipeline = [
        { $match: { ...timeFilter, status: 'published' } },
        {
          $project: {
            title: 1,
            slug: 1,
            metaDescription: 1,
            keywords: 1,
            views: 1,
            publishedAt: 1,
            hasMetaDescription: { $cond: [{ $ne: ['$metaDescription.en', null] }, 1, 0] },
            hasKeywords: { $cond: [{ $ne: ['$keywords', null] }, 1, 0] },
            titleLength: { $strLenCP: '$title.en' },
            descriptionLength: { $strLenCP: '$metaDescription.en' }
          }
        }
      ];

      const results = await News.aggregate(pipeline);
      
      const seoStats = {
        totalArticles: results.length,
        withMetaDescription: results.filter(article => article.hasMetaDescription).length,
        withKeywords: results.filter(article => article.hasKeywords).length,
        averageTitleLength: results.length > 0 ? Math.round(results.reduce((sum, article) => sum + article.titleLength, 0) / results.length) : 0,
        averageDescriptionLength: results.length > 0 ? Math.round(results.reduce((sum, article) => sum + article.descriptionLength, 0) / results.length) : 0,
        seoScore: this.calculateSEOScore(results)
      };

      return {
        stats: seoStats,
        articles: results.slice(0, 20), // Top 20 for detailed view
        recommendations: this.generateSEORecommendations(seoStats)
      };
    } catch (error) {
      logger.error('SEO analytics error:', error);
      throw new Error(`Failed to get SEO analytics: ${error.message}`);
    }
  }

  /**
   * Get social media analytics
   */
  async getSocialMediaAnalytics(timeRange = '30d') {
    try {
      // This would integrate with your social media service
      const socialStats = {
        platforms: {
          facebook: { posts: 0, engagement: 0, reach: 0 },
          twitter: { posts: 0, engagement: 0, reach: 0 },
          linkedin: { posts: 0, engagement: 0, reach: 0 },
          telegram: { posts: 0, engagement: 0, reach: 0 }
        },
        totalPosts: 0,
        totalEngagement: 0,
        topPerformingPlatform: 'telegram',
        engagementRate: 0.05
      };

      return socialStats;
    } catch (error) {
      logger.error('Social media analytics error:', error);
      throw new Error(`Failed to get social media analytics: ${error.message}`);
    }
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics() {
    return {
      activeUsers: this.realTimeData.get('activeUsers') || 0,
      pageViews: this.realTimeData.get('pageViews') || 0,
      articleViews: this.realTimeData.get('articleViews') || 0,
      engagements: this.realTimeData.get('engagements') || 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Update real-time metric
   */
  updateRealTimeMetric(metric, increment = 1) {
    const current = this.realTimeData.get(metric) || 0;
    this.realTimeData.set(metric, current + increment);
  }

  /**
   * Get time filter for aggregation
   */
  getTimeFilter(timeRange) {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
      createdAt: { $gte: startDate, $lte: now }
    };
  }

  /**
   * Helper methods for dashboard data
   */
  async getTotalArticles(timeFilter) {
    return await News.countDocuments(timeFilter);
  }

  async getPublishedArticles(timeFilter) {
    return await News.countDocuments({ ...timeFilter, status: 'published' });
  }

  async getTotalViews(timeFilter) {
    const result = await News.aggregate([
      { $match: timeFilter },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    return result[0]?.total || 0;
  }

  async getTotalUsers(timeFilter) {
    return await User.countDocuments(timeFilter);
  }

  async getTrendingArticles(timeFilter) {
    return await News.find({ ...timeFilter, status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .populate('category', 'name')
      .populate('author', 'name')
      .select('title views publishedAt category author');
  }

  async getCategoryStats(timeFilter) {
    const pipeline = [
      { $match: { ...timeFilter, status: 'published' } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$categoryData.name.en', 0] },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await News.aggregate(pipeline);
  }

  async getAuthorStats(timeFilter) {
    const pipeline = [
      { $match: { ...timeFilter, status: 'published' } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorData'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$authorData.name', 0] },
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await News.aggregate(pipeline);
  }

  async getRecentActivity(timeFilter) {
    return await News.find(timeFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'name')
      .select('title status createdAt author');
  }

  /**
   * Calculate SEO score
   */
  calculateSEOScore(articles) {
    if (articles.length === 0) return 0;

    let score = 0;
    let totalWeight = 0;

    // Meta description weight: 30%
    const metaDescWeight = 30;
    const metaDescScore = (articles.filter(a => a.hasMetaDescription).length / articles.length) * 100;
    score += (metaDescScore * metaDescWeight) / 100;
    totalWeight += metaDescWeight;

    // Keywords weight: 20%
    const keywordsWeight = 20;
    const keywordsScore = (articles.filter(a => a.hasKeywords).length / articles.length) * 100;
    score += (keywordsScore * keywordsWeight) / 100;
    totalWeight += keywordsWeight;

    // Title length weight: 25%
    const titleWeight = 25;
    const titleScore = articles.filter(a => a.titleLength >= 30 && a.titleLength <= 60).length / articles.length * 100;
    score += (titleScore * titleWeight) / 100;
    totalWeight += titleWeight;

    // Description length weight: 25%
    const descWeight = 25;
    const descScore = articles.filter(a => a.descriptionLength >= 120 && a.descriptionLength <= 160).length / articles.length * 100;
    score += (descScore * descWeight) / 100;
    totalWeight += descWeight;

    return Math.round(score);
  }

  /**
   * Generate SEO recommendations
   */
  generateSEORecommendations(stats) {
    const recommendations = [];

    if (stats.withMetaDescription / stats.totalArticles < 0.8) {
      recommendations.push({
        type: 'meta_description',
        priority: 'high',
        message: 'Add meta descriptions to improve SEO',
        percentage: Math.round((stats.withMetaDescription / stats.totalArticles) * 100)
      });
    }

    if (stats.withKeywords / stats.totalArticles < 0.6) {
      recommendations.push({
        type: 'keywords',
        priority: 'medium',
        message: 'Add keywords to articles for better discoverability',
        percentage: Math.round((stats.withKeywords / stats.totalArticles) * 100)
      });
    }

    if (stats.averageTitleLength < 30 || stats.averageTitleLength > 60) {
      recommendations.push({
        type: 'title_length',
        priority: 'medium',
        message: 'Optimize title lengths (30-60 characters recommended)',
        current: stats.averageTitleLength
      });
    }

    if (stats.averageDescriptionLength < 120 || stats.averageDescriptionLength > 160) {
      recommendations.push({
        type: 'description_length',
        priority: 'medium',
        message: 'Optimize meta description lengths (120-160 characters recommended)',
        current: stats.averageDescriptionLength
      });
    }

    return recommendations;
  }

  /**
   * Clear analytics cache
   */
  clearCache() {
    this.aggregationCache.clear();
    logger.info('Analytics cache cleared');
  }

  /**
   * Get analytics service statistics
   */
  getStats() {
    return {
      cacheSize: this.aggregationCache.size,
      realTimeMetrics: this.realTimeData.size,
      cacheTimeout: this.cacheTimeout
    };
  }
}

export default new AnalyticsService();
