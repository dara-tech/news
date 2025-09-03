#!/usr/bin/env node

/**
 * API Key Management Routes
 * Provides endpoints for managing and monitoring API keys
 */

import express from 'express';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

/**
 * GET /api/admin/api-keys/overview
 * Get overview of all API keys and their status
 */
router.get('/overview', async (req, res) => {
  try {
    const apiKeys = {
      // AI/ML Services
      google: {
        name: 'Google Gemini AI',
        keys: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
        status: 'active',
        usage: 'Content generation, quality assessment, translation',
        quota: '50 requests/day (free tier)',
        lastUsed: new Date().toISOString()
      },
      
      // Social Media Platforms
      facebook: {
        name: 'Facebook/Meta',
        keys: ['facebookAppId', 'facebookAppSecret', 'facebookPageAccessToken'],
        status: 'configured',
        usage: 'Auto-posting, social sharing',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      twitter: {
        name: 'Twitter/X',
        keys: ['twitterApiKey', 'twitterApiSecret', 'twitterBearerToken', 'twitterAccessToken'],
        status: 'configured',
        usage: 'Auto-posting, social sharing',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      linkedin: {
        name: 'LinkedIn',
        keys: ['linkedinClientId', 'linkedinClientSecret', 'linkedinAccessToken', 'linkedinRefreshToken'],
        status: 'configured',
        usage: 'Auto-posting, professional sharing',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      instagram: {
        name: 'Instagram',
        keys: ['instagramAppId', 'instagramAppSecret', 'instagramAccessToken'],
        status: 'configured',
        usage: 'Auto-posting, visual content',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      telegram: {
        name: 'Telegram',
        keys: ['telegramBotToken'],
        status: 'configured',
        usage: 'Auto-posting, notifications',
        quota: 'Unlimited',
        lastUsed: null
      },
      
      threads: {
        name: 'Threads',
        keys: ['threadsAppId', 'threadsAppSecret', 'threadsAccessToken'],
        status: 'configured',
        usage: 'Auto-posting, social sharing',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      // Cloud Services
      cloudinary: {
        name: 'Cloudinary',
        keys: ['cloudinaryCloudName', 'cloudinaryApiKey', 'cloudinaryApiSecret'],
        status: 'configured',
        usage: 'Image storage, optimization',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      // Database & Infrastructure
      mongodb: {
        name: 'MongoDB',
        keys: ['MONGODB_URI'],
        status: 'active',
        usage: 'Database storage',
        quota: 'Varies by plan',
        lastUsed: new Date().toISOString()
      },
      
      // Authentication
      googleAuth: {
        name: 'Google OAuth',
        keys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        status: 'configured',
        usage: 'User authentication',
        quota: 'Varies by plan',
        lastUsed: null
      },
      
      // Security
      jwt: {
        name: 'JWT Secret',
        keys: ['JWT_SECRET'],
        status: 'active',
        usage: 'Token signing',
        quota: 'N/A',
        lastUsed: new Date().toISOString()
      }
    };

    // Get actual settings from database
    const socialMediaSettings = await Settings.getCategorySettingsMasked('social-media');
    const integrationSettings = await Settings.getCategorySettingsMasked('integrations');

    // Update status based on actual configuration
    Object.keys(apiKeys).forEach(service => {
      const serviceConfig = apiKeys[service];
      let hasRequiredKeys = true;
      
      serviceConfig.keys.forEach(key => {
        if (key.includes('facebook') && !socialMediaSettings[`facebook${key.replace('facebook', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('twitter') && !socialMediaSettings[`twitter${key.replace('twitter', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('linkedin') && !socialMediaSettings[`linkedin${key.replace('linkedin', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('instagram') && !socialMediaSettings[`instagram${key.replace('instagram', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('telegram') && !socialMediaSettings[`telegram${key.replace('telegram', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('threads') && !socialMediaSettings[`threads${key.replace('threads', '')}`]) {
          hasRequiredKeys = false;
        } else if (key.includes('cloudinary') && !integrationSettings[`cloudinary${key.replace('cloudinary', '')}`]) {
          hasRequiredKeys = false;
        }
      });
      
      if (!hasRequiredKeys) {
        serviceConfig.status = 'not_configured';
      }
    });

    res.json({
      success: true,
      data: {
        totalServices: Object.keys(apiKeys).length,
        activeServices: Object.values(apiKeys).filter(s => s.status === 'active').length,
        configuredServices: Object.values(apiKeys).filter(s => s.status === 'configured').length,
        notConfiguredServices: Object.values(apiKeys).filter(s => s.status === 'not_configured').length,
        services: apiKeys
      }
    });

  } catch (error) {
    logger.error('API key overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API key overview',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/api-keys/usage
 * Get API usage statistics
 */
router.get('/usage', async (req, res) => {
  try {
    const usage = {
      google: {
        requestsToday: 45,
        requestsLimit: 50,
        quotaReset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cost: 0,
        plan: 'Free Tier'
      },
      facebook: {
        requestsToday: 0,
        requestsLimit: 'Unlimited',
        quotaReset: null,
        cost: 0,
        plan: 'Free'
      },
      twitter: {
        requestsToday: 0,
        requestsLimit: 'Unlimited',
        quotaReset: null,
        cost: 0,
        plan: 'Free'
      },
      cloudinary: {
        requestsToday: 0,
        requestsLimit: 'Unlimited',
        quotaReset: null,
        cost: 0,
        plan: 'Free'
      }
    };

    res.json({
      success: true,
      data: usage
    });

  } catch (error) {
    logger.error('API usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API usage',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/api-keys/status
 * Get detailed status of all API keys
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing',
        MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
        JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
      },
      database: {
        socialMedia: await Settings.getCategorySettingsMasked('social-media'),
        integrations: await Settings.getCategorySettingsMasked('integrations')
      }
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('API status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API status',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/api-keys/social-media
 * Update social media API keys
 */
router.put('/social-media', async (req, res) => {
  try {
    const { keys, userId } = req.body;
    
    // Update social media settings
    const updatedSettings = await Settings.updateCategorySettings(
      'social-media', 
      keys, 
      userId || new mongoose.Types.ObjectId('000000000000000000000000')
    );
    
    logger.info('Social media API keys updated');
    
    res.json({
      success: true,
      message: 'Social media API keys updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    logger.error('Update social media keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social media API keys',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/api-keys/integrations
 * Update integration API keys
 */
router.put('/integrations', async (req, res) => {
  try {
    const { keys, userId } = req.body;
    
    // Update integration settings
    const updatedSettings = await Settings.updateCategorySettings(
      'integrations', 
      keys, 
      userId || new mongoose.Types.ObjectId('000000000000000000000000')
    );
    
    logger.info('Integration API keys updated');
    
    res.json({
      success: true,
      message: 'Integration API keys updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    logger.error('Update integration keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update integration API keys',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/api-keys/environment
 * Update environment variables (read-only for security)
 */
router.put('/environment', async (req, res) => {
  try {
    // Environment variables cannot be updated via API for security reasons
    // They must be set in the .env file or server environment
    
    res.json({
      success: false,
      message: 'Environment variables cannot be updated via API. Please update them in your .env file or server environment.',
      note: 'For security reasons, environment variables like GEMINI_API_KEY, JWT_SECRET, etc. must be set at the server level.'
    });

  } catch (error) {
    logger.error('Update environment variables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update environment variables',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/api-keys/test
 * Test API key connectivity
 */
router.post('/test', async (req, res) => {
  try {
    const { service, keys } = req.body;
    
    let testResult = {
      service,
      success: false,
      message: '',
      details: {}
    };

    switch (service) {
      case 'google':
        // Test Google Gemini API
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(keys.GEMINI_API_KEY || keys.GOOGLE_API_KEY);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent('Test connection');
          testResult.success = true;
          testResult.message = 'Google Gemini API connection successful';
          testResult.details = { model: 'gemini-1.5-flash' };
        } catch (error) {
          testResult.message = `Google Gemini API test failed: ${error.message}`;
        }
        break;
        
      case 'telegram':
        // Test Telegram Bot API
        try {
          const response = await fetch(`https://api.telegram.org/bot${keys.telegramBotToken}/getMe`);
          const data = await response.json();
          if (data.ok) {
            testResult.success = true;
            testResult.message = 'Telegram Bot API connection successful';
            testResult.details = { botName: data.result.first_name };
          } else {
            testResult.message = `Telegram API test failed: ${data.description}`;
          }
        } catch (error) {
          testResult.message = `Telegram API test failed: ${error.message}`;
        }
        break;
        
      case 'cloudinary':
        // Test Cloudinary API
        try {
          const cloudinary = require('cloudinary').v2;
          cloudinary.config({
            cloud_name: keys.cloudinaryCloudName,
            api_key: keys.cloudinaryApiKey,
            api_secret: keys.cloudinaryApiSecret
          });
          
          const result = await cloudinary.api.ping();
          testResult.success = true;
          testResult.message = 'Cloudinary API connection successful';
          testResult.details = { status: result.status };
        } catch (error) {
          testResult.message = `Cloudinary API test failed: ${error.message}`;
        }
        break;
        
      default:
        testResult.message = `Unknown service: ${service}`;
    }

    res.json({
      success: true,
      data: testResult
    });

  } catch (error) {
    logger.error('API key test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test API key',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/api-keys/raw
 * Get raw API key values (for editing)
 */
router.get('/raw', async (req, res) => {
  try {
    const rawData = {
      socialMedia: await Settings.getCategorySettings('social-media'),
      integrations: await Settings.getCategorySettings('integrations'),
      environment: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        MONGODB_URI: process.env.MONGODB_URI || '',
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
      }
    };

    res.json({
      success: true,
      data: rawData
    });

  } catch (error) {
    logger.error('Get raw API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get raw API keys',
      error: error.message
    });
  }
});

export default router;
