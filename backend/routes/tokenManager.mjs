/**
 * Token Manager API Routes
 * Provides endpoints for monitoring and managing social media tokens
 */

import express from 'express';
import tokenManager from '../services/tokenManager.mjs';
import logger from '../utils/logger.mjs';
import { protect, admin } from '../middleware/auth.mjs';

const router = express.Router();

/**
 * GET /api/admin/tokens/status
 * Get current token status for all platforms
 */
router.get('/status', protect, admin, async (req, res) => {
  try {
    const status = await tokenManager.getDetailedStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting token status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token status'
    });
  }
});

/**
 * POST /api/admin/tokens/check
 * Manually trigger token check
 */
router.post('/check', protect, admin, async (req, res) => {
  try {
    const results = await tokenManager.checkAllTokens();
    res.json({
      success: true,
      message: 'Token check completed',
      data: results
    });
  } catch (error) {
    logger.error('Error checking tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check tokens'
    });
  }
});

/**
 * POST /api/admin/tokens/facebook/refresh
 * Refresh Facebook token
 */
router.post('/facebook/refresh', protect, admin, async (req, res) => {
  try {
    const result = await tokenManager.refreshFacebookToken();
    res.json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    logger.error('Error refreshing Facebook token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh Facebook token'
    });
  }
});

/**
 * POST /api/admin/tokens/start-monitoring
 * Start automatic token monitoring
 */
router.post('/start-monitoring', protect, admin, async (req, res) => {
  try {
    await tokenManager.start();
    res.json({
      success: true,
      message: 'Token monitoring started'
    });
  } catch (error) {
    logger.error('Error starting token monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start token monitoring'
    });
  }
});

/**
 * POST /api/admin/tokens/stop-monitoring
 * Stop automatic token monitoring
 */
router.post('/stop-monitoring', protect, admin, async (req, res) => {
  try {
    tokenManager.stop();
    res.json({
      success: true,
      message: 'Token monitoring stopped'
    });
  } catch (error) {
    logger.error('Error stopping token monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop token monitoring'
    });
  }
});

export default router;
