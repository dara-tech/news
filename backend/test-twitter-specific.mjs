#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import SocialMediaService from './services/socialMediaService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testTwitterSpecific() {
  logger.info('🐦 Twitter/X Specific Test');
  logger.info('=========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get Twitter settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Twitter Configuration:');
    logger.info(`API Key: ${settings.twitterApiKey ? 'Set' : 'Not set'}`);
    logger.info(`API Secret: ${settings.twitterApiSecret ? 'Set' : 'Not set'}`);
    logger.info(`Access Token: ${settings.twitterAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`Enabled: ${settings.twitterEnabled}\n`);

    if (!settings.twitterEnabled) {
      logger.info('❌ Twitter is not enabled');
      return;
    }

    if (!settings.twitterAccessToken) {
      logger.info('❌ Twitter Access Token is not set');
      return;
    }

    // Test Twitter API directly
    logger.info('🧪 Testing Twitter API Access...');
    
    try {
      const axios = await import('axios');
      
      // Test 1: Check if we can access the Twitter API
      logger.info('\n📋 Test 1: Twitter API Access');
      const testResponse = await axios.default.get('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`
        }
      });
      logger.info('✅ Twitter API access successful');
      logger.info(`User ID: ${testResponse.data.data.id}`);
      logger.info(`Username: ${testResponse.data.data.username}\n`);

      // Test 2: Try to create a unique test post
      logger.info('📋 Test 2: Unique Test Post Creation');
      
      // Generate unique content with timestamp
      const timestamp = new Date().toISOString();
      const uniqueContent = `🔧 RazeWire Test Post - ${timestamp}\n\nThis is a unique test post to verify Twitter/X integration is working correctly.\n\n#RazeWire #Test #AutoPosting #${Date.now()}`;
      
      logger.info('📝 Post Content:');
      logger.info(uniqueContent);
      logger.info(`Length: ${uniqueContent.length} characters\n`);

      const postData = {
        text: uniqueContent
      };

      const postResponse = await axios.default.post('https://api.twitter.com/2/tweets', postData, {
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('✅ Test post created successfully!');
      logger.info(`Tweet ID: ${postResponse.data.data.id}`);
      logger.info(`Tweet URL: https://twitter.com/user/status/${postResponse.data.data.id}\n`);

      // Test 3: Test the SocialMediaService
      logger.info('📋 Test 3: SocialMediaService Test');
      const socialMediaService = new SocialMediaService();
      
      const testContent = `🔄 RazeWire Service Test - ${timestamp}\n\nTesting the social media service integration.\n\n#RazeWire #ServiceTest #${Date.now()}`;
      
      const result = await socialMediaService.postToTwitter({
        platform: 'twitter',
        content: testContent,
        url: ''
      });

      logger.info('✅ SocialMediaService test successful!');
      logger.info(`Result: ${result}\n`);

    } catch (apiError) {
      logger.info('❌ Twitter API test failed');
      logger.info(`Status: ${apiError.response?.status}`);
      logger.info(`Error: ${apiError.response?.data?.detail || apiError.response?.data?.message || apiError.message}`);
      
      if (apiError.response?.data) {
        logger.info('\n📋 Full Error Response:');
        logger.info(JSON.stringify(apiError.response.data, null, 2));
      }

      // Check if it's a duplicate content error
      if (apiError.response?.data?.detail?.includes('duplicate content')) {
        logger.info('\n💡 This is expected - Twitter prevents duplicate content');
        logger.info('✅ Twitter is working correctly!');
        logger.info('🔧 Try with different content to see it work\n');
      }
    }

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTwitterSpecific();
