#!/usr/bin/env node

/**
 * Frontend Settings API Routes
 * Manages frontend configuration and controls
 */

import express from 'express';
import Settings from '../models/Settings.mjs';
import { protect, admin } from '../middleware/auth.mjs';
import logger from '../utils/logger.mjs';

const router = express.Router();

/**
 * GET /api/admin/frontend-settings
 * Get current frontend settings
 */
router.get('/', protect, admin, async (req, res) => {
  try {
    const [
      adsenseSettings,
      appearanceSettings,
      featureSettings,
      seoSettings,
      performanceSettings,
      securitySettings
    ] = await Promise.all([
      Settings.getCategorySettings('adsense'),
      Settings.getCategorySettings('appearance'),
      Settings.getCategorySettings('features'),
      Settings.getCategorySettings('seo'),
      Settings.getCategorySettings('performance'),
      Settings.getCategorySettings('security')
    ]);

    const settings = {
      adsense: {
        enabled: adsenseSettings.enabled || false,
        publisherId: adsenseSettings.publisherId || 'ca-pub-XXXXXXXXXXXXXXXXX',
        autoAdsEnabled: adsenseSettings.autoAdsEnabled !== false,
        adSlots: {
          header: adsenseSettings.headerSlot || '1234567890',
          sidebar: adsenseSettings.sidebarSlot || '0987654321',
          article: adsenseSettings.articleSlot || '1122334455',
          footer: adsenseSettings.footerSlot || '5566778899'
        },
        testMode: adsenseSettings.testMode !== false
      },
      appearance: {
        theme: appearanceSettings.theme || 'auto',
        primaryColor: appearanceSettings.primaryColor || '#3b82f6',
        logoText: appearanceSettings.logoText || 'Razewire',
        logoImage: appearanceSettings.logoImage || '',
        favicon: appearanceSettings.favicon || '/favicon.ico'
      },
      features: {
        commentsEnabled: featureSettings.commentsEnabled !== false,
        likesEnabled: featureSettings.likesEnabled !== false,
        newsletterEnabled: featureSettings.newsletterEnabled !== false,
        searchEnabled: featureSettings.searchEnabled !== false,
        socialSharingEnabled: featureSettings.socialSharingEnabled !== false,
        userRegistrationEnabled: featureSettings.userRegistrationEnabled !== false,
        multiLanguageEnabled: featureSettings.multiLanguageEnabled !== false,
        pwaPushNotifications: featureSettings.pwaPushNotifications || false
      },
      seo: {
        siteName: seoSettings.siteName || 'Razewire',
        siteDescription: seoSettings.siteDescription || 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
        keywords: seoSettings.keywords || 'news, Cambodia, technology, business, sports, politics',
        ogImage: seoSettings.ogImage || 'https://www.razewire.online/og-image.svg',
        twitterHandle: seoSettings.twitterHandle || '@razewire',
        googleAnalyticsId: seoSettings.googleAnalyticsId || '',
        googleSearchConsoleId: seoSettings.googleSearchConsoleId || 'google28105ddce768934a'
      },
      performance: {
        cachingEnabled: performanceSettings.cachingEnabled !== false,
        imageOptimization: performanceSettings.imageOptimization !== false,
        lazyLoadingEnabled: performanceSettings.lazyLoadingEnabled !== false,
        compressionEnabled: performanceSettings.compressionEnabled !== false,
        cdnEnabled: performanceSettings.cdnEnabled || false
      },
      security: {
        rateLimitingEnabled: securitySettings.rateLimitingEnabled !== false,
        captchaEnabled: securitySettings.captchaEnabled || false,
        csrfProtectionEnabled: securitySettings.csrfProtectionEnabled !== false,
        contentSecurityPolicy: securitySettings.contentSecurityPolicy !== false,
        httpsRedirectEnabled: securitySettings.httpsRedirectEnabled !== false
      }
    };

    res.json({
      success: true,
      settings,
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
router.put('/', protect, admin, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    // Update each category of settings
    const updatePromises = [];

    if (settings.adsense) {
      updatePromises.push(
        Settings.updateCategorySettings('adsense', {
          enabled: settings.adsense.enabled,
          publisherId: settings.adsense.publisherId,
          autoAdsEnabled: settings.adsense.autoAdsEnabled,
          headerSlot: settings.adsense.adSlots.header,
          sidebarSlot: settings.adsense.adSlots.sidebar,
          articleSlot: settings.adsense.adSlots.article,
          footerSlot: settings.adsense.adSlots.footer,
          testMode: settings.adsense.testMode
        })
      );
    }

    if (settings.appearance) {
      updatePromises.push(
        Settings.updateCategorySettings('appearance', settings.appearance)
      );
    }

    if (settings.features) {
      updatePromises.push(
        Settings.updateCategorySettings('features', settings.features)
      );
    }

    if (settings.seo) {
      updatePromises.push(
        Settings.updateCategorySettings('seo', settings.seo)
      );
    }

    if (settings.performance) {
      updatePromises.push(
        Settings.updateCategorySettings('performance', settings.performance)
      );
    }

    if (settings.security) {
      updatePromises.push(
        Settings.updateCategorySettings('security', settings.security)
      );
    }

    await Promise.all(updatePromises);

    logger.info('Frontend settings updated by admin:', req.user.email);

    res.json({
      success: true,
      message: 'Frontend settings updated successfully',
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
router.post('/test-adsense', protect, admin, async (req, res) => {
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

    // Test AdSense API accessibility (basic check)
    try {
      const testUrl = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (response.ok) {
        res.json({
          success: true,
          message: 'AdSense Publisher ID appears to be valid',
          details: {
            publisherId,
            scriptAccessible: true,
            format: 'valid'
          }
        });
      } else {
        res.json({
          success: false,
          message: 'AdSense script not accessible with this Publisher ID',
          details: {
            publisherId,
            scriptAccessible: false,
            httpStatus: response.status
          }
        });
      }
    } catch (fetchError) {
      res.json({
        success: false,
        message: 'Unable to test AdSense connectivity',
        details: {
          publisherId,
          error: fetchError.message
        }
      });
    }
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
router.post('/apply-theme', protect, admin, async (req, res) => {
  try {
    const { theme, primaryColor } = req.body;
    
    // Update appearance settings
    await Settings.updateCategorySettings('appearance', {
      theme,
      primaryColor
    });

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
 * GET /api/admin/frontend-settings/preview
 * Get preview data for frontend controls
 */
router.get('/preview', protect, admin, async (req, res) => {
  try {
    const { theme, primaryColor, features } = req.query;
    
    const previewData = {
      theme: theme || 'auto',
      primaryColor: primaryColor || '#3b82f6',
      features: features ? JSON.parse(features as string) : {},
      sampleContent: {
        title: 'Sample News Article',
        description: 'This is how your articles will appear with current settings.',
        author: 'News Editor',
        publishedAt: new Date().toISOString(),
        category: 'Technology'
      }
    };

    res.json({
      success: true,
      preview: previewData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to generate preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    });
  }
});

export default router;
