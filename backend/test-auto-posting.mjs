#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import News from './models/News.mjs';
import SocialMediaService from './services/socialMediaService.mjs';

dotenv.config();

async function testAutoPosting() {
  console.log('🚀 Testing Auto-Posting Functionality...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Check Settings
    console.log('\n📋 Test 1: Social Media Settings');
    const settings = await Settings.getCategorySettings('social-media');
    console.log('- Auto Post Enabled:', settings.autoPostEnabled);
    console.log('- Social Links Count:', settings.socialLinks?.length || 0);
    console.log('- Facebook Enabled:', settings.facebookEnabled);
    console.log('- Twitter Enabled:', settings.twitterEnabled);
    console.log('- Instagram Enabled:', settings.instagramEnabled);
    console.log('- Threads Enabled:', settings.threadsEnabled);
    
    // Test 2: Check Platform Configurations
    console.log('\n📱 Test 2: Platform Configurations');
    const platforms = ['facebook', 'twitter', 'instagram', 'threads'];
    
    for (const platform of platforms) {
      const enabled = settings[`${platform}Enabled`];
      const hasAppId = !!settings[`${platform}AppId`];
      const hasAccessToken = !!settings[`${platform}AccessToken`];
      const hasApiKey = !!settings[`${platform}ApiKey`];
      const hasApiSecret = !!settings[`${platform}ApiSecret`];
      
      console.log(`\n${platform.toUpperCase()}:`);
      console.log(`  - Enabled: ${enabled ? '✅' : '❌'}`);
      console.log(`  - App ID: ${hasAppId ? '✅' : '❌'}`);
      console.log(`  - Access Token: ${hasAccessToken ? '✅' : '❌'}`);
      console.log(`  - API Key: ${hasApiKey ? '✅' : '❌'}`);
      console.log(`  - API Secret: ${hasApiSecret ? '✅' : '❌'}`);
      
      if (enabled && (!hasAppId || !hasAccessToken)) {
        console.log(`  ⚠️  ${platform} is enabled but missing credentials`);
      }
    }
    
    // Test 3: Test Content Generation
    console.log('\n📝 Test 3: Content Generation');
    const testArticle = {
      title: { en: 'Test Article: Auto-Posting Test' },
      description: { en: 'This is a test article to verify auto-posting functionality.' },
      slug: 'test-auto-posting-article',
      category: { name: { en: 'Technology' } }
    };
    
    for (const platform of platforms) {
      const content = SocialMediaService.generatePostContent(testArticle, platform);
      console.log(`${platform.toUpperCase()}: ${content.length} chars`);
      console.log(`  Preview: ${content.substring(0, 80)}...`);
    }
    
    // Test 4: Test Auto-Posting Service
    console.log('\n🚀 Test 4: Auto-Posting Service');
    const result = await SocialMediaService.autoPostContent(testArticle, { _id: 'test-user' });
    
    console.log('Auto-posting result:');
    console.log('- Success:', result.success);
    console.log('- Total Platforms:', result.totalPlatforms);
    console.log('- Successful Posts:', result.successfulPosts);
    console.log('- Results:', result.results?.map(r => `${r.platform}: ${r.success ? '✅' : '❌'} - ${r.message}`));
    
    // Test 5: Check for Published Articles
    console.log('\n📰 Test 5: Published Articles');
    const publishedArticle = await News.findOne({ status: 'published' })
      .populate('category', 'name')
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (publishedArticle) {
      console.log('Found published article:', publishedArticle.title.en);
      console.log('- Status:', publishedArticle.status);
      console.log('- Category:', publishedArticle.category?.name?.en);
      console.log('- Author:', publishedArticle.author?.username);
      
      if (settings.autoPostEnabled) {
        console.log('✅ This article would trigger auto-posting');
      } else {
        console.log('❌ Auto-posting is disabled');
      }
    } else {
      console.log('⚠️  No published articles found');
    }
    
    // Test 6: Check Integration
    console.log('\n🔗 Test 6: Integration Check');
    const fs = await import('fs');
    const newsControllerPath = './controllers/newsController.mjs';
    
    if (fs.existsSync(newsControllerPath)) {
      const content = fs.readFileSync(newsControllerPath, 'utf8');
      
      const hasAutoPostImport = content.includes('socialMediaService');
      const hasAutoPostCall = content.includes('autoPostContent');
      const hasStatusCheck = content.includes('status === \'published\'');
      
      console.log('News Controller Integration:');
      console.log(`- Social Media Service Import: ${hasAutoPostImport ? '✅' : '❌'}`);
      console.log(`- Auto-Post Call: ${hasAutoPostCall ? '✅' : '❌'}`);
      console.log(`- Status Check: ${hasStatusCheck ? '✅' : '❌'}`);
    }
    
    // Generate Summary
    console.log('\n📊 SUMMARY');
    console.log('=' .repeat(40));
    
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
      console.log('✅ All components are in place!');
      console.log('🎯 Next steps:');
      console.log('1. Configure platform credentials');
      console.log('2. Test with real API credentials');
      console.log('3. Enable auto-posting for production');
    } else {
      console.log('❌ Issues found:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test completed!');
  }
}

testAutoPosting();
