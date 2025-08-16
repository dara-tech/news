#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './backend/models/Settings.mjs';
import News from './backend/models/News.mjs';
import User from './backend/models/User.mjs';
import SocialMediaService from './backend/services/socialMediaService.mjs';

dotenv.config();

class AutoPostingTester {
  constructor() {
    this.results = {
      settings: {},
      platforms: {},
      missing: [],
      recommendations: []
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async testSettings() {
    console.log('\n🔍 Testing Social Media Settings...');
    
    try {
      const settings = await Settings.getCategorySettings('social-media');
      this.results.settings = settings;
      
      console.log('📋 Current Settings:');
      console.log('- Auto Post Enabled:', settings.autoPostEnabled);
      console.log('- Social Links:', settings.socialLinks?.length || 0);
      console.log('- Facebook Enabled:', settings.facebookEnabled);
      console.log('- Twitter Enabled:', settings.twitterEnabled);
      console.log('- Instagram Enabled:', settings.instagramEnabled);
      console.log('- Threads Enabled:', settings.threadsEnabled);
      console.log('- LinkedIn Enabled:', settings.linkedinEnabled);
      
      // Check what's missing
      if (!settings.autoPostEnabled) {
        this.results.missing.push('Auto-posting is disabled');
        this.results.recommendations.push('Enable auto-posting in admin settings');
      }
      
      if (!settings.socialLinks || settings.socialLinks.length === 0) {
        this.results.missing.push('No social media platforms configured');
        this.results.recommendations.push('Add social media platforms in admin settings');
      }
      
    } catch (error) {
      console.error('❌ Error testing settings:', error.message);
    }
  }

  async testPlatformConfigurations() {
    console.log('\n🔍 Testing Platform Configurations...');
    
    const settings = this.results.settings;
    const platforms = ['facebook', 'twitter', 'instagram', 'threads', 'linkedin'];
    
    for (const platform of platforms) {
      console.log(`\n📱 Testing ${platform.toUpperCase()} configuration:`);
      
      const config = {
        enabled: settings[`${platform}Enabled`],
        hasAppId: !!settings[`${platform}AppId`],
        hasAccessToken: !!settings[`${platform}AccessToken`],
        hasApiKey: !!settings[`${platform}ApiKey`],
        hasApiSecret: !!settings[`${platform}ApiSecret`],
        hasPageId: !!settings[`${platform}PageId`]
      };
      
      this.results.platforms[platform] = config;
      
      console.log(`  - Enabled: ${config.enabled}`);
      console.log(`  - App ID: ${config.hasAppId ? '✅' : '❌'}`);
      console.log(`  - Access Token: ${config.hasAccessToken ? '✅' : '❌'}`);
      console.log(`  - API Key: ${config.hasApiKey ? '✅' : '❌'}`);
      console.log(`  - API Secret: ${config.hasApiSecret ? '✅' : '❌'}`);
      console.log(`  - Page ID: ${config.hasPageId ? '✅' : '❌'}`);
      
      // Check what's missing for each platform
      if (config.enabled) {
        if (!config.hasAppId && platform !== 'linkedin') {
          this.results.missing.push(`${platform} App ID is missing`);
        }
        if (!config.hasAccessToken) {
          this.results.missing.push(`${platform} Access Token is missing`);
        }
        if (platform === 'twitter' && (!config.hasApiKey || !config.hasApiSecret)) {
          this.results.missing.push(`${platform} API credentials are missing`);
        }
        if (platform === 'facebook' && !config.hasPageId) {
          this.results.missing.push(`${platform} Page ID is missing`);
        }
      }
    }
  }

  async testSocialMediaService() {
    console.log('\n🔍 Testing Social Media Service...');
    
    try {
      // Test content generation
      const testArticle = {
        title: { en: 'Test Article: Auto-Posting Test' },
        description: { en: 'This is a test article to verify auto-posting functionality.' },
        slug: 'test-auto-posting-article',
        category: { name: { en: 'Technology' } }
      };
      
      console.log('📝 Testing content generation:');
      const platforms = ['facebook', 'twitter', 'instagram', 'threads', 'linkedin'];
      
      for (const platform of platforms) {
        const content = SocialMediaService.generatePostContent(testArticle, platform);
        console.log(`  ${platform.toUpperCase()}: ${content.length} chars`);
        console.log(`    Preview: ${content.substring(0, 80)}...`);
      }
      
      // Test auto-posting with simulation
      console.log('\n🚀 Testing auto-posting simulation:');
      const result = await SocialMediaService.autoPostContent(testArticle, { _id: 'test-user' });
      
      console.log('Auto-posting result:', {
        success: result.success,
        totalPlatforms: result.totalPlatforms,
        successfulPosts: result.successfulPosts,
        results: result.results?.map(r => ({
          platform: r.platform,
          success: r.success,
          message: r.message
        }))
      });
      
    } catch (error) {
      console.error('❌ Error testing social media service:', error.message);
    }
  }

  async testNewsArticle() {
    console.log('\n🔍 Testing News Article for Auto-Posting...');
    
    try {
      // Find a test article
      const testArticle = await News.findOne({ status: 'published' })
        .populate('category', 'name')
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(1);
      
      if (!testArticle) {
        console.log('⚠️  No published articles found for testing');
        this.results.missing.push('No published articles available for auto-posting test');
        return;
      }
      
      console.log('📰 Found test article:', {
        title: testArticle.title.en,
        slug: testArticle.slug,
        status: testArticle.status,
        category: testArticle.category?.name?.en,
        author: testArticle.author?.username
      });
      
      // Test if this article would trigger auto-posting
      const settings = this.results.settings;
      if (settings.autoPostEnabled && testArticle.status === 'published') {
        console.log('✅ Article would trigger auto-posting');
      } else {
        console.log('❌ Article would not trigger auto-posting');
        if (!settings.autoPostEnabled) {
          this.results.missing.push('Auto-posting is disabled');
        }
      }
      
    } catch (error) {
      console.error('❌ Error testing news article:', error.message);
    }
  }

  async testIntegrationPoints() {
    console.log('\n🔍 Testing Integration Points...');
    
    try {
      // Check if auto-posting is integrated in news controller
      const fs = await import('fs');
      const newsControllerPath = './backend/controllers/newsController.mjs';
      
      if (fs.existsSync(newsControllerPath)) {
        const content = fs.readFileSync(newsControllerPath, 'utf8');
        
        const hasAutoPostImport = content.includes('socialMediaService');
        const hasAutoPostCall = content.includes('autoPostContent');
        const hasStatusCheck = content.includes('status === \'published\'');
        
        console.log('📋 News Controller Integration:');
        console.log(`  - Social Media Service Import: ${hasAutoPostImport ? '✅' : '❌'}`);
        console.log(`  - Auto-Post Call: ${hasAutoPostCall ? '✅' : '❌'}`);
        console.log(`  - Status Check: ${hasStatusCheck ? '✅' : '❌'}`);
        
        if (!hasAutoPostImport) {
          this.results.missing.push('Social media service not imported in news controller');
        }
        if (!hasAutoPostCall) {
          this.results.missing.push('Auto-posting not called in news controller');
        }
        if (!hasStatusCheck) {
          this.results.missing.push('Published status check missing in news controller');
        }
      }
      
    } catch (error) {
      console.error('❌ Error testing integration points:', error.message);
    }
  }

  async testAdminInterface() {
    console.log('\n🔍 Testing Admin Interface...');
    
    try {
      // Check if social media management component exists
      const fs = await import('fs');
      const componentPath = './frontend/src/components/admin/SocialMediaManagement.tsx';
      
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        const hasAutoPostToggle = content.includes('autoPostEnabled');
        const hasPlatformConfig = content.includes('socialLinks');
        const hasTestButtons = content.includes('test');
        const hasStats = content.includes('stats');
        
        console.log('📋 Admin Interface Features:');
        console.log(`  - Auto-Post Toggle: ${hasAutoPostToggle ? '✅' : '❌'}`);
        console.log(`  - Platform Configuration: ${hasPlatformConfig ? '✅' : '❌'}`);
        console.log(`  - Test Buttons: ${hasTestButtons ? '✅' : '❌'}`);
        console.log(`  - Statistics: ${hasStats ? '✅' : '❌'}`);
        
        if (!hasAutoPostToggle) {
          this.results.missing.push('Auto-post toggle missing in admin interface');
        }
        if (!hasPlatformConfig) {
          this.results.missing.push('Platform configuration missing in admin interface');
        }
        if (!hasTestButtons) {
          this.results.missing.push('Test buttons missing in admin interface');
        }
      } else {
        console.log('❌ Social Media Management component not found');
        this.results.missing.push('Social Media Management component missing');
      }
      
    } catch (error) {
      console.error('❌ Error testing admin interface:', error.message);
    }
  }

  async generateReport() {
    console.log('\n📊 AUTO-POSTING TEST REPORT');
    console.log('=' .repeat(50));
    
    console.log('\n❌ MISSING COMPONENTS:');
    if (this.results.missing.length === 0) {
      console.log('✅ No missing components found!');
    } else {
      this.results.missing.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.recommendations.length === 0) {
      console.log('✅ No recommendations needed!');
    } else {
      this.results.recommendations.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });
    }
    
    console.log('\n📱 PLATFORM STATUS:');
    Object.entries(this.results.platforms).forEach(([platform, config]) => {
      const status = config.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
      const configStatus = config.enabled && 
        (config.hasAppId || config.hasApiKey) && 
        config.hasAccessToken ? '✅ CONFIGURED' : '⚠️  INCOMPLETE';
      
      console.log(`  ${platform.toUpperCase()}: ${status} - ${configStatus}`);
    });
    
    console.log('\n🎯 NEXT STEPS:');
    if (this.results.missing.length === 0) {
      console.log('1. ✅ All components are in place');
      console.log('2. 🔧 Configure platform credentials');
      console.log('3. 🧪 Test with real API credentials');
      console.log('4. 🚀 Enable auto-posting for production');
    } else {
      console.log('1. 🔧 Fix missing components listed above');
      console.log('2. ⚙️  Configure platform credentials');
      console.log('3. 🧪 Test auto-posting functionality');
      console.log('4. 🚀 Deploy to production');
    }
  }

  async run() {
    console.log('🚀 Starting Comprehensive Auto-Posting Test...');
    
    await this.connect();
    await this.testSettings();
    await this.testPlatformConfigurations();
    await this.testSocialMediaService();
    await this.testNewsArticle();
    await this.testIntegrationPoints();
    await this.testAdminInterface();
    await this.generateReport();
    
    console.log('\n✅ Test completed!');
    process.exit(0);
  }
}

// Run the test
const tester = new AutoPostingTester();
tester.run().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
