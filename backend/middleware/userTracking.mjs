#!/usr/bin/env node

/**
 * User Tracking Middleware
 * Automatically tracks user page views and sessions
 */

import realTimeUserTracker from '../services/realTimeUserTracker.mjs';
import logger from '../utils/logger.mjs';

/**
 * Middleware to track user page views
 */
export const trackPageView = (req, res, next) => {
  try {
    // Get article ID from request (if available)
    const articleId = req.params.id || req.params.slug || req.query.articleId;
    
    // Get user info if authenticated
    const userId = req.user?.id || req.user?._id || null;
    const userDetails = req.user ? {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      avatar: req.user.avatar || req.user.profileImage
    } : null;
    
    // Track the page view
    if (articleId) {
      realTimeUserTracker.trackPageView(req, articleId, userId, userDetails);
    }
    
    next();
  } catch (error) {
    logger.error('User tracking error:', error);
    next(); // Continue even if tracking fails
  }
};

/**
 * Middleware to track any page visit (not just articles)
 */
export const trackVisit = (req, res, next) => {
  try {
    // Generate a page identifier from the URL
    const pageId = req.path.replace(/[^a-zA-Z0-9]/g, '_') || 'homepage';
    
    // Get user info if authenticated
    const userId = req.user?.id || req.user?._id || null;
    const userDetails = req.user ? {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'user',
      avatar: req.user.avatar || req.user.profileImage
    } : null;
    
    // Track the visit
    realTimeUserTracker.trackPageView(req, pageId, userId, userDetails);
    
    next();
  } catch (error) {
    logger.error('Visit tracking error:', error);
    next(); // Continue even if tracking fails
  }
};

/**
 * API endpoint to manually track a page view (for testing)
 */
export const manualTrack = async (req, res) => {
  try {
    const { articleId, userId, userDetails } = req.body;
    
    // Track the page view
    realTimeUserTracker.trackPageView(req, articleId, userId, userDetails);
    
    res.json({
      success: true,
      message: 'Page view tracked successfully',
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Manual tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view',
      error: error.message
    });
  }
};
