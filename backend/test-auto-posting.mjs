#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import News from './models/News.mjs';
import SocialMediaService from './services/socialMediaService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testAutoPosting() {
  logger.info('🚀 Testing Auto-Posting Functionality...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Test 1: Check Settings
    logger.info('\n📋 Test 1: Social Media Settings');
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('- Auto Post Enabled:', settings.autoPostEnabled);
    logger.info('- Social Links Count:', settings.socialLinks?.length || 0);
    logger.info('- Facebook Enabled:', settings.facebookEnabled);
    logger.info('- Twitter Enabled:', settings.twitterEnabled);
    logger.info('- Instagram Enabled:', settings.instagramEnabled);
    logger.info('- Threads Enabled:', settings.threadsEnabled);
    
    // Test 2: Check Platform Configurations
    logger.info('\n📱 Test 2: Platform Configurations');
    const platforms = ['facebook', 'twitter', 'instagram', 'telegram', 'threads'];
    
    for (const platform of platforms) {
      const enabled = settings[`${platform}Enabled`];
      const hasAppId = !!settings[`${platform}AppId`];
      const hasAccessToken = !!settings[`${platform}AccessToken`];
      const hasApiKey = !!settings[`${platform}ApiKey`];
      const hasApiSecret = !!settings[`${platform}ApiSecret`];
      
      logger.info(`\n${platform.toUpperCase()}:`);
      logger.info(`  - Enabled: ${enabled ? '✅' : '❌'}`);
      logger.info(`  - App ID: ${hasAppId ? '✅' : '❌'}`);
      logger.info(`  - Access Token: ${hasAccessToken ? '✅' : '❌'}`);
      logger.info(`  - API Key: ${hasApiKey ? '✅' : '❌'}`);
      logger.info(`  - API Secret: ${hasApiSecret ? '✅' : '❌'}`);
      
      if (enabled && (!hasAppId || !hasAccessToken)) {
        logger.info(`  ⚠️  ${platform} is enabled but missing credentials`);
      }
    }
    
    // Test 3: Test Content Generation
    logger.info('\n📝 Test 3: Content Generation');
    const testArticle = {
      title: { en: 'Test Article: Auto-Posting Test' },
      description: { en: 'This is a test article to verify auto-posting functionality.' },
      slug: 'test-auto-posting-article',
      category: { name: { en: 'Technology' } }
    };
    
    for (const platform of platforms) {
      const content = SocialMediaService.generatePostContent(testArticle, platform);
      logger.info(`${platform.toUpperCase()}: ${content.length} chars`);
      logger.info(`  Preview: ${content.substring(0, 80)}...`);
    }
    
    // Test 4: Test Auto-Posting Service
    logger.info('\n🚀 Test 4: Auto-Posting Service');
    const result = await SocialMediaService.autoPostContent(testArticle, { _id: 'test-user' });
    
    logger.info('Auto-posting result:');
    logger.info('- Success:', result.success);
    logger.info('- Total Platforms:', result.totalPlatforms);
    logger.info('- Successful Posts:', result.successfulPosts);
    logger.info('- Results:', result.results?.map(r => `${r.platform}: ${r.success ? '✅' : '❌'} - ${r.message}`));
    
    // Test 5: Check for Published Articles
    logger.info('\n📰 Test 5: Published Articles');
    const publishedArticle = await News.findOne({ status: 'published' })
      .populate('category', 'name')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (publishedArticle) {
      logger.info('Found published article:', publishedArticle.title.en);
      logger.info('- Status:', publishedArticle.status);
      logger.info('- Category:', publishedArticle.category?.name?.en);
      logger.info('- Author:', publishedArticle.author?.username);
      
      if (settings.autoPostEnabled) {
        logger.info('✅ This article would trigger auto-posting');
      } else {
        logger.info('❌ Auto-posting is disabled');
      }
    } else {
      logger.info('⚠️  No published articles found');
    }
    
    // Test 6: Check Integration
    logger.info('\n🔗 Test 6: Integration Check');
    const fs = await import('fs');
    const newsControllerPath = './controllers/newsController.mjs';
    
    if (fs.existsSync(newsControllerPath)) {
      const content = fs.readFileSync(newsControllerPath, 'utf8');
      
      const hasAutoPostImport = content.includes('socialMediaService');
      const hasAutoPostCall = content.includes('autoPostContent');
      const hasStatusCheck = content.includes('status === \'published\'');
      
      logger.info('News Controller Integration:');
      logger.info(`- Social Media Service Import: ${hasAutoPostImport ? '✅' : '❌'}`);
      logger.info(`- Auto-Post Call: ${hasAutoPostCall ? '✅' : '❌'}`);
      logger.info(`- Status Check: ${hasStatusCheck ? '✅' : '❌'}`);
    }
    
    // Generate Summary
    logger.info('\n📊 SUMMARY');
    logger.info('=' .repeat(40));
    
    const issues = [];
    const recommendations = [];
    
    if (!settings.autoPostEnabled) {
      issues.push('Auto-posting is disabled');
      recommendations.push('Enable auto-posting in admin settings');
    }
    
    if (!settings.socialLinks || settings.socialLinks.length === 0) {
      issues.push('No social media platforms configured');
      recommendations.push('Add social media platforms in admin settings');
    }
    
    for (const platform of platforms) {
      if (settings[`${platform}Enabled`]) {
        if (!settings[`${platform}AppId`] && platform !== 'linkedin') {
          issues.push(`${platform} App ID is missing`);
        }
        if (!settings[`${platform}AccessToken`]) {
          issues.push(`${platform} Access Token is missing`);
        }
        if (platform === 'twitter' && (!settings[`${platform}ApiKey`] || !settings[`${platform}ApiSecret`])) {
          issues.push(`${platform} API credentials are missing`);
        }
      }
    }
    
    if (issues.length === 0) {
      logger.info('✅ All components are in place!');
      logger.info('🎯 Next steps:');
      logger.info('1. Configure platform credentials');
      logger.info('2. Test with real API credentials');
      logger.info('3. Enable auto-posting for production');
    } else {
      logger.info('❌ Issues found:');
      issues.forEach((issue, index) => {
        logger.info(`${index + 1}. ${issue}`);
      });
      
      logger.info('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        logger.info(`${index + 1}. ${rec}`);
      });
    }
    
  } catch (error) {
    logger.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    logger.info('\n✅ Test completed!');
  }
}

testAutoPosting();
