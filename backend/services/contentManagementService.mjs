import mongoose from 'mongoose';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import Category from '../models/Category.mjs';
import logger from '../utils/logger.mjs';

class ContentManagementService {
  constructor() {
    this.versionHistory = new Map();
    this.scheduledContent = new Map();
    this.contentTemplates = new Map();
    this.bulkOperations = new Map();
  }

  /**
   * Create article with version control
   */
  async createArticle(articleData, authorId) {
    try {
      const article = new News({
        ...articleData,
        author: authorId,
        status: 'draft',
        version: 1,
        createdAt: new Date()
      });

      await article.save();

      // Store version history
      this.storeVersionHistory(article._id, articleData, authorId, 'created');

      logger.info(`Article created: ${article._id} by user ${authorId}`);
      return article;
    } catch (error) {
      logger.error('Article creation error:', error);
      throw new Error(`Failed to create article: ${error.message}`);
    }
  }

  /**
   * Update article with version control
   */
  async updateArticle(articleId, updates, userId) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Store current version before update
      const currentVersion = {
        title: article.title,
        content: article.content,
        description: article.description,
        updatedAt: article.updatedAt
      };

      // Apply updates
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          article[key] = updates[key];
        }
      });

      article.version = (article.version || 1) + 1;
      article.updatedAt = new Date();

      await article.save();

      // Store version history
      this.storeVersionHistory(articleId, currentVersion, userId, 'updated');

      logger.info(`Article updated: ${articleId} by user ${userId}`);
      return article;
    } catch (error) {
      logger.error('Article update error:', error);
      throw new Error(`Failed to update article: ${error.message}`);
    }
  }

  /**
   * Get article version history
   */
  async getVersionHistory(articleId) {
    try {
      const history = this.versionHistory.get(articleId.toString()) || [];
      return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      logger.error('Version history error:', error);
      throw new Error(`Failed to get version history: ${error.message}`);
    }
  }

  /**
   * Restore article to previous version
   */
  async restoreVersion(articleId, versionNumber, userId) {
    try {
      const history = this.versionHistory.get(articleId.toString()) || [];
      const targetVersion = history.find(v => v.version === versionNumber);
      
      if (!targetVersion) {
        throw new Error('Version not found');
      }

      const article = await News.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Store current version before restore
      const currentVersion = {
        title: article.title,
        content: article.content,
        description: article.description,
        updatedAt: article.updatedAt
      };

      // Restore to target version
      article.title = targetVersion.data.title;
      article.content = targetVersion.data.content;
      article.description = targetVersion.data.description;
      article.version = (article.version || 1) + 1;
      article.updatedAt = new Date();

      await article.save();

      // Store version history
      this.storeVersionHistory(articleId, currentVersion, userId, 'restored');

      logger.info(`Article restored to version ${versionNumber}: ${articleId} by user ${userId}`);
      return article;
    } catch (error) {
      logger.error('Version restore error:', error);
      throw new Error(`Failed to restore version: ${error.message}`);
    }
  }

  /**
   * Schedule article for publishing
   */
  async scheduleArticle(articleId, publishDate, userId) {
    try {
      const article = await News.findById(articleId);
      if (!article) {
        throw new Error('Article not found');
      }

      // Store scheduled content
      this.scheduledContent.set(articleId.toString(), {
        articleId,
        publishDate: new Date(publishDate),
        scheduledBy: userId,
        scheduledAt: new Date(),
        status: 'scheduled'
      });

      // Update article status
      article.status = 'scheduled';
      article.scheduledPublishDate = new Date(publishDate);
      await article.save();

      logger.info(`Article scheduled: ${articleId} for ${publishDate} by user ${userId}`);
      return article;
    } catch (error) {
      logger.error('Article scheduling error:', error);
      throw new Error(`Failed to schedule article: ${error.message}`);
    }
  }

  /**
   * Process scheduled articles
   */
  async processScheduledArticles() {
    try {
      const now = new Date();
      const scheduledArticles = [];

      for (const [articleId, scheduleData] of this.scheduledContent.entries()) {
        if (scheduleData.publishDate <= now && scheduleData.status === 'scheduled') {
          const article = await News.findById(articleId);
          if (article) {
            article.status = 'published';
            article.publishedAt = now;
            article.scheduledPublishDate = undefined;
            await article.save();

            scheduleData.status = 'published';
            scheduledArticles.push(article);

            logger.info(`Scheduled article published: ${articleId}`);
          }
        }
      }

      return scheduledArticles;
    } catch (error) {
      logger.error('Scheduled articles processing error:', error);
      throw new Error(`Failed to process scheduled articles: ${error.message}`);
    }
  }

  /**
   * Create content template
   */
  async createTemplate(templateData, userId) {
    try {
      const template = {
        id: Date.now().toString(),
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        template: {
          title: templateData.title,
          content: templateData.content,
          description: templateData.description,
          tags: templateData.tags || [],
          metaDescription: templateData.metaDescription
        },
        createdBy: userId,
        createdAt: new Date(),
        usageCount: 0
      };

      this.contentTemplates.set(template.id, template);

      logger.info(`Content template created: ${template.id} by user ${userId}`);
      return template;
    } catch (error) {
      logger.error('Template creation error:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * Use content template
   */
  async useTemplate(templateId, customizations = {}) {
    try {
      const template = this.contentTemplates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Increment usage count
      template.usageCount = (template.usageCount || 0) + 1;

      // Apply customizations to template
      const articleData = {
        ...template.template,
        ...customizations
      };

      return articleData;
    } catch (error) {
      logger.error('Template usage error:', error);
      throw new Error(`Failed to use template: ${error.message}`);
    }
  }

  /**
   * Bulk operations on articles
   */
  async bulkUpdateArticles(articleIds, updates, userId) {
    try {
      const operationId = Date.now().toString();
      const operation = {
        id: operationId,
        type: 'bulk_update',
        articleIds,
        updates,
        userId,
        status: 'processing',
        createdAt: new Date(),
        results: []
      };

      this.bulkOperations.set(operationId, operation);

      // Process articles in batches
      const batchSize = 10;
      const results = [];

      for (let i = 0; i < articleIds.length; i += batchSize) {
        const batch = articleIds.slice(i, i + batchSize);
        
        for (const articleId of batch) {
          try {
            const article = await News.findByIdAndUpdate(
              articleId,
              { ...updates, updatedAt: new Date() },
              { new: true }
            );

            if (article) {
              results.push({ articleId, status: 'success', article });
            } else {
              results.push({ articleId, status: 'not_found' });
            }
          } catch (error) {
            results.push({ articleId, status: 'error', error: error.message });
          }
        }
      }

      operation.status = 'completed';
      operation.results = results;
      operation.completedAt = new Date();

      logger.info(`Bulk update completed: ${operationId}, ${results.length} articles processed`);
      return operation;
    } catch (error) {
      logger.error('Bulk update error:', error);
      throw new Error(`Failed to bulk update articles: ${error.message}`);
    }
  }

  /**
   * Bulk delete articles
   */
  async bulkDeleteArticles(articleIds, userId) {
    try {
      const operationId = Date.now().toString();
      const operation = {
        id: operationId,
        type: 'bulk_delete',
        articleIds,
        userId,
        status: 'processing',
        createdAt: new Date(),
        results: []
      };

      this.bulkOperations.set(operationId, operation);

      const results = [];
      for (const articleId of articleIds) {
        try {
          const article = await News.findByIdAndDelete(articleId);
          if (article) {
            results.push({ articleId, status: 'deleted', title: article.title.en });
          } else {
            results.push({ articleId, status: 'not_found' });
          }
        } catch (error) {
          results.push({ articleId, status: 'error', error: error.message });
        }
      }

      operation.status = 'completed';
      operation.results = results;
      operation.completedAt = new Date();

      logger.info(`Bulk delete completed: ${operationId}, ${results.length} articles processed`);
      return operation;
    } catch (error) {
      logger.error('Bulk delete error:', error);
      throw new Error(`Failed to bulk delete articles: ${error.message}`);
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const pipeline = [
        { $match: timeFilter },
        {
          $group: {
            _id: {
              status: '$status',
              category: '$category'
            },
            count: { $sum: 1 },
            totalViews: { $sum: '$views' },
            averageViews: { $avg: '$views' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id.category',
            foreignField: '_id',
            as: 'categoryData'
          }
        },
        {
          $project: {
            status: '$_id.status',
            category: { $arrayElemAt: ['$categoryData.name.en', 0] },
            count: 1,
            totalViews: 1,
            averageViews: { $round: ['$averageViews', 2] }
          }
        },
        { $sort: { count: -1 } }
      ];

      const results = await News.aggregate(pipeline);
      
      return {
        byStatus: this.groupByStatus(results),
        byCategory: this.groupByCategory(results),
        summary: this.calculateSummary(results)
      };
    } catch (error) {
      logger.error('Content analytics error:', error);
      throw new Error(`Failed to get content analytics: ${error.message}`);
    }
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(articleId = null, timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      const matchFilter = { ...timeFilter, status: 'published' };
      
      if (articleId) {
        matchFilter._id = new mongoose.Types.ObjectId(articleId);
      }

      const pipeline = [
        { $match: matchFilter },
        {
          $project: {
            title: 1,
            views: 1,
            publishedAt: 1,
            category: 1,
            author: 1,
            isFeatured: 1,
            isBreaking: 1,
            readingTime: { $divide: [{ $strLenCP: '$content.en' }, 200] } // Estimate reading time
          }
        },
        {
          $sort: { views: -1 }
        }
      ];

      const results = await News.aggregate(pipeline);
      
      return {
        articles: results,
        metrics: {
          totalArticles: results.length,
          totalViews: results.reduce((sum, article) => sum + article.views, 0),
          averageViews: results.length > 0 ? Math.round(results.reduce((sum, article) => sum + article.views, 0) / results.length) : 0,
          averageReadingTime: results.length > 0 ? Math.round(results.reduce((sum, article) => sum + article.readingTime, 0) / results.length) : 0
        }
      };
    } catch (error) {
      logger.error('Content performance error:', error);
      throw new Error(`Failed to get content performance: ${error.message}`);
    }
  }

  /**
   * Helper methods
   */
  storeVersionHistory(articleId, data, userId, action) {
    const history = this.versionHistory.get(articleId.toString()) || [];
    history.push({
      version: history.length + 1,
      data,
      userId,
      action,
      timestamp: new Date()
    });
    this.versionHistory.set(articleId.toString(), history);
  }

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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      createdAt: { $gte: startDate, $lte: now }
    };
  }

  groupByStatus(results) {
    const grouped = {};
    results.forEach(item => {
      if (!grouped[item.status]) {
        grouped[item.status] = { count: 0, totalViews: 0 };
      }
      grouped[item.status].count += item.count;
      grouped[item.status].totalViews += item.totalViews;
    });
    return grouped;
  }

  groupByCategory(results) {
    const grouped = {};
    results.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = { count: 0, totalViews: 0 };
      }
      grouped[category].count += item.count;
      grouped[category].totalViews += item.totalViews;
    });
    return grouped;
  }

  calculateSummary(results) {
    return {
      totalArticles: results.reduce((sum, item) => sum + item.count, 0),
      totalViews: results.reduce((sum, item) => sum + item.totalViews, 0),
      averageViews: results.length > 0 ? Math.round(results.reduce((sum, item) => sum + item.totalViews, 0) / results.reduce((sum, item) => sum + item.count, 0)) : 0
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      versionHistorySize: this.versionHistory.size,
      scheduledContentSize: this.scheduledContent.size,
      templatesSize: this.contentTemplates.size,
      bulkOperationsSize: this.bulkOperations.size
    };
  }
}

export default new ContentManagementService();
