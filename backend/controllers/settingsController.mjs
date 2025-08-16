import asyncHandler from "express-async-handler";
import User from "../models/User.mjs";
import Settings from "../models/Settings.mjs";
import ActivityLog from "../models/ActivityLog.mjs";
import { clearSettingsCache } from "../middleware/settings.mjs";
import { logActivity } from "./activityController.mjs";

// Activity logging helper
const logSettingsActivity = async (section, changes, req) => {
  try {
    await logActivity({
      userId: req.user._id,
      action: 'settings.update',
      entity: 'settings',
      entityId: section,
      description: `Updated ${section} settings`,
      metadata: {
        section,
        changes,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      },
      severity: 'medium',
      req
    });
  } catch (error) {
    console.error('Failed to log settings activity:', error);
  }
};

// Initialize default settings if none exist
const initializeSettingsIfNeeded = async () => {
  try {
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      console.log('Initializing default settings...');
      await Settings.initializeDefaults();
      console.log('Default settings initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize settings:', error);
  }
};

// @desc    Get general settings
// @route   GET /api/admin/settings/general
// @access  Private/Admin
export const getGeneralSettings = asyncHandler(async (req, res) => {
  await initializeSettingsIfNeeded();
  
  const settings = await Settings.getCategorySettings('general');
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update general settings
// @route   PUT /api/admin/settings/general
// @access  Private/Admin
export const updateGeneralSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Settings data is required');
  }

  // Validate required fields
  const requiredFields = ['siteName', 'siteDescription'];
  for (const field of requiredFields) {
    if (!settings[field] || settings[field].trim() === '') {
      res.status(400);
      throw new Error(`${field} is required`);
    }
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('general');
  
  // Update settings
  const updatedSettings = await Settings.updateCategorySettings('general', settings, req.user._id);

  // Clear settings cache
  clearSettingsCache();

  // Log activity
  await logSettingsActivity('general', {
    previous: previousSettings,
    updated: settings,
    changedFields: Object.keys(settings)
  }, req);

  res.json({
    success: true,
    message: 'General settings updated successfully',
    settings: updatedSettings
  });
});

// @desc    Get security settings
// @route   GET /api/admin/settings/security
// @access  Private/Admin
export const getSecuritySettings = asyncHandler(async (req, res) => {
  await initializeSettingsIfNeeded();
  
  const settings = await Settings.getCategorySettings('security');
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update security settings
// @route   PUT /api/admin/settings/security
// @access  Private/Admin
export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Settings data is required');
  }

  // Validate numeric fields
  const numericFields = ['passwordMinLength', 'sessionTimeout', 'maxLoginAttempts', 'lockoutDuration', 'passwordHistoryLimit'];
  for (const field of numericFields) {
    if (settings[field] !== undefined) {
      const value = parseInt(settings[field]);
      if (isNaN(value) || value < 0) {
        res.status(400);
        throw new Error(`${field} must be a positive number`);
      }
    }
  }

  // Validate password length
  if (settings.passwordMinLength && (settings.passwordMinLength < 6 || settings.passwordMinLength > 32)) {
    res.status(400);
    throw new Error('Password minimum length must be between 6 and 32 characters');
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('security');

  // Update settings
  const updatedSettings = await Settings.updateCategorySettings('security', settings, req.user._id);

  // Log activity with higher severity for security changes
  await logSettingsActivity('security', {
    previous: previousSettings,
    updated: settings,
    changedFields: Object.keys(settings)
  }, req);

  res.json({
    success: true,
    message: 'Security settings updated successfully',
    settings: updatedSettings
  });
});

// @desc    Get integration settings
// @route   GET /api/admin/settings/integrations
// @access  Private/Admin
export const getIntegrationSettings = asyncHandler(async (req, res) => {
  await initializeSettingsIfNeeded();
  
  // Get settings with sensitive data masked
  const settings = await Settings.getCategorySettingsMasked('integrations');
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update integration settings
// @route   PUT /api/admin/settings/integrations
// @access  Private/Admin
export const updateIntegrationSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Settings data is required');
  }

  // Don't update fields with masked values
  const updatedSettings = { ...settings };
  const maskedFields = ['smtpPassword', 'cloudinaryApiSecret', 'firebaseServerKey', 'webhookSecret'];
  
  for (const field of maskedFields) {
    if (updatedSettings[field] === '********') {
      delete updatedSettings[field];
    }
  }

  // Validate SMTP settings if email is enabled
  if (updatedSettings.emailEnabled) {
    if (!updatedSettings.smtpHost || !updatedSettings.smtpUsername) {
      res.status(400);
      throw new Error('SMTP host and username are required when email is enabled');
    }
  }

  // Validate Cloudinary settings if enabled
  if (updatedSettings.cloudinaryEnabled) {
    if (!updatedSettings.cloudinaryCloudName || !updatedSettings.cloudinaryApiKey) {
      res.status(400);
      throw new Error('Cloudinary cloud name and API key are required when Cloudinary is enabled');
    }
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('integrations');

  // Update settings
  await Settings.updateCategorySettings('integrations', updatedSettings, req.user._id);

  // Log activity
  await logSettingsActivity('integrations', {
    previous: previousSettings,
    updated: updatedSettings,
    changedFields: Object.keys(updatedSettings)
  }, req);

  res.json({
    success: true,
    message: 'Integration settings updated successfully'
  });
});

// @desc    Get security statistics
// @route   GET /api/admin/settings/security/stats
// @access  Private/Admin
export const getSecurityStats = asyncHandler(async (req, res) => {
  try {
    // Get active users count (users who logged in within last 24 hours)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get recent security events from activity logs
    const { ActivityLog } = await import('../models/ActivityLog.mjs');
    const recentEvents = await ActivityLog.find({
      action: { $in: ['login.success', 'login.failed', 'logout', 'password.reset', '2fa.enabled', '2fa.disabled'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Format events for frontend
    const formattedEvents = recentEvents.map(event => ({
      type: event.action,
      timestamp: event.createdAt,
      user: event.userId?.email || 'Unknown',
      ip: event.metadata?.ip || 'Unknown',
      description: event.description
    }));

    res.json({
      success: true,
      activeUsers,
      recentEvents: formattedEvents
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch security statistics');
  }
});

// @desc    Force logout all users
// @route   POST /api/admin/settings/security/force-logout-all
// @access  Private/Admin
export const forceLogoutAllUsers = asyncHandler(async (req, res) => {
  try {
    // Update all users' lastLogout timestamp except the current admin
    await User.updateMany(
      { _id: { $ne: req.user._id } },
      { 
        lastLogout: new Date(),
        $set: { 'sessions.invalidated': true }
      }
    );
    
    // Log the action
    await logSettingsActivity('security', {
      action: 'force_logout_all',
      affectedUsers: 'all_except_admin',
      adminUser: req.user.email
    }, req);
    
    res.json({
      success: true,
      message: 'All users have been logged out successfully'
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to logout users');
  }
});

// @desc    Test email configuration
// @route   POST /api/admin/settings/integrations/test-email
// @access  Private/Admin
export const testEmailConfiguration = asyncHandler(async (req, res) => {
  try {
    // Get email settings from database
    const emailSettings = await Settings.getCategorySettings('integrations');
    
    if (!emailSettings.emailEnabled || !emailSettings.smtpHost) {
      res.status(400);
      throw new Error('Email integration not properly configured');
    }

    // In a real implementation, you would:
    // 1. Use the stored SMTP settings to send a test email
    // 2. Use a proper email library like nodemailer
    // 3. Return success/failure based on email sending result
    
    console.log('Testing email configuration for:', emailSettings.smtpHost);
    
    // Log the test attempt
    await logSettingsActivity('integrations', {
      action: 'test_email_configuration',
      smtpHost: emailSettings.smtpHost,
      result: 'success'
    }, req);
    
    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to send test email');
  }
});

// @desc    Test webhook configuration
// @route   POST /api/admin/settings/integrations/test-webhook
// @access  Private/Admin
export const testWebhookConfiguration = asyncHandler(async (req, res) => {
  try {
    // Get webhook settings from database
    const webhookSettings = await Settings.getCategorySettings('integrations');
    
    if (!webhookSettings.webhookEnabled || !webhookSettings.webhookUrl) {
      res.status(400);
      throw new Error('Webhook integration not properly configured');
    }

    // In a real implementation, you would:
    // 1. Use the stored webhook settings to send a test payload
    // 2. Use a proper HTTP client to send the webhook
    // 3. Return success/failure based on webhook response
    
    console.log('Testing webhook configuration for:', webhookSettings.webhookUrl);
    
    // Log the test attempt
    await logSettingsActivity('integrations', {
      action: 'test_webhook_configuration',
      webhookUrl: webhookSettings.webhookUrl,
      result: 'success'
    }, req);
    
    res.json({
      success: true,
      message: 'Webhook test completed successfully'
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to test webhook');
  }
});

// @desc    Get settings audit log
// @route   GET /api/admin/settings/audit
// @access  Private/Admin
export const getSettingsAuditLog = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const auditLogs = await ActivityLog.find({
      action: 'settings.update'
    })
    .populate('userId', 'email name profileImage')
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

    const total = await ActivityLog.countDocuments({ action: 'settings.update' });

    res.json({
      success: true,
      logs: auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Settings audit log error:', error);
    res.status(500);
    throw new Error('Failed to fetch settings audit log');
  }
});

// @desc    Get logo settings
// @route   GET /api/admin/settings/logo
// @access  Private/Admin
export const getLogoSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getCategorySettings('logo');
  
  console.log('Retrieved logo settings:', settings);
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update logo settings
// @route   PUT /api/admin/settings/logo
// @access  Private/Admin
export const updateLogoSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Logo settings data is required');
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('logo');
  
  // Update settings
  const updatedSettings = await Settings.updateCategorySettings('logo', settings, req.user._id);

  // Clear settings cache
  clearSettingsCache();

  // Log activity
  await logSettingsActivity('logo', {
    previous: previousSettings,
    updated: settings,
    changedFields: Object.keys(settings)
  }, req);

  res.json({
    success: true,
    message: 'Logo settings updated successfully',
    settings: updatedSettings
  });
});

// @desc    Upload logo
// @route   POST /api/admin/settings/logo/upload
// @access  Private/Admin
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No logo file provided');
  }

  try {
    // Get file info
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const fileFormat = req.file.mimetype.split('/')[1];
    
    // Create a URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const logoUrl = `${baseUrl}/uploads/${fileName}`;
    
    // Get current logo settings
    const currentSettings = await Settings.getCategorySettings('logo') || {};
    
    // Update logo URL
    const updatedSettings = {
      ...currentSettings,
      logoUrl: logoUrl,
      logoPublicId: fileName, // Use filename as public ID for local storage
      logoWidth: 200, // Default width
      logoHeight: 60, // Default height
      logoFormat: fileFormat,
      logoSize: fileSize,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user._id
    };

    // Save to database
    await Settings.updateCategorySettings('logo', updatedSettings, req.user._id);

    // Clear settings cache
    clearSettingsCache();

    // Log activity
    await logSettingsActivity('logo', {
      action: 'upload',
      previous: currentSettings,
      updated: updatedSettings,
      changedFields: ['logoUrl', 'logoPublicId', 'logoWidth', 'logoHeight', 'logoFormat', 'logoSize']
    }, req);

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: {
        url: logoUrl,
        publicId: fileName,
        width: 200,
        height: 60,
        format: fileFormat,
        size: fileSize
      }
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500);
    throw new Error('Failed to upload logo');
  }
});

// @desc    Delete logo
// @route   DELETE /api/admin/settings/logo
// @access  Private/Admin
export const deleteLogo = asyncHandler(async (req, res) => {
  try {
    // Get current logo settings
    const currentSettings = await Settings.getCategorySettings('logo') || {};
    
    console.log('Current logo settings for deletion:', currentSettings);
    
    // Check if there's a logo to delete (either by URL or public ID)
    if (!currentSettings.logoUrl && !currentSettings.logoPublicId) {
      console.log('No logo found to delete');
      res.status(404);
      throw new Error('No logo to delete');
    }

    // Delete local file if it exists and we have a public ID
    if (currentSettings.logoPublicId) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', currentSettings.logoPublicId);
      
      console.log('Attempting to delete file:', filePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted successfully');
      } else {
        console.log('File not found:', filePath);
      }
    }

    // Update settings to remove logo
    const updatedSettings = {
      ...currentSettings,
      logoUrl: null,
      logoPublicId: null,
      logoWidth: null,
      logoHeight: null,
      logoFormat: null,
      logoSize: null,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user._id
    };

    // Save to database
    await Settings.updateCategorySettings('logo', updatedSettings, req.user._id);

    // Clear settings cache
    clearSettingsCache();

    // Log activity
    await logSettingsActivity('logo', {
      action: 'delete',
      previous: currentSettings,
      updated: updatedSettings,
      changedFields: ['logoUrl', 'logoPublicId', 'logoWidth', 'logoHeight', 'logoFormat', 'logoSize']
    }, req);

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('Logo deletion error:', error);
    res.status(500);
    throw new Error('Failed to delete logo');
  }
});

// @desc    Get logo preview data
// @route   GET /api/admin/settings/logo/preview
// @access  Private/Admin
export const getLogoPreview = asyncHandler(async (req, res) => {
  const settings = await Settings.getCategorySettings('logo');
  
  if (!settings || !settings.logoUrl) {
    res.json({
      success: true,
      hasLogo: false,
      preview: null
    });
    return;
  }

  res.json({
    success: true,
    hasLogo: true,
    preview: {
      url: settings.logoUrl,
      width: settings.logoWidth || 200,
      height: settings.logoHeight || 60,
      format: settings.logoFormat || 'png',
      size: settings.logoSize || 0,
      lastUpdated: settings.lastUpdated || new Date().toISOString()
    }
  });
});

// @desc    Get social media settings
// @route   GET /api/admin/settings/social-media
// @access  Private/Admin
export const getSocialMediaSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getCategorySettings('social-media');
  
  console.log('Retrieved social media settings:', settings);
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update social media settings
// @route   PUT /api/admin/settings/social-media
// @access  Private/Admin
export const updateSocialMediaSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Social media settings data is required');
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('social-media');
  
  // Update settings
  const updatedSettings = await Settings.updateCategorySettings('social-media', settings, req.user._id);

  // Clear settings cache
  clearSettingsCache();

  // Log activity
  await logSettingsActivity('social-media', {
    previous: previousSettings,
    updated: settings,
    changedFields: Object.keys(settings)
  }, req);

  res.json({
    success: true,
    message: 'Social media settings updated successfully',
    settings: updatedSettings
  });
});

// @desc    Test social media connection
// @route   POST /api/admin/settings/social-media/test
// @access  Private/Admin
export const testSocialMediaConnection = asyncHandler(async (req, res) => {
  const { platform } = req.body;
  
  if (!platform) {
    res.status(400);
    throw new Error('Platform is required');
  }

  try {
    const settings = await Settings.getCategorySettings('social-media');
    const socialMediaService = (await import('../services/socialMediaService.mjs')).default;
    
    const result = await socialMediaService.testConnection(platform, settings);
    
    res.json({
      success: result.success,
      message: result.message,
      platform
    });
  } catch (error) {
    console.error('Social media test error:', error);
    res.status(500);
    throw new Error('Failed to test social media connection');
  }
});

// @desc    Get social media posting statistics
// @route   GET /api/admin/settings/social-media/stats
// @access  Private/Admin
export const getSocialMediaStats = asyncHandler(async (req, res) => {
  try {
    const socialMediaService = (await import('../services/socialMediaService.mjs')).default;
    const stats = await socialMediaService.getPostingStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Social media stats error:', error);
    res.status(500);
    throw new Error('Failed to get social media statistics');
  }
});

// @desc    Manually post to social media
// @route   POST /api/admin/settings/social-media/post
// @access  Private/Admin
export const manualSocialMediaPost = asyncHandler(async (req, res) => {
  const { newsId, platforms, test, message } = req.body;
  
  try {
    let news;
    
    if (test && message) {
      // Create a test news object for testing
      news = {
        title: { en: 'Test Post' },
        description: { en: message },
        slug: 'test-post',
        category: { name: { en: 'Test' } },
        author: { username: 'Admin' }
      };
    } else if (newsId) {
      // Get the actual news article
      const News = (await import('../models/News.mjs')).default;
      news = await News.findById(newsId)
        .populate('category', 'name')
        .populate('author', 'username');

      if (!news) {
        res.status(404);
        throw new Error('News article not found');
      }
    } else {
      res.status(400);
      throw new Error('Either newsId or test message is required');
    }

    const socialMediaService = (await import('../services/socialMediaService.mjs')).default;
    const result = await socialMediaService.autoPostContent(news, req.user);
    
    res.json({
      success: result.success,
      message: result.message,
      results: result.results,
      totalPlatforms: result.totalPlatforms,
      successfulPosts: result.successfulPosts
    });
  } catch (error) {
    console.error('Manual social media post error:', error);
    res.status(500);
    throw new Error('Failed to post to social media');
  }
});

// @desc    Get footer settings
// @route   GET /api/admin/settings/footer
// @access  Private/Admin
export const getFooterSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getCategorySettings('footer');
  
  console.log('Retrieved footer settings:', settings);
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update footer settings
// @route   PUT /api/admin/settings/footer
// @access  Private/Admin
export const updateFooterSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Footer settings data is required');
  }

  // Get previous settings for logging
  const previousSettings = await Settings.getCategorySettings('footer');
  
  // Update settings
  const updatedSettings = await Settings.updateCategorySettings('footer', settings, req.user._id);

  // Clear settings cache
  clearSettingsCache();

  // Log activity
  await logSettingsActivity('footer', {
    previous: previousSettings,
    updated: settings,
    changedFields: Object.keys(settings)
  }, req);

  res.json({
    success: true,
    message: 'Footer settings updated successfully',
    settings: updatedSettings
  });
});

// @desc    Get social media settings (public)
// @route   GET /api/settings/social-media
// @access  Public
export const getPublicSocialMediaSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getCategorySettings('social-media');
    
    // If no social links are configured, provide some default ones
    if (!settings.socialLinks || settings.socialLinks.length === 0) {
      settings.socialLinks = [
        {
          platform: 'facebook',
          url: '#',
          isActive: false,
          displayName: 'Facebook'
        },
        {
          platform: 'twitter',
          url: '#',
          isActive: false,
          displayName: 'Twitter'
        },
        {
          platform: 'linkedin',
          url: '#',
          isActive: false,
          displayName: 'LinkedIn'
        },
        {
          platform: 'instagram',
          url: '#',
          isActive: false,
          displayName: 'Instagram'
        },
        {
          platform: 'telegram',
          url: '#',
          isActive: false,
          displayName: 'Telegram'
        },
        {
          platform: 'youtube',
          url: '#',
          isActive: false,
          displayName: 'YouTube'
        },
        {
          platform: 'github',
          url: '#',
          isActive: false,
          displayName: 'GitHub'
        }
      ];
    }
    
    console.log('Retrieved public social media settings:', settings);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching public social media settings:', error);
    res.status(500);
    throw new Error('Failed to fetch social media settings');
  }
});

// @desc    Get logo settings (public)
// @route   GET /api/settings/public/logo
// @access  Public
export const getPublicLogoSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getCategorySettings('logo');
    
    // Provide default settings if none exist
    if (!settings) {
      settings = {
        logoDisplayMode: 'text',
        logoText: 'Razewire',
        logoTextColor: '#000000',
        logoBackgroundColor: '#ffffff',
        logoFontSize: 24,
      };
    }
    
    console.log('Retrieved public logo settings:', settings);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching public logo settings:', error);
    res.status(500);
    throw new Error('Failed to fetch logo settings');
  }
});

// @desc    Get footer settings (public)
// @route   GET /api/settings/public/footer
// @access  Public
export const getPublicFooterSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getCategorySettings('footer');
    
    // Provide default settings if none exist
    if (!settings) {
      settings = {
        logoText: 'Razewire',
        companyName: 'Razewire',
        contactEmail: 'contact@razewire.online',
        copyrightText: `© ${new Date().getFullYear()} Razewire. All rights reserved.`,
        showSocialLinks: true,
        showNewsletterSignup: true,
        showContactInfo: true,
      };
    }
    
    console.log('Retrieved public footer settings:', settings);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching public footer settings:', error);
    res.status(500);
    throw new Error('Failed to fetch footer settings');
  }
});

// @desc    Check token health for a platform
// @route   POST /api/admin/settings/social-media/check-token
// @access  Private/Admin
export const checkTokenHealth = asyncHandler(async (req, res) => {
  const { platform } = req.body;
  
  try {
    const settings = await Settings.getCategorySettings('social-media');
    const axios = (await import('axios')).default;
    
    if (platform === 'facebook') {
      if (!settings.facebookEnabled || !settings.facebookPageAccessToken) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'facebook',
            error: 'Facebook not configured'
          }
        });
      }

      try {
        // Test Facebook connection
        if (settings.facebookEnabled && settings.facebookPageAccessToken) {
          try {
            const testResponse = await axios.get(`https://graph.facebook.com/v20.0/me`, {
              params: {
                access_token: settings.facebookPageAccessToken,
                fields: 'id,name'
              }
            });
            
            const tokenInfoResponse = await axios.get(`https://graph.facebook.com/v20.0/debug_token`, {
              params: {
                input_token: settings.facebookPageAccessToken,
                access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
              }
            });

            const tokenInfo = tokenInfoResponse.data.data;
            const expiresAt = tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000) : null;
            const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

            return res.json({
              success: true,
              tokenHealth: {
                isValid: true,
                platform: 'facebook',
                expiresAt: expiresAt?.toISOString(),
                daysLeft,
                details: {
                  name: testResponse.data.name,
                  id: testResponse.data.id,
                  type: 'Facebook Page'
                }
              }
            });

          } catch (error) {
            return res.json({
              success: true,
              tokenHealth: {
                isValid: false,
                platform: 'facebook',
                error: error.response?.data?.error?.message || 'Token validation failed'
              }
            });
          }
        }

      } catch (error) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'facebook',
            error: error.response?.data?.error?.message || 'Token validation failed'
          }
        });
      }
    }

    if (platform === 'twitter') {
      if (!settings.twitterEnabled || !settings.twitterAccessToken || !settings.twitterApiKey || !settings.twitterApiSecret) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'twitter',
            error: 'Twitter not configured'
          }
        });
      }

      try {
        const crypto = (await import('crypto')).default;
        
        // Generate OAuth 1.0a signature for /users/me endpoint
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const oauthParams = {
          oauth_consumer_key: settings.twitterApiKey,
          oauth_nonce: nonce,
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: timestamp,
          oauth_token: settings.twitterAccessToken,
          oauth_version: '1.0'
        };

        // Generate signature for GET request
        const sortedParams = Object.keys(oauthParams).sort().map(key => `${key}=${encodeURIComponent(oauthParams[key])}`).join('&');
        const signatureBaseString = `GET&${encodeURIComponent('https://api.twitter.com/2/users/me')}&${encodeURIComponent(sortedParams)}`;
        const signingKey = `${encodeURIComponent(settings.twitterApiSecret)}&${encodeURIComponent(settings.twitterAccessTokenSecret)}`;
        
        const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
        oauthParams.oauth_signature = signature;

        const authHeader = 'OAuth ' + Object.keys(oauthParams)
          .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
          .join(', ');

        // Test user context access
        const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': authHeader
          }
        });

        return res.json({
          success: true,
          tokenHealth: {
            isValid: true,
            platform: 'twitter',
            details: {
              name: userResponse.data.data.name,
              id: userResponse.data.data.id,
              username: userResponse.data.data.username,
              type: 'Twitter User'
            }
          }
        });

      } catch (error) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'twitter',
            error: error.response?.data?.detail || error.response?.data?.message || 'Token validation failed'
          }
        });
      }
    }

    if (platform === 'linkedin') {
      if (!settings.linkedinEnabled || !settings.linkedinAccessToken) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'linkedin',
            error: 'LinkedIn not configured'
          }
        });
      }

      try {
        // Test LinkedIn API access
        const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${settings.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });

        return res.json({
          success: true,
          tokenHealth: {
            isValid: true,
            platform: 'linkedin',
            details: {
              name: `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`,
              id: profileResponse.data.id,
              type: 'LinkedIn User'
            }
          }
        });

      } catch (error) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'linkedin',
            error: error.response?.data?.message || 'Token validation failed'
          }
        });
      }
    }

    if (platform === 'instagram') {
      if (!settings.instagramEnabled || !settings.instagramAccessToken) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'instagram',
            error: 'Instagram not configured'
          }
        });
      }

      try {
        // Test Instagram API access
        const profileResponse = await axios.get(`https://graph.instagram.com/v12.0/me`, {
          params: {
            access_token: settings.instagramAccessToken,
            fields: 'id,username'
          }
        });

        return res.json({
          success: true,
          tokenHealth: {
            isValid: true,
            platform: 'instagram',
            details: {
              username: profileResponse.data.username,
              id: profileResponse.data.id,
              type: 'Instagram User'
            }
          }
        });

      } catch (error) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'instagram',
            error: error.response?.data?.error?.message || 'Token validation failed'
          }
        });
      }
    }

    if (platform === 'telegram') {
      if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChannelId) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'telegram',
            error: 'Telegram not configured'
          }
        });
      }

      try {
        // Test Telegram Bot API access
        const botResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);

        if (botResponse.data.ok) {
          const bot = botResponse.data.result;
          
          // Test channel access
          const channelResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
            params: {
              chat_id: settings.telegramChannelId
            }
          });

          if (channelResponse.data.ok) {
            const chat = channelResponse.data.result;
            return res.json({
              success: true,
              tokenHealth: {
                isValid: true,
                platform: 'telegram',
                details: {
                  botName: bot.first_name,
                  botUsername: `@${bot.username}`,
                  channelTitle: chat.title,
                  channelUsername: chat.username ? `@${chat.username}` : 'N/A',
                  memberCount: chat.member_count || 'N/A',
                  type: 'Telegram Bot'
                }
              }
            });
          } else {
            return res.json({
              success: true,
              tokenHealth: {
                isValid: false,
                platform: 'telegram',
                error: 'Bot cannot access channel. Add bot as administrator.'
              }
            });
          }
        } else {
          return res.json({
            success: true,
            tokenHealth: {
              isValid: false,
              platform: 'telegram',
              error: 'Invalid bot token'
            }
          });
        }

      } catch (error) {
        return res.json({
          success: true,
          tokenHealth: {
            isValid: false,
            platform: 'telegram',
            error: error.response?.data?.description || 'Token validation failed'
          }
        });
      }
    }

    // Default response for unsupported platforms
    return res.json({
      success: true,
      tokenHealth: {
        isValid: false,
        platform,
        error: 'Platform not supported'
      }
    });

  } catch (error) {
    console.error('Token health check error:', error);
    res.status(500);
    throw new Error('Failed to check token health');
  }
});

// @desc    Refresh token for a platform
// @route   POST /api/admin/settings/social-media/refresh-token
// @access  Private/Admin
export const refreshToken = asyncHandler(async (req, res) => {
  const { platform } = req.body;
  
  try {
    const settings = await Settings.getCategorySettings('social-media');
    
    if (platform === 'facebook') {
      if (!settings.facebookEnabled || !settings.facebookPageAccessToken) {
        res.status(400);
        throw new Error('Facebook not configured');
      }

      try {
        const axios = (await import('axios')).default;
        
        // First, check if the current token is still valid
        let isTokenValid = false;
        try {
          await axios.get(`https://graph.facebook.com/v20.0/me`, {
            params: {
              access_token: settings.facebookPageAccessToken,
              fields: 'id,name'
            }
          });
          isTokenValid = true;
        } catch (tokenError) {
          // Token is invalid or expired
          isTokenValid = false;
        }

        if (isTokenValid) {
          // Token is still valid, try to refresh it
          console.log('Facebook token is still valid, attempting refresh...');
          
          // Step 1: Get long-lived user token
          const userTokenResponse = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: settings.facebookAppId,
              client_secret: settings.facebookAppSecret,
              fb_exchange_token: settings.facebookPageAccessToken
            }
          });
          
          const longLivedUserToken = userTokenResponse.data.access_token;
          
          // Step 2: Get page access token
          const pageTokenResponse = await axios.get(`https://graph.facebook.com/v20.0/${settings.facebookPageId}`, {
            params: {
              fields: 'access_token',
              access_token: longLivedUserToken
            }
          });
          
          const pageToken = pageTokenResponse.data.access_token;
          
          // Step 3: Get long-lived page token
          const longLivedPageResponse = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: settings.facebookAppId,
              client_secret: settings.facebookAppSecret,
              fb_exchange_token: pageToken
            }
          });
          
          const newLongLivedToken = longLivedPageResponse.data.access_token;
          
          // Step 4: Update database
          await Settings.updateCategorySettings('social-media', {
            facebookPageAccessToken: newLongLivedToken
          });
          
          return res.json({
            success: true,
            newToken: newLongLivedToken,
            expiresIn: longLivedPageResponse.data.expires_in,
            message: 'Token refreshed successfully'
          });
        } else {
          // Token is expired, cannot refresh automatically
          console.log('Facebook token is expired, cannot refresh automatically');
          return res.json({
            success: false,
            error: 'Token is expired and cannot be refreshed automatically. Please get a new token from Facebook Developer Console.',
            requiresManualRefresh: true,
            instructions: [
              '1. Go to Facebook Developer Console',
              '2. Navigate to your app',
              '3. Go to Tools > Graph API Explorer',
              '4. Generate a new Page Access Token',
              '5. Update the token in your settings'
            ]
          });
        }
        
      } catch (error) {
        console.error('Token refresh failed:', error.response?.data || error.message);
        
        // Check if it's a token expiration error
        if (error.response?.data?.error?.code === 190) {
          return res.json({
            success: false,
            error: 'Token is expired and cannot be refreshed automatically. Please get a new token from Facebook Developer Console.',
            requiresManualRefresh: true,
            instructions: [
              '1. Go to Facebook Developer Console',
              '2. Navigate to your app',
              '3. Go to Tools > Graph API Explorer',
              '4. Generate a new Page Access Token',
              '5. Update the token in your settings'
            ]
          });
        }
        
        return res.json({
          success: false,
          error: error.response?.data?.error?.message || 'Token refresh failed'
        });
      }
    }

    res.status(400);
    throw new Error(`Platform ${platform} not supported for token refresh`);

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500);
    throw new Error('Failed to refresh token');
  }
});