#!/usr/bin/env node

/**
 * Enterprise Analytics API Routes
 * Advanced analytics and business intelligence endpoints
 */

import express from 'express';
import EnterpriseAnalytics from '../services/enterpriseAnalytics.mjs';
import PerformanceMonitor from '../services/performanceMonitor.mjs';
import AIRecommendationEngine from '../services/aiRecommendationEngine.mjs';
import { protect, admin } from '../middleware/auth.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

// Initialize services
const analyticsService = new EnterpriseAnalytics();
const performanceMonitor = new PerformanceMonitor();
const recommendationEngine = new AIRecommendationEngine();

/**
 * GET /api/admin/analytics/dashboard
 * Real-time analytics dashboard data
 */
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const dashboardData = await analyticsService.getRealTimeAnalytics();
    
    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/business-intelligence
 * Advanced business intelligence report
 */
router.get('/business-intelligence', protect, admin, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const biData = await analyticsService.getBusinessIntelligence(timeRange);
    
    res.json({
      success: true,
      data: biData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Business intelligence error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business intelligence data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/performance
 * Performance monitoring data
 */
router.get('/performance', protect, admin, async (req, res) => {
  try {
    const { timeRange = '1h' } = req.query;
    const performanceData = performanceMonitor.getPerformanceAnalytics(timeRange);
    
    res.json({
      success: true,
      data: performanceData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/real-time
 * Real-time system metrics
 */
router.get('/real-time', protect, admin, async (req, res) => {
  try {
    const realTimeData = performanceMonitor.getRealTimeMetrics();
    
    res.json({
      success: true,
      data: realTimeData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time data',
      error: error.message
    });
  }
});

/**
 * GET /api/recommendations/personalized
 * Get personalized content recommendations
 */
router.get('/recommendations/personalized', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      limit = 10, 
      excludeRead = true, 
      includeBreaking = true,
      language = 'en' 
    } = req.query;

    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      userId, 
      { 
        limit: parseInt(limit), 
        excludeRead: excludeRead === 'true',
        includeBreaking: includeBreaking === 'true',
        language 
      }
    );
    
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized recommendations',
      error: error.message
    });
  }
});

/**
 * POST /api/analytics/track-behavior
 * Track user behavior for recommendations
 */
router.post('/track-behavior', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { action, data } = req.body;

    recommendationEngine.trackUserBehavior(userId, action, data);
    
    res.json({
      success: true,
      message: 'Behavior tracked successfully'
    });
  } catch (error) {
    logger.error('Behavior tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track behavior',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/content-analysis
 * Advanced content analytics
 */
router.get('/content-analysis', protect, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const contentAnalytics = await analyticsService.getContentAnalytics(startDate);
    
    res.json({
      success: true,
      data: contentAnalytics,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Content analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content analysis',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/user-analytics
 * User behavior and engagement analytics
 */
router.get('/user-analytics', protect, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const userAnalytics = await analyticsService.getUserAnalytics(startDate);
    
    res.json({
      success: true,
      data: userAnalytics,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/kpis
 * Key Performance Indicators
 */
router.get('/kpis', protect, admin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const kpis = await analyticsService.getKPIs(startDate);
    
    res.json({
      success: true,
      data: kpis,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get KPIs',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analytics/alerts
 * System alerts and notifications
 */
router.get('/alerts', protect, admin, async (req, res) => {
  try {
    const performanceData = performanceMonitor.getPerformanceAnalytics('1h');
    const systemAlerts = await analyticsService.getSystemAlerts();
    
    const alerts = [
      ...performanceData.alerts,
      ...systemAlerts
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 50), // Last 50 alerts
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'warning').length,
          info: alerts.filter(a => a.severity === 'info').length
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/analytics/generate-report
 * Generate custom analytics report
 */
router.post('/generate-report', protect, admin, async (req, res) => {
  try {
    const { 
      reportType, 
      timeRange, 
      metrics, 
      format = 'json' 
    } = req.body;

    let reportData;

    switch (reportType) {
      case 'business-intelligence':
        reportData = await analyticsService.getBusinessIntelligence(timeRange);
        break;
      case 'performance':
        reportData = performanceMonitor.getPerformanceAnalytics(timeRange);
        break;
      case 'content':
        const days = parseInt(timeRange.replace('d', ''));
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        reportData = await analyticsService.getContentAnalytics(startDate);
        break;
      default:
        throw new Error('Invalid report type');
    }

    res.json({
      success: true,
      data: {
        report: reportData,
        metadata: {
          reportType,
          timeRange,
          generatedAt: new Date(),
          format
        }
      }
    });
  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

/**
 * WebSocket endpoint for real-time updates
 */
router.get('/stream', protect, admin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send real-time updates every 30 seconds
  const interval = setInterval(async () => {
    try {
      const realTimeData = performanceMonitor.getRealTimeMetrics();
      res.write(`data: ${JSON.stringify(realTimeData)}\n\n`);
    } catch (error) {
      logger.error('Real-time stream error:', error);
    }
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
