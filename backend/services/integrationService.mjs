import logger from '../utils/logger.mjs';
import enhancedSocialMediaService from './enhancedSocialMediaService.mjs';
import redisCacheService from './redisCacheService.mjs';
import websocketService from './websocketService.mjs';
import aiEnhancementService from './aiEnhancementService.mjs';
import performanceOptimizationService from './performanceOptimizationService.mjs';
import analyticsService from './analyticsService.mjs';
import contentManagementService from './contentManagementService.mjs';
import monetizationService from './monetizationService.mjs';

class IntegrationService {
  constructor() {
    this.services = {
      socialMedia: enhancedSocialMediaService,
      cache: redisCacheService,
      websocket: websocketService,
      ai: aiEnhancementService,
      performance: performanceOptimizationService,
      analytics: analyticsService,
      content: contentManagementService,
      monetization: monetizationService
    };
    
    this.initialized = false;
    this.healthChecks = new Map();
  }

  /**
   * Initialize all services
   */
  async initialize(server) {
    try {
      logger.info('Initializing integration services...');

      // Initialize WebSocket service
      if (server) {
        this.services.websocket.initialize(server);
        logger.info('✅ WebSocket service initialized');
      }

      // Initialize cache service
      await this.services.cache.clear(); // Clear any existing cache
      logger.info('✅ Cache service initialized');

      // Initialize health checks
      this.setupHealthChecks();

      // Setup service monitoring
      this.setupServiceMonitoring();

      this.initialized = true;
      logger.info('🎉 All integration services initialized successfully');
      
      return {
        success: true,
        services: Object.keys(this.services),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Integration service initialization error:', error);
      throw new Error(`Failed to initialize services: ${error.message}`);
    }
  }

  /**
   * Setup health checks for all services
   */
  setupHealthChecks() {
    this.healthChecks.set('cache', () => {
      const stats = this.services.cache.getStats();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('ai', () => {
      const stats = this.services.ai.getStats();
      return {
        status: stats.rateLimitRemaining > 0 ? 'healthy' : 'rate_limited',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('performance', () => {
      const stats = this.services.performance.getPerformanceMetrics();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('analytics', () => {
      const stats = this.services.analytics.getStats();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('content', () => {
      const stats = this.services.content.getStats();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('monetization', () => {
      const stats = this.services.monetization.getStats();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });

    this.healthChecks.set('websocket', () => {
      const stats = this.services.websocket.getStats();
      return {
        status: 'healthy',
        stats,
        timestamp: new Date()
      };
    });
  }

  /**
   * Setup service monitoring
   */
  setupServiceMonitoring() {
    // Monitor cache performance
    setInterval(() => {
      const stats = this.services.cache.getStats();
      if (parseFloat(stats.hitRate) < 50) {
        logger.warn('Cache hit rate is low:', stats.hitRate);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Monitor AI service rate limits
    setInterval(() => {
      const stats = this.services.ai.getStats();
      if (stats.rateLimitRemaining < 10) {
        logger.warn('AI service rate limit is low:', stats.rateLimitRemaining);
      }
    }, 60 * 1000); // Every minute

    // Cleanup services periodically
    setInterval(() => {
      this.services.cache.cleanupExpired();
      this.services.analytics.clearCache();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  /**
   * Get comprehensive health status
   */
  async getHealthStatus() {
    try {
      const healthStatus = {
        overall: 'healthy',
        services: {},
        timestamp: new Date(),
        uptime: process.uptime()
      };

      let unhealthyServices = 0;

      for (const [serviceName, healthCheck] of this.healthChecks.entries()) {
        try {
          const status = healthCheck();
          healthStatus.services[serviceName] = status;
          
          if (status.status !== 'healthy') {
            unhealthyServices++;
          }
        } catch (error) {
          healthStatus.services[serviceName] = {
            status: 'error',
            error: error.message,
            timestamp: new Date()
          };
          unhealthyServices++;
        }
      }

      if (unhealthyServices > 0) {
        healthStatus.overall = unhealthyServices === Object.keys(this.healthChecks).length ? 'unhealthy' : 'degraded';
      }

      return healthStatus;
    } catch (error) {
      logger.error('Health status check error:', error);
      return {
        overall: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get comprehensive system statistics
   */
  async getSystemStats() {
    try {
      const stats = {
        services: {},
        overall: {
          totalServices: Object.keys(this.services).length,
          initialized: this.initialized,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date()
        }
      };

      // Get stats from each service
      for (const [serviceName, service] of Object.entries(this.services)) {
        try {
          if (typeof service.getStats === 'function') {
            stats.services[serviceName] = service.getStats();
          } else {
            stats.services[serviceName] = { status: 'no_stats_available' };
          }
        } catch (error) {
          stats.services[serviceName] = { error: error.message };
        }
      }

      return stats;
    } catch (error) {
      logger.error('System stats error:', error);
      throw new Error(`Failed to get system stats: ${error.message}`);
    }
  }

  /**
   * Enhanced article publishing with all services
   */
  async publishArticle(article, user) {
    try {
      logger.info(`Publishing article: ${article._id} by user ${user._id}`);

      // 1. AI Enhancement
      const aiEnhancements = await this.enhanceArticleWithAI(article);
      
      // 2. Performance Optimization
      const optimizedArticle = await this.optimizeArticlePerformance(article);
      
      // 3. Social Media Auto-posting
      const socialMediaResults = await this.services.socialMedia.autoPostContent(article, user);
      
      // 4. Analytics Tracking
      await this.services.analytics.trackArticleView(article._id, user._id);
      
      // 5. WebSocket Broadcast
      this.services.websocket.broadcastNewsUpdate({
        id: article._id,
        title: article.title,
        status: 'published',
        publishedAt: new Date()
      });
      
      // 6. Cache Invalidation
      await this.services.cache.invalidateNewsCache(article._id);

      const result = {
        success: true,
        article: optimizedArticle,
        aiEnhancements,
        socialMedia: socialMediaResults,
        timestamp: new Date()
      };

      logger.info(`Article published successfully: ${article._id}`);
      return result;
    } catch (error) {
      logger.error('Article publishing error:', error);
      throw new Error(`Failed to publish article: ${error.message}`);
    }
  }

  /**
   * Enhance article with AI
   */
  async enhanceArticleWithAI(article) {
    try {
      const enhancements = {};

      // Generate summary
      if (article.content?.en) {
        enhancements.summary = await this.services.ai.generateSummary(article.content.en);
      }

      // Generate tags
      if (article.title?.en && article.content?.en) {
        enhancements.tags = await this.services.ai.generateTags(article.content.en, article.title.en);
      }

      // Analyze sentiment
      if (article.content?.en) {
        enhancements.sentiment = await this.services.ai.analyzeSentiment(article.content.en);
      }

      // Generate recommendations
      if (article.content?.en) {
        enhancements.recommendations = await this.services.ai.generateRecommendations(article.content.en);
      }

      return enhancements;
    } catch (error) {
      logger.error('AI enhancement error:', error);
      return { error: error.message };
    }
  }

  /**
   * Optimize article performance
   */
  async optimizeArticlePerformance(article) {
    try {
      const optimizations = {};

      // Optimize images if present
      if (article.images && article.images.length > 0) {
        optimizations.images = [];
        for (const imageUrl of article.images) {
          try {
            const optimized = await this.services.performance.optimizeImage(imageUrl);
            optimizations.images.push(optimized);
          } catch (error) {
            logger.warn(`Image optimization failed for ${imageUrl}:`, error.message);
          }
        }
      }

      // Generate lazy loading HTML
      if (article.thumbnail) {
        optimizations.lazyLoadHTML = this.services.performance.generateLazyLoadHTML({
          srcset: '',
          sizes: '(max-width: 768px) 100vw, 50vw',
          fallback: article.thumbnail
        });
      }

      return {
        ...article,
        optimizations
      };
    } catch (error) {
      logger.error('Performance optimization error:', error);
      return article; // Return original article if optimization fails
    }
  }

  /**
   * Get user dashboard data
   */
  async getUserDashboard(userId) {
    try {
      const [
        analytics,
        content,
        monetization
      ] = await Promise.all([
        this.services.analytics.getDashboardData('7d'),
        this.services.content.getContentAnalytics('7d'),
        this.services.monetization.getRevenueReport('7d')
      ]);

      return {
        analytics,
        content,
        monetization,
        realTime: this.services.websocket.getRealTimeMetrics(),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('User dashboard error:', error);
      throw new Error(`Failed to get user dashboard: ${error.message}`);
    }
  }

  /**
   * Shutdown all services
   */
  async shutdown() {
    try {
      logger.info('Shutting down integration services...');

      // Shutdown cache service
      this.services.cache.shutdown();

      // Clear all service data
      this.services.analytics.clearCache();
      this.services.content.clearCache();

      this.initialized = false;
      logger.info('✅ All integration services shut down successfully');
    } catch (error) {
      logger.error('Service shutdown error:', error);
    }
  }

  /**
   * Get service by name
   */
  getService(serviceName) {
    return this.services[serviceName];
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(serviceName) {
    return this.services.hasOwnProperty(serviceName) && this.initialized;
  }
}

export default new IntegrationService();
