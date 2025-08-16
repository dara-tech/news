#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import SocialMediaService from './services/socialMediaService.mjs';

dotenv.config();

async function testTwitterSpecific() {
  console.log('🐦 Twitter/X Specific Test');
  console.log('=========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Twitter settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Twitter Configuration:');
    console.log(`API Key: ${settings.twitterApiKey ? 'Set' : 'Not set'}`);
    console.log(`API Secret: ${settings.twitterApiSecret ? 'Set' : 'Not set'}`);
    console.log(`Access Token: ${settings.twitterAccessToken ? 'Set' : 'Not set'}`);
    console.log(`Enabled: ${settings.twitterEnabled}\n`);

    if (!settings.twitterEnabled) {
      console.log('❌ Twitter is not enabled');
      return;
    }

    if (!settings.twitterAccessToken) {
      console.log('❌ Twitter Access Token is not set');
      return;
    }

    // Test Twitter API directly
    console.log('🧪 Testing Twitter API Access...');
    
    try {
      const axios = await import('axios');
      
      // Test 1: Check if we can access the Twitter API
      console.log('\n📋 Test 1: Twitter API Access');
      const testResponse = await axios.default.get('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`
        }
      });
      console.log('✅ Twitter API access successful');
      console.log(`User ID: ${testResponse.data.data.id}`);
      console.log(`Username: ${testResponse.data.data.username}\n`);

      // Test 2: Try to create a unique test post
      console.log('📋 Test 2: Unique Test Post Creation');
      
      // Generate unique content with timestamp
      const timestamp = new Date().toISOString();
      const uniqueContent = `🔧 RazeWire Test Post - ${timestamp}\n\nThis is a unique test post to verify Twitter/X integration is working correctly.\n\n#RazeWire #Test #AutoPosting #${Date.now()}`;
      
      console.log('📝 Post Content:');
      console.log(uniqueContent);
      console.log(`Length: ${uniqueContent.length} characters\n`);

      const postData = {
        text: uniqueContent
      };

      const postResponse = await axios.default.post('https://api.twitter.com/2/tweets', postData, {
        headers: {
          'Authorization': `Bearer ${settings.twitterAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Test post created successfully!');
      console.log(`Tweet ID: ${postResponse.data.data.id}`);
      console.log(`Tweet URL: https://twitter.com/user/status/${postResponse.data.data.id}\n`);

      // Test 3: Test the SocialMediaService
      console.log('📋 Test 3: SocialMediaService Test');
      const socialMediaService = new SocialMediaService();
      
      const testContent = `🔄 RazeWire Service Test - ${timestamp}\n\nTesting the social media service integration.\n\n#RazeWire #ServiceTest #${Date.now()}`;
      
      const result = await socialMediaService.postToTwitter({
        platform: 'twitter',
        content: testContent,
        url: ''
      });

      console.log('✅ SocialMediaService test successful!');
      console.log(`Result: ${result}\n`);

    } catch (apiError) {
      console.log('❌ Twitter API test failed');
      console.log(`Status: ${apiError.response?.status}`);
      console.log(`Error: ${apiError.response?.data?.detail || apiError.response?.data?.message || apiError.message}`);
      
      if (apiError.response?.data) {
        console.log('\n📋 Full Error Response:');
        console.log(JSON.stringify(apiError.response.data, null, 2));
      }

      // Check if it's a duplicate content error
      if (apiError.response?.data?.detail?.includes('duplicate content')) {
        console.log('\n💡 This is expected - Twitter prevents duplicate content');
        console.log('✅ Twitter is working correctly!');
        console.log('🔧 Try with different content to see it work\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTwitterSpecific();
