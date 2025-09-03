/**
 * Data Quality API Routes - Test Version (No Authentication)
 * Provides endpoints for advanced data quality management
 */

import express from 'express';
import advancedDataQualityService from '../services/advancedDataQualityService.mjs';
import enhancedSentinelService from '../services/enhancedSentinelService.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

/**
 * POST /api/admin/data-quality/enhanced-sentinel/run
 * Run enhanced Sentinel with quality assessment
 */
router.post('/enhanced-sentinel/run', async (req, res) => {
  try {
    logger.info('Enhanced Sentinel run requested');
    const results = await enhancedSentinelService.runEnhancedSentinel();
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Enhanced Sentinel run API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/data-quality/enhanced-sentinel/status
 * Get enhanced Sentinel status and configuration
 */
router.get('/enhanced-sentinel/status', async (req, res) => {
  try {
    const status = await enhancedSentinelService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Enhanced Sentinel status API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/data-quality/overview
 * Get data quality overview and statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const overview = await advancedDataQualityService.getQualityOverview();
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    logger.error('Data quality overview API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/data-quality/statistics
 * Get data quality statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const statistics = await advancedDataQualityService.getQualityStatistics(timeframe);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Data quality statistics API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/data-quality/recommendations
 * Get data quality recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await advancedDataQualityService.getQualityRecommendations();
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('Data quality recommendations API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/data-quality/articles/:grade
 * Get articles by quality grade
 */
router.get('/articles/:grade', async (req, res) => {
  try {
    const { grade } = req.params;
    const { limit = 10 } = req.query;
    const articles = await advancedDataQualityService.getArticlesByGrade(grade, parseInt(limit));
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    logger.error('Data quality articles API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/data-quality/enhanced-sentinel/threshold
 * Update quality threshold
 */
router.put('/enhanced-sentinel/threshold', async (req, res) => {
  try {
    const { threshold } = req.body;
    const result = await enhancedSentinelService.updateQualityThreshold(threshold);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Update quality threshold API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/data-quality/enhanced-sentinel/auto-publish
 * Toggle auto-publish feature
 */
router.put('/enhanced-sentinel/auto-publish', async (req, res) => {
  try {
    const { enabled } = req.body;
    const result = await enhancedSentinelService.toggleAutoPublish(enabled);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Toggle auto-publish API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
