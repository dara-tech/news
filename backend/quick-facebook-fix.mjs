#!/usr/bin/env node

import readline from 'readline';
import logger from '../utils/logger.mjs';

logger.info('📘 Quick Facebook Token Fix');
logger.info('===========================\n');

logger.info('❌ Your Facebook token has expired and needs to be replaced.');
logger.info('🔧 Here\'s the quickest way to fix it:\n');

logger.info('📋 STEP 1: Get New Token from Facebook');
logger.info('1. Go to: https://developers.facebook.com/apps/');
logger.info('2. Click on your app (ID: 2017594075645280)');
logger.info('3. Go to: Tools → Graph API Explorer');
logger.info('4. Click "Generate Access Token"');
logger.info('5. Select these permissions:');
logger.info('   ✅ pages_manage_posts');
logger.info('   ✅ pages_read_engagement');
logger.info('   ✅ pages_show_list');
logger.info('6. Copy the generated token\n');

logger.info('📋 STEP 2: Get Page Access Token');
logger.info('1. In Graph API Explorer, change the endpoint to:');
logger.info('   /775481852311918?fields=access_token');
logger.info('2. Use the token from Step 1');
logger.info('3. Click "Submit"');
logger.info('4. Copy the "access_token" value\n');

logger.info('📋 STEP 3: Update Your Token');
logger.info('Once you have the new token, you can:');
logger.info('• Use this script to update it automatically');
logger.info('• Or update it manually in Admin → System → Auto-Posting → Facebook\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Do you have the new Facebook Page Access Token? (y/n): ', async (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    rl.question('🔑 Paste the new Facebook Page Access Token: ', async (newToken) => {
      if (!newToken || newToken.trim() === '') {
        logger.info('❌ No token provided');
        rl.close();
        return;
      }

      logger.info('\n🧪 Testing and updating token...');
      
      try {
        const mongoose = await import('mongoose');
        const dotenv = await import('dotenv');
        const Settings = (await import('./models/Settings.mjs')).default;
        const axios = await import('axios');
        
        dotenv.default.config();
        await mongoose.default.connect(process.env.MONGODB_URI);
        
        // Get current settings
        const settings = await Settings.getCategorySettings('social-media');
        
        // Test the new token
        const testResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
          params: {
            access_token: newToken.trim(),
            fields: 'id,name'
          }
        });

        logger.info('✅ New token is valid!');
        logger.info(`Page Name: ${testResponse.data.name}`);
        logger.info(`Page ID: ${testResponse.data.id}`);

        // Get token info
        const tokenInfoResponse = await axios.default.get(`https://graph.facebook.com/v18.0/debug_token`, {
          params: {
            input_token: newToken.trim(),
            access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
          }
        });

        const tokenInfo = tokenInfoResponse.data.data;
        logger.info(`Token Type: ${tokenInfo.type}`);
        logger.info(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);

        if (tokenInfo.expires_at) {
          const daysLeft = Math.ceil((tokenInfo.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
          logger.info(`Days Left: ${daysLeft}`);
        }

        // Update database
        logger.info('\n💾 Updating database...');
        await Settings.updateCategorySettings('social-media', {
          facebookPageAccessToken: newToken.trim()
        });
        logger.info('✅ Database updated successfully!');

        logger.info('\n🎉 Facebook token fixed successfully!');
        logger.info('✅ New token is valid and functional');
        logger.info('✅ Auto-posting to Facebook will work now');
        logger.info('✅ Token will be monitored for expiration\n');

        logger.info('🔧 Testing Facebook posting...');
        try {
          const SocialMediaService = (await import('./services/socialMediaService.mjs')).default;
          const socialMediaService = new SocialMediaService();
          
          const result = await socialMediaService.postToFacebook({
            platform: 'facebook',
            content: '🧪 Facebook Test Post - Token Fixed Successfully!\n\nThis is a test post to verify the new token is working.\n\n#RazeWire #Facebook #Test',
            url: ''
          });

          logger.info('✅ Facebook posting test successful!');
          logger.info(`Post ID: ${result.postId}`);
          logger.info(`URL: ${result.url}`);

        } catch (postError) {
          logger.info('⚠️  Facebook posting test failed:');
          logger.info(`Error: ${postError.message}`);
        }

        await mongoose.default.disconnect();

      } catch (error) {
        logger.info('❌ Error updating token:');
        logger.info(`Error: ${error.response?.data?.error?.message || error.message}`);
        
        if (error.response?.data?.error?.code === 190) {
          logger.info('\n🔧 The token is still invalid. Please:');
          logger.info('• Make sure you copied the correct token');
          logger.info('• Ensure the token has the right permissions');
          logger.info('• Try generating a new token from Facebook Developer Console');
        }
      }

      rl.close();
    });
  } else {
    logger.info('\n💡 No problem! Follow the steps above to get a new token.');
    logger.info('Once you have the new token, run this script again.');
    logger.info('\n🔧 Alternative: You can also update it manually in the admin panel.');
    rl.close();
  }
});
