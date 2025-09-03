/**
 * Data Quality API Routes
 * Provides endpoints for advanced data quality management
 */

import express from 'express';
import advancedDataQualityService from '../services/advancedDataQualityService.mjs';
import enhancedSentinelService from '../services/enhancedSentinelService.mjs';
import logger from '../utils/logger.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * POST /api/admin/data-quality/assess
 * Assess data quality for a specific article
 */
router.post('/assess', protect, admin, async (req, res) => {
  try {
    const { article, sourceInfo } = req.body;
    
    if (!article) {
      return res.status(400).json({
        success: false,
        message: 'Article data is required'
      });
    }

    const assessment = await advancedDataQualityService.assessDataQuality(article, sourceInfo);
    
    if (!assessment) {
      return res.status(500).json({
        success: false,
        message: 'Quality assessment failed'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Data quality assessment API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/data-quality/statistics
 * Get quality statistics
 */
router.get('/statistics', protect, admin, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const stats = await advancedDataQualityService.getQualityStatistics(timeframe);
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality statistics'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Quality statistics API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/data-quality/recommendations
 * Get quality improvement recommendations
 */
router.get('/recommendations', protect, admin, async (req, res) => {
  try {
    const recommendations = await enhancedSentinelService.getQualityRecommendations();
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('Quality recommendations API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/data-quality/articles/:grade
 * Get articles by quality grade
 */
router.get('/articles/:grade', protect, admin, async (req, res) => {
  try {
    const { grade } = req.params;
    const { limit = 10 } = req.query;
    
    const validGrades = ['excellent', 'good', 'acceptable', 'poor', 'unacceptable'];
    if (!validGrades.includes(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quality grade'
      });
    }

    const articles = await enhancedSentinelService.getArticlesByQuality(grade, parseInt(limit));
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    logger.error('Articles by quality API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/admin/data-quality/enhanced-sentinel/run
 * Run enhanced Sentinel with quality assessment
 */
router.post('/enhanced-sentinel/run', protect, admin, async (req, res) => {
  try {
    const results = await enhancedSentinelService.runEnhancedSentinel();
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Enhanced Sentinel run API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/admin/data-quality/enhanced-sentinel/threshold
 * Update quality threshold
 */
router.put('/enhanced-sentinel/threshold', protect, admin, async (req, res) => {
  try {
    const { threshold } = req.body;
    
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
      return res.status(400).json({
        success: false,
        message: 'Threshold must be a number between 0 and 100'
      });
    }

    enhancedSentinelService.setQualityThreshold(threshold);
    
    res.json({
      success: true,
      message: `Quality threshold updated to ${threshold}`
    });
  } catch (error) {
    logger.error('Quality threshold update API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/admin/data-quality/enhanced-sentinel/auto-publish
 * Enable/disable auto-publishing
 */
router.put('/enhanced-sentinel/auto-publish', protect, admin, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Enabled must be a boolean value'
      });
    }

    enhancedSentinelService.setAutoPublishEnabled(enabled);
    
    res.json({
      success: true,
      message: `Auto-publish ${enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    logger.error('Auto-publish toggle API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/data-quality/enhanced-sentinel/status
 * Get enhanced Sentinel status
 */
router.get('/enhanced-sentinel/status', protect, admin, async (req, res) => {
  try {
    const status = {
      qualityThreshold: enhancedSentinelService.qualityThreshold,
      autoPublishEnabled: enhancedSentinelService.autoPublishEnabled,
      enhancementEnabled: enhancedSentinelService.enhancementEnabled,
      initialized: true
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Enhanced Sentinel status API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/admin/data-quality/batch-assess
 * Assess multiple articles in batch
 */
router.post('/batch-assess', protect, admin, async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Articles array is required'
      });
    }

    if (articles.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 articles allowed per batch'
      });
    }

    const assessments = [];
    
    for (const article of articles) {
      try {
        const assessment = await advancedDataQualityService.assessDataQuality(article);
        assessments.push({
          articleId: article._id || article.id,
          assessment: assessment
        });
      } catch (error) {
        logger.error(`Batch assessment failed for article ${article._id || article.id}:`, error);
        assessments.push({
          articleId: article._id || article.id,
          assessment: null,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: assessments
    });
  } catch (error) {
    logger.error('Batch assessment API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/data-quality/fact-check/:articleId
 * Perform fact-checking for a specific article
 */
router.get('/fact-check/:articleId', protect, admin, async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Get article from database
    const News = (await import('../models/News.mjs')).default;
    const article = await News.findById(articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const factCheckResults = await advancedDataQualityService.performFactCheck(article);
    
    res.json({
      success: true,
      data: factCheckResults
    });
  } catch (error) {
    logger.error('Fact-check API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
