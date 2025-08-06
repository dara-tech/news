import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['general', 'security', 'integrations', 'logo']
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isSensitive: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
settingsSchema.index({ category: 1, key: 1 }, { unique: true });

// Static method to get all settings for a category
settingsSchema.statics.getCategorySettings = async function(category) {
  const settings = await this.find({ category }).lean();
  const result = {};
  
  settings.forEach(setting => {
    result[setting.key] = setting.value;
  });
  
  return result;
};

// Static method to update settings for a category
settingsSchema.statics.updateCategorySettings = async function(category, settings, userId) {
  const updates = [];
  const now = new Date();
  
  for (const [key, value] of Object.entries(settings)) {
    updates.push({
      updateOne: {
        filter: { category, key },
        update: {
          $set: {
            value,
            updatedBy: userId,
            updatedAt: now
          }
        },
        upsert: true
      }
    });
  }
  
  if (updates.length > 0) {
    await this.bulkWrite(updates);
  }
  
  return this.getCategorySettings(category);
};

// Static method to get settings with sensitive data masked
settingsSchema.statics.getCategorySettingsMasked = async function(category) {
  const settings = await this.find({ category }).lean();
  const result = {};
  
  settings.forEach(setting => {
    if (setting.isSensitive && setting.value) {
      result[setting.key] = '********';
    } else {
      result[setting.key] = setting.value;
    }
  });
  
  return result;
};

// Static method to initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
  const defaultSettings = {
    general: {
      siteName: 'NewsApp',
      siteDescription: 'Your trusted source for news',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      maintenanceMode: false,
      analyticsEnabled: true,
      commentsEnabled: true,
      moderationRequired: false,
    },
    security: {
      twoFactorEnabled: false,
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      sessionTimeout: 1440,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      requireEmailVerification: true,
      logSecurityEvents: true,
      allowPasswordReset: true,
      forcePasswordChange: false,
      passwordHistoryLimit: 5,
    },
    integrations: {
      emailProvider: 'smtp',
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpSecure: true,
      emailEnabled: false,
      googleAnalyticsId: '',
      analyticsEnabled: false,
      facebookAppId: '',
      twitterApiKey: '',
      cloudinaryCloudName: '',
      cloudinaryApiKey: '',
      cloudinaryApiSecret: '',
      cloudinaryEnabled: false,
      firebaseServerKey: '',
      pushNotificationsEnabled: false,
      webhookUrl: '',
      webhookSecret: '',
      webhookEnabled: false,
    },
    logo: {
      logoDisplayMode: 'text',
      logoText: 'Newsly',
      logoTextColor: '#000000',
      logoBackgroundColor: '#ffffff',
      logoFontSize: 24,
      logoUrl: null,
      logoPublicId: null,
      logoWidth: null,
      logoHeight: null,
      logoFormat: null,
      logoSize: null,
    }
  };

  const sensitiveFields = [
    'smtpPassword',
    'cloudinaryApiSecret', 
    'firebaseServerKey',
    'webhookSecret'
  ];

  const descriptions = {
    // General settings
    siteName: 'The name of your news website',
    siteDescription: 'Brief description of your news website',
    siteUrl: 'The main URL of your website',
    adminEmail: 'Primary admin email address',
    contactEmail: 'Public contact email address',
    allowRegistration: 'Allow new users to register accounts',
    maintenanceMode: 'Put site in maintenance mode',
    analyticsEnabled: 'Enable site analytics',
    commentsEnabled: 'Enable comments on articles',
    moderationRequired: 'Require comment approval before publishing',
    
    // Security settings
    twoFactorEnabled: 'Enable 2FA for admin accounts',
    passwordMinLength: 'Minimum password length',
    requireSpecialChars: 'Require special characters in passwords',
    requireNumbers: 'Require numbers in passwords',
    requireUppercase: 'Require uppercase letters in passwords',
    sessionTimeout: 'Session timeout in minutes',
    maxLoginAttempts: 'Maximum failed login attempts',
    lockoutDuration: 'Account lockout duration in minutes',
    
    // Logo settings
    logoDisplayMode: 'How the logo should be displayed (image or text)',
    logoText: 'Text to display when using text logo',
    logoTextColor: 'Color of the logo text',
    logoBackgroundColor: 'Background color of the logo',
    logoFontSize: 'Font size of the logo text',
    logoUrl: 'URL of the uploaded logo image',
    logoPublicId: 'File ID of the logo',
    logoWidth: 'Width of the logo image',
    logoHeight: 'Height of the logo image',
    logoFormat: 'Format of the logo image',
    logoSize: 'File size of the logo image',
    requireEmailVerification: 'Require email verification for new accounts',
    logSecurityEvents: 'Log security-related events',
    allowPasswordReset: 'Allow password reset via email',
    forcePasswordChange: 'Force periodic password changes',
    passwordHistoryLimit: 'Number of previous passwords to remember',
    
    // Integration settings
    emailProvider: 'Email service provider',
    smtpHost: 'SMTP server hostname',
    smtpPort: 'SMTP server port',
    smtpUsername: 'SMTP username',
    smtpPassword: 'SMTP password (sensitive)',
    smtpSecure: 'Use secure SMTP connection',
    emailEnabled: 'Enable email functionality',
    googleAnalyticsId: 'Google Analytics tracking ID',
    analyticsEnabled: 'Enable analytics tracking',
    facebookAppId: 'Facebook application ID',
    twitterApiKey: 'Twitter API key',
    cloudinaryCloudName: 'Cloudinary cloud name',
    cloudinaryApiKey: 'Cloudinary API key',
    cloudinaryApiSecret: 'Cloudinary API secret (sensitive)',
    cloudinaryEnabled: 'Enable Cloudinary integration',
    firebaseServerKey: 'Firebase server key (sensitive)',
    pushNotificationsEnabled: 'Enable push notifications',
    webhookUrl: 'Webhook endpoint URL',
    webhookSecret: 'Webhook secret key (sensitive)',
    webhookEnabled: 'Enable webhook notifications'
  };

  // Create a system user ID for initial settings
  const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');

  for (const [category, settings] of Object.entries(defaultSettings)) {
    for (const [key, value] of Object.entries(settings)) {
      const isSensitive = sensitiveFields.includes(key);
      
      await this.findOneAndUpdate(
        { category, key },
        {
          value,
          description: descriptions[key] || '',
          isSensitive,
          updatedBy: systemUserId,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  }
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 