#!/usr/bin/env node

/**
 * AI-Powered Content Recommendations API
 * Advanced content recommendations and personalization
 */

import express from 'express';
import { protect } from '../middleware/auth.mjs';
import AIRecommendationEngine from '../services/aiRecommendationEngine.mjs';
import News from '../models/News.mjs';
import User from '../models/User.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();
const recommendationEngine = new AIRecommendationEngine();

/**
 * GET /api/recommendations/personalized
 * Get personalized content recommendations for a user
 */
router.get('/personalized', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      limit = 10, 
      excludeRead = true, 
      includeBreaking = true,
      language = 'en',
      categories = [],
      tags = [],
      timeRange = 'all' // 'today', 'week', 'month', 'all'
    } = req.query;

    // Parse categories and tags arrays
    const categoryArray = categories && categories.length > 0 && categories !== '' ? (Array.isArray(categories) ? categories : categories.split(',').filter(Boolean)) : [];
    const tagArray = tags && tags.length > 0 && tags !== '' ? (Array.isArray(tags) ? tags : tags.split(',').filter(Boolean)) : [];

    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      userId, 
      { 
        limit: parseInt(limit), 
        excludeRead: excludeRead === 'true',
        includeBreaking: includeBreaking === 'true',
        language,
        categories: categoryArray,
        tags: tagArray,
        timeRange
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
 * GET /api/recommendations/trending
 * Get trending content recommendations
 */
router.get('/trending', async (req, res) => {
  try {
    const { 
      limit = 10,
      language = 'en',
      timeRange = '24h' // '1h', '24h', '7d', '30d'
    } = req.query;

    const recommendations = await recommendationEngine.getTrendingRecommendations(
      parseInt(limit),
      language,
      timeRange
    );
    
    res.json({
      success: true,
      data: {
        recommendations,
        metadata: {
          timeRange,
          language,
          generatedAt: new Date()
        }
      }
    });
  } catch (error) {
    logger.error('Trending recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending recommendations',
      error: error.message
    });
  }
});

/**
 * GET /api/recommendations/similar/:articleId
 * Get content similar to a specific article
 */
router.get('/similar/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { limit = 6, language = 'en' } = req.query;

    const article = await News.findById(articleId)
      .populate('category', 'name')
      .populate('author', 'name profileImage');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const similarArticles = await recommendationEngine.getSimilarContent(
      article,
      parseInt(limit),
      language
    );
    
    res.json({
      success: true,
      data: {
        originalArticle: article,
        similarArticles,
        metadata: {
          generatedAt: new Date(),
          algorithm: 'content-similarity'
        }
      }
    });
  } catch (error) {
    logger.error('Similar content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar content',
      error: error.message
    });
  }
});

/**
 * GET /api/recommendations/for-you
 * Get "For You" personalized feed
 */
router.get('/for-you', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      limit = 20,
      language = 'en',
      includeCategories = true,
      includeTrending = true,
      includeBreaking = true
    } = req.query;

    // Get user's reading history and preferences
    const user = await User.findById(userId).select('preferences interests readingHistory');
    
    // Get diverse recommendations
    const [
      personalizedRecs,
      trendingRecs,
      breakingRecs,
      categoryRecs
    ] = await Promise.all([
      recommendationEngine.getPersonalizedRecommendations(userId, { 
        limit: Math.ceil(limit * 0.4), 
        language 
      }),
      includeTrending === 'true' ? recommendationEngine.getTrendingRecommendations(
        Math.ceil(limit * 0.2), 
        language
      ) : Promise.resolve([]),
      includeBreaking === 'true' ? recommendationEngine.getBreakingNews(language) : Promise.resolve([]),
      includeCategories === 'true' ? recommendationEngine.getCategoryBasedRecommendations(
        user?.preferences?.categories || [],
        Math.ceil(limit * 0.2),
        language
      ) : Promise.resolve([])
    ]);

    // Combine and shuffle recommendations
    const allRecommendations = [
      ...personalizedRecs.recommendations || [],
      ...trendingRecs || [],
      ...breakingRecs || [],
      ...categoryRecs || []
    ];

    // Remove duplicates and shuffle
    const uniqueRecommendations = recommendationEngine.deduplicateAndShuffle(
      allRecommendations,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        recommendations: uniqueRecommendations,
        metadata: {
          userId,
          generatedAt: new Date(),
          algorithm: 'for-you-feed',
          sources: {
            personalized: personalizedRecs.recommendations?.length || 0,
            trending: trendingRecs?.length || 0,
            breaking: breakingRecs?.length || 0,
            categories: categoryRecs?.length || 0
          }
        }
      }
    });
  } catch (error) {
    logger.error('For You feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get For You feed',
      error: error.message
    });
  }
});

/**
 * POST /api/recommendations/track-behavior
 * Track user behavior for better recommendations
 */
router.post('/track-behavior', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { action, data } = req.body;

    if (!action || !data) {
      return res.status(400).json({
        success: false,
        message: 'Action and data are required'
      });
    }

    // Track behavior in the recommendation engine
    recommendationEngine.trackUserBehavior(userId, action, data);

    // Also update user's reading history in database
    if (action === 'read_article' && data.articleId) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { 
          readingHistory: {
            articleId: data.articleId,
            readAt: new Date(),
            timeSpent: data.timeSpent || 0
          }
        }
      });
    }

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
 * GET /api/recommendations/explore
 * Get content for exploration (diverse, high-quality content)
 */
router.get('/explore', async (req, res) => {
  try {
    const { 
      limit = 12,
      language = 'en',
      categories = [],
      excludeIds = []
    } = req.query;

    const categoryArray = categories && categories.length > 0 && categories !== '' ? (Array.isArray(categories) ? categories : categories.split(',').filter(Boolean)) : [];
    const excludeArray = excludeIds && excludeIds.length > 0 && excludeIds !== '' ? (Array.isArray(excludeIds) ? excludeIds : excludeIds.split(',').filter(Boolean)) : [];

    const exploreContent = await recommendationEngine.getExploreContent(
      parseInt(limit),
      language,
      categoryArray,
      excludeArray
    );
    
    res.json({
      success: true,
      data: {
        recommendations: exploreContent,
        metadata: {
          generatedAt: new Date(),
          algorithm: 'explore-diverse',
          categories: categoryArray
        }
      }
    });
  } catch (error) {
    logger.error('Explore content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get explore content',
      error: error.message
    });
  }
});

/**
 * GET /api/recommendations/ai-insights
 * Get AI-generated insights about user preferences
 */
router.get('/ai-insights', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { language = 'en' } = req.query;

    const insights = await recommendationEngine.generateUserInsights(userId, language);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
});

/**
 * POST /api/recommendations/feedback
 * Submit feedback on recommendations
 */
router.post('/feedback', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      articleId, 
      recommendationId, 
      feedback, // 'like', 'dislike', 'not_interested', 'save'
      reason 
    } = req.body;

    if (!articleId || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Article ID and feedback are required'
      });
    }

    // Track feedback in recommendation engine
    recommendationEngine.trackUserBehavior(userId, 'feedback', {
      articleId,
      recommendationId,
      feedback,
      reason,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    logger.error('Feedback tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

export default router;

