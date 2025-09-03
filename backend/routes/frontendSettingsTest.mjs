#!/usr/bin/env node

/**
 * Frontend Settings API Routes (Test Version - No Auth)
 * For testing the frontend control panel
 */

import express from 'express';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

// In-memory settings store for testing
let testSettings = {
  adsense: {
    enabled: false,
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX',
    autoAdsEnabled: true,
    adSlots: {
      header: '1234567890',
      sidebar: '0987654321',
      article: '1122334455',
      footer: '5566778899'
    },
    testMode: true
  },
  appearance: {
    theme: 'auto',
    primaryColor: '#3b82f6',
    logoText: 'Razewire',
    logoImage: '',
    favicon: '/favicon.ico'
  },
  features: {
    commentsEnabled: true,
    likesEnabled: true,
    newsletterEnabled: true,
    searchEnabled: true,
    socialSharingEnabled: true,
    userRegistrationEnabled: true,
    multiLanguageEnabled: true,
    pwaPushNotifications: false
  },
  seo: {
    siteName: 'Razewire',
    siteDescription: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    keywords: 'news, Cambodia, technology, business, sports, politics',
    ogImage: 'https://www.razewire.online/og-image.svg',
    twitterHandle: '@razewire',
    googleAnalyticsId: '',
    googleSearchConsoleId: 'google28105ddce768934a'
  },
  performance: {
    cachingEnabled: true,
    imageOptimization: true,
    lazyLoadingEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false
  },
  security: {
    rateLimitingEnabled: true,
    captchaEnabled: false,
    csrfProtectionEnabled: true,
    contentSecurityPolicy: true,
    httpsRedirectEnabled: true
  }
};

/**
 * GET /api/admin/frontend-settings
 * Get current frontend settings
 */
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      settings: testSettings,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to get frontend settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load frontend settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/frontend-settings
 * Update frontend settings
 */
router.put('/', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    // Update test settings
    testSettings = { ...testSettings, ...settings };

    logger.info('Frontend settings updated (test mode)');

    res.json({
      success: true,
      message: 'Frontend settings updated successfully',
      settings: testSettings,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to update frontend settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update frontend settings',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/frontend-settings/test-adsense
 * Test AdSense configuration
 */
router.post('/test-adsense', async (req, res) => {
  try {
    const { publisherId } = req.body;
    
    if (!publisherId || !publisherId.startsWith('ca-pub-')) {
      return res.json({
        success: false,
        message: 'Invalid AdSense Publisher ID format. Should start with "ca-pub-"'
      });
    }

    // Validate publisher ID format
    const publisherIdRegex = /^ca-pub-\d{16}$/;
    if (!publisherIdRegex.test(publisherId)) {
      return res.json({
        success: false,
        message: 'Invalid Publisher ID format. Should be ca-pub-XXXXXXXXXXXXXXXX (16 digits)'
      });
    }

    // For testing, always return success for valid format
    res.json({
      success: true,
      message: 'AdSense Publisher ID format is valid',
      details: {
        publisherId,
        format: 'valid',
        testMode: true
      }
    });
  } catch (error) {
    logger.error('AdSense test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test AdSense configuration',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/frontend-settings/apply-theme
 * Apply theme changes immediately
 */
router.post('/apply-theme', async (req, res) => {
  try {
    const { theme, primaryColor } = req.body;
    
    // Update test settings
    testSettings.appearance.theme = theme;
    testSettings.appearance.primaryColor = primaryColor;

    res.json({
      success: true,
      message: 'Theme applied successfully',
      theme,
      primaryColor
    });
  } catch (error) {
    logger.error('Failed to apply theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply theme',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/frontend-settings/status
 * Get frontend control panel status
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      adsenseConfigured: testSettings.adsense.publisherId !== 'ca-pub-XXXXXXXXXXXXXXXXX',
      adsenseEnabled: testSettings.adsense.enabled,
      featuresEnabled: Object.values(testSettings.features).filter(Boolean).length,
      totalFeatures: Object.keys(testSettings.features).length,
      themeMode: testSettings.appearance.theme,
      securityLevel: Object.values(testSettings.security).filter(Boolean).length,
      performanceOptimizations: Object.values(testSettings.performance).filter(Boolean).length
    };

    res.json({
      success: true,
      status,
      settings: testSettings,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to get status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

export default router;
