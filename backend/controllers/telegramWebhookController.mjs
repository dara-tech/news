import asyncHandler from 'express-async-handler';
import telegramCallbackHandler from '../services/telegramCallbackHandler.mjs';
import logger from '../utils/logger.mjs';

// @desc    Handle Telegram webhook updates
// @route   POST /api/telegram/webhook
// @access  Public (Telegram only)
export const handleTelegramWebhook = asyncHandler(async (req, res) => {
  try {
    const { update_id, callback_query, message } = req.body;

    logger.info('📱 Telegram webhook received:', {
      update_id,
      has_callback_query: !!callback_query,
      has_message: !!message
    });

    // Handle callback queries (button clicks)
    if (callback_query) {
      const result = await telegramCallbackHandler.handleCallbackQuery(callback_query);
      
      logger.info('📱 Callback query handled:', result);
      
      res.json({
        success: true,
        message: 'Callback query processed',
        result
      });
      return;
    }

    // Handle regular messages (optional)
    if (message) {
      logger.info('📱 Message received:', {
        from: message.from?.username || message.from?.first_name,
        text: message.text?.substring(0, 50) + '...'
      });
      
      // You can add message handling logic here if needed
      res.json({
        success: true,
        message: 'Message received'
      });
      return;
    }

    // No recognized update type
    res.json({
      success: true,
      message: 'Update received but not processed'
    });

  } catch (error) {
    logger.error('❌ Error handling Telegram webhook:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error processing Telegram update',
      error: error.message
    });
  }
});

// @desc    Set Telegram webhook URL
// @route   POST /api/admin/telegram/set-webhook
// @access  Private/Admin
export const setTelegramWebhook = asyncHandler(async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    
    if (!webhookUrl) {
      res.status(400);
      throw new Error('Webhook URL is required');
    }

    // Get Telegram settings
    const Settings = (await import('../models/Settings.mjs')).default;
    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      res.status(400);
      throw new Error('Telegram bot token not configured');
    }

    // Set webhook via Telegram API
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `https://api.telegram.org/bot${settings.telegramBotToken}/setWebhook`,
      {
        url: webhookUrl,
        allowed_updates: ['callback_query', 'message']
      }
    );

    if (response.data.ok) {
      logger.info('✅ Telegram webhook set successfully:', webhookUrl);
      
      res.json({
        success: true,
        message: 'Telegram webhook set successfully',
        webhookUrl,
        result: response.data.result
      });
    } else {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

  } catch (error) {
    logger.error('❌ Error setting Telegram webhook:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error setting Telegram webhook',
      error: error.message
    });
  }
});

// @desc    Get Telegram webhook info
// @route   GET /api/admin/telegram/webhook-info
// @access  Private/Admin
export const getTelegramWebhookInfo = asyncHandler(async (req, res) => {
  try {
    // Get Telegram settings
    const Settings = (await import('../models/Settings.mjs')).default;
    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      res.status(400);
      throw new Error('Telegram bot token not configured');
    }

    // Get webhook info via Telegram API
    const axios = (await import('axios')).default;
    const response = await axios.get(
      `https://api.telegram.org/bot${settings.telegramBotToken}/getWebhookInfo`
    );

    if (response.data.ok) {
      res.json({
        success: true,
        webhookInfo: response.data.result
      });
    } else {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

  } catch (error) {
    logger.error('❌ Error getting Telegram webhook info:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error getting Telegram webhook info',
      error: error.message
    });
  }
});

// @desc    Delete Telegram webhook
// @route   DELETE /api/admin/telegram/delete-webhook
// @access  Private/Admin
export const deleteTelegramWebhook = asyncHandler(async (req, res) => {
  try {
    // Get Telegram settings
    const Settings = (await import('../models/Settings.mjs')).default;
    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      res.status(400);
      throw new Error('Telegram bot token not configured');
    }

    // Delete webhook via Telegram API
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `https://api.telegram.org/bot${settings.telegramBotToken}/deleteWebhook`
    );

    if (response.data.ok) {
      logger.info('✅ Telegram webhook deleted successfully');
      
      res.json({
        success: true,
        message: 'Telegram webhook deleted successfully',
        result: response.data.result
      });
    } else {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

  } catch (error) {
    logger.error('❌ Error deleting Telegram webhook:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error deleting Telegram webhook',
      error: error.message
    });
  }
});

