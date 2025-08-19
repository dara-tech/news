import asyncHandler from 'express-async-handler';
import sentinelAutoPublishService from '../services/sentinelAutoPublishService.mjs';

// @desc    Auto-publish Sentinel drafts
// @route   POST /api/admin/auto-publish/sentinel
// @access  Private/Admin
export const autoPublishSentinelDrafts = asyncHandler(async (req, res) => {
  try {
    console.log('🚀 Starting auto-publish process...');
    
    // Run the auto-publish process
    await sentinelAutoPublishService.autoPublishSentinelDrafts();
    
    // Get statistics
    const stats = await sentinelAutoPublishService.getAutoPublishStats();
    
    res.json({
      success: true,
      message: 'Auto-publish process completed successfully',
      stats
    });
    
  } catch (error) {
    console.error('Auto-publish error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during auto-publish process',
      error: error.message
    });
  }
});

// @desc    Get auto-publish statistics
// @route   GET /api/admin/auto-publish/stats
// @access  Private/Admin
export const getAutoPublishStats = asyncHandler(async (req, res) => {
  try {
    const stats = await sentinelAutoPublishService.getAutoPublishStats();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting auto-publish statistics',
      error: error.message
    });
  }
});

// @desc    Test Telegram notification
// @route   POST /api/admin/auto-publish/test-telegram
// @access  Private/Admin
export const testTelegramNotification = asyncHandler(async (req, res) => {
  try {
    const { articleId } = req.body;
    
    if (!articleId) {
      res.status(400);
      throw new Error('Article ID is required');
    }
    
    // Get the article
    const article = await News.findById(articleId)
      .populate('author', 'username')
      .populate('category', 'name');
    
    if (!article) {
      res.status(404);
      throw new Error('Article not found');
    }
    
    // Send test notification
    const result = await sentinelAutoPublishService.sendTelegramNotification(article);
    
    res.json({
      success: true,
      message: 'Telegram notification sent successfully',
      result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending Telegram notification',
      error: error.message
    });
  }
});

// @desc    Get pending Sentinel drafts
// @route   GET /api/admin/auto-publish/pending
// @access  Private/Admin
export const getPendingSentinelDrafts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const drafts = await News.find({
      status: 'draft',
      'ingestion.method': 'sentinel'
    })
    .populate('author', 'username')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await News.countDocuments({
      status: 'draft',
      'ingestion.method': 'sentinel'
    });
    
    res.json({
      success: true,
      drafts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting pending drafts',
      error: error.message
    });
  }
});

