import sentinelAutoPublishService from '../services/sentinelAutoPublishService.mjs';
import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.mjs';
import News from '../models/News.mjs';
import logger from '../utils/logger.mjs';

// @desc    Trigger auto-publish for Sentinel drafts
// @route   POST /api/admin/auto-publish/sentinel
// @access  Private/Admin
export const autoPublishSentinelDrafts = asyncHandler(async (req, res) => {
  try {
    logger.info('🤖 Manual auto-publish triggered by admin');
    
    // Start the auto-publish process asynchronously
    const processId = `auto-publish-${Date.now()}`;
    
    // Set a longer timeout for this specific request
    req.setTimeout(300000); // 5 minutes
    
    // Start the process in the background
    sentinelAutoPublishService.autoPublishSentinelDrafts()
      .then(async (result) => {
        logger.info(`✅ Auto-publish process ${processId} completed successfully`);
        // You could emit a WebSocket event here to notify the frontend
      })
      .catch((error) => {
        logger.error(`❌ Auto-publish process ${processId} failed:`, error);
        // You could emit a WebSocket event here to notify the frontend
      });
    
    // Return immediately with process started confirmation
    res.json({
      success: true,
      message: 'Auto-publish process started successfully',
      processId: processId,
      data: {
        status: 'started',
        message: 'The auto-publish process is running in the background. Check the logs for progress updates.'
      }
    });
  } catch (error) {
    logger.error('Auto-publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start auto-publish process',
      error: error.message
    });
  }
});

// @desc    Get auto-publish process status
// @route   GET /api/admin/auto-publish/status
// @access  Private/Admin
export const getAutoPublishStatus = asyncHandler(async (req, res) => {
  try {
    const isRunning = sentinelAutoPublishService.isRunning || false;
    const lastRunAt = sentinelAutoPublishService.lastRunAt || null;
    const nextRunAt = sentinelAutoPublishService.nextRunAt || null;
    
    res.json({
      success: true,
      data: {
        isRunning,
        lastRunAt,
        nextRunAt,
        status: isRunning ? 'running' : 'idle'
      }
    });
  } catch (error) {
    logger.error('Error getting auto-publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-publish status',
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
      data: stats
    });
  } catch (error) {
    logger.error('Error getting auto-publish stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-publish statistics',
      error: error.message
    });
  }
});

// @desc    Get auto-publish settings
// @route   GET /api/admin/auto-publish/settings
// @access  Private/Admin
export const getAutoPublishSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getCategorySettings('auto-publish');
    
    const defaultSettings = {
      enabled: false,
      autoPublishEnabled: false,
      telegramNotifications: true,
      minContentLength: 100,
      maxDraftsPerRun: 10,
      delayBetweenArticles: 2000,
      requireManualApproval: false,
      publishSchedule: 'manual',
      scheduleTime: '09:00'
    };
    
    res.json({
      success: true,
      data: { ...defaultSettings, ...settings }
    });
  } catch (error) {
    logger.error('Error getting auto-publish settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-publish settings',
      error: error.message
    });
  }
});

// @desc    Update auto-publish settings
// @route   PUT /api/admin/auto-publish/settings
// @access  Private/Admin
export const updateAutoPublishSettings = asyncHandler(async (req, res) => {
  try {
    const settings = req.body;
    const userId = req.user?.id; // Get user ID from authenticated request
    
    await Settings.updateCategorySettings('auto-publish', settings, userId);
    
    res.json({
      success: true,
      message: 'Auto-publish settings updated successfully',
      data: settings
    });
  } catch (error) {
    logger.error('Error updating auto-publish settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-publish settings',
      error: error.message
    });
  }
});

// @desc    Get auto-publish logs
// @route   GET /api/admin/auto-publish/logs
// @access  Private/Admin
export const getAutoPublishLogs = asyncHandler(async (req, res) => {
  try {
    // For now, return mock logs. In a real implementation, you'd store these in a database
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'Auto-Publish Run',
        status: 'success',
        message: 'Successfully processed 5 drafts and published 3 articles',
        articlesProcessed: 5,
        articlesPublished: 3,
        notificationsSent: 3
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'Auto-Publish Run',
        status: 'warning',
        message: 'Processed 2 drafts but only 1 had sufficient content',
        articlesProcessed: 2,
        articlesPublished: 1,
        notificationsSent: 1
      }
    ];
    
    res.json({
      success: true,
      data: mockLogs
    });
  } catch (error) {
    logger.error('Error getting auto-publish logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-publish logs',
      error: error.message
    });
  }
});

// @desc    Get Telegram settings
// @route   GET /api/admin/auto-publish/telegram-settings
// @access  Private/Admin
export const getTelegramSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getCategorySettings('social-media');
    
    const telegramSettings = {
      enabled: settings.telegramEnabled || false,
      botToken: settings.telegramBotToken || '',
      channelId: settings.telegramChannelId || '',
      channelUsername: settings.telegramChannelUsername || '',
      status: settings.telegramEnabled ? 'connected' : 'disconnected',
      lastTestAt: settings.telegramLastTestAt
    };
    
    res.json({
      success: true,
      data: telegramSettings
    });
  } catch (error) {
    logger.error('Error getting Telegram settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Telegram settings',
      error: error.message
    });
  }
});

// @desc    Update Telegram settings
// @route   PUT /api/admin/auto-publish/telegram-settings
// @access  Private/Admin
export const updateTelegramSettings = asyncHandler(async (req, res) => {
  try {
    const { enabled, botToken, channelId, channelUsername } = req.body;
    
    const updates = {
      telegramEnabled: enabled,
      telegramBotToken: botToken,
      telegramChannelId: channelId,
      telegramChannelUsername: channelUsername
    };
    
    await Settings.updateCategorySettings('social-media', updates);
    
    res.json({
      success: true,
      message: 'Telegram settings updated successfully',
      data: { enabled, botToken, channelId, channelUsername }
    });
  } catch (error) {
    logger.error('Error updating Telegram settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Telegram settings',
      error: error.message
    });
  }
});

// @desc    Test Telegram connection
// @route   POST /api/admin/auto-publish/test-telegram
// @access  Private/Admin
export const testTelegramConnection = asyncHandler(async (req, res) => {
  try {
    const { botToken, channelId } = req.body;
    
    if (!botToken || !channelId) {
      return res.status(400).json({
        success: false,
        message: 'Bot token and channel ID are required'
      });
    }
    
    // Temporarily update the service with the test credentials
    const originalSettings = await Settings.getCategorySettings('social-media');
    
    // Update settings temporarily for testing
    await Settings.updateCategorySettings('social-media', {
      telegramBotToken: botToken,
      telegramChannelId: channelId,
      telegramEnabled: true
    });
    
    // Reinitialize the service with new settings
    await sentinelAutoPublishService.initializeTelegramSettings();
    
    // Create a test article for the notification
    const testArticle = {
      title: { en: 'Test Article - Auto-Publish System' },
      description: { en: 'This is a test notification from the RazeWire auto-publish system.' },
      slug: 'test-article-auto-publish',
      category: { name: { en: 'System' } },
      author: { username: 'RazeWire' }
    };
    
    const result = await sentinelAutoPublishService.sendTelegramNotification(testArticle);
    
    // Restore original settings
    await Settings.updateCategorySettings('social-media', originalSettings);
    
    // Update last test time
    await Settings.updateCategorySettings('social-media', {
      telegramLastTestAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Telegram test successful',
      data: result
    });
  } catch (error) {
    logger.error('Telegram test error:', error);
    res.status(500).json({
      success: false,
      message: 'Telegram test failed',
      error: error.message
    });
  }
});

// @desc    Send Telegram notification for specific article
// @route   POST /api/admin/auto-publish/telegram-notification/:id
// @access  Private/Admin
export const sendTelegramNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await News.findById(id)
      .populate('author', 'username')
      .populate('category', 'name');
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    const result = await sentinelAutoPublishService.sendTelegramNotification(article);
    
    res.json({
      success: true,
      message: 'Telegram notification sent successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error sending Telegram notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send Telegram notification',
      error: error.message
    });
  }
});

