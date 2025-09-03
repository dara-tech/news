#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import readline from 'readline';
import logger from '../utils/logger.mjs';

dotenv.config();

async function getNewFacebookToken() {
  logger.info('📘 Facebook Token Renewal Guide');
  logger.info('===============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get current Facebook settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Current Facebook Configuration:');
    logger.info(`App ID: ${settings.facebookAppId || 'Not set'}`);
    logger.info(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}`);
    logger.info(`Page ID: ${settings.facebookPageId || 'Not set'}`);
    logger.info(`Page Access Token: ${settings.facebookPageAccessToken ? 'Set (Expired)' : 'Not set'}\n`);

    logger.info('❌ Your Facebook token has expired and cannot be refreshed automatically.');
    logger.info('🔧 Here\'s how to get a new token:\n');

    logger.info('📋 STEP 1: Go to Facebook Developer Console');
    logger.info('URL: https://developers.facebook.com/apps/\n');

    logger.info('📋 STEP 2: Select Your App');
    logger.info(`App ID: ${settings.facebookAppId || 'Your App ID'}`);
    logger.info('App Name: Your Facebook App\n');

    logger.info('📋 STEP 3: Access Graph API Explorer');
    logger.info('1. In your app dashboard, click "Tools" in the left sidebar');
    logger.info('2. Click "Graph API Explorer"\n');

    logger.info('📋 STEP 4: Generate Page Access Token');
    logger.info('1. In Graph API Explorer, select your app from the dropdown');
    logger.info('2. Click "Generate Access Token"');
    logger.info('3. Grant the necessary permissions:');
    logger.info('   ✅ pages_manage_posts');
    logger.info('   ✅ pages_read_engagement');
    logger.info('   ✅ pages_show_list');
    logger.info('4. Copy the generated token\n');

    logger.info('📋 STEP 5: Get Page Access Token');
    logger.info('1. In the Graph API Explorer, change the endpoint to:');
    logger.info(`   /${settings.facebookPageId}?fields=access_token`);
    logger.info('2. Use the token from Step 4');
    logger.info('3. Click "Submit"');
    logger.info('4. Copy the "access_token" value from the response\n');

    logger.info('📋 STEP 6: Update Your Settings');
    logger.info('1. Go to: Admin → System → Auto-Posting → Facebook');
    logger.info('2. Paste the new Page Access Token');
    logger.info('3. Save the settings');
    logger.info('4. Test the connection\n');

    logger.info('💡 Alternative: Use the Quick Update Script');
    logger.info('If you have the new token ready, you can use:');
    logger.info('node update-facebook-token.mjs\n');

    // Ask if user wants to update token now
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🔑 Do you have a new Facebook Page Access Token? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('🔑 Enter the new Facebook Page Access Token: ', async (newToken) => {
          if (!newToken || newToken.trim() === '') {
            logger.info('❌ No token provided');
            rl.close();
            return;
          }

          logger.info('\n🧪 Testing new token...');
          try {
            const axios = await import('axios');
            
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

            // Update database
            logger.info('\n💾 Updating database...');
            await Settings.updateCategorySettings('social-media', {
              facebookPageAccessToken: newToken.trim()
            });
            logger.info('✅ Database updated successfully!');

            logger.info('\n🎉 Facebook token updated successfully!');
            logger.info('✅ New token is valid and functional');
            logger.info('✅ Auto-posting should work now');
            logger.info('✅ Token will be monitored for expiration\n');

            logger.info('🔧 Next Steps:');
            logger.info('1. Test auto-posting: node test-auto-posting.mjs');
            logger.info('2. Enable token monitoring in the admin panel');
            logger.info('3. Set up automatic token refresh to prevent future expirations');

          } catch (error) {
            logger.info('❌ Token test failed:');
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
        logger.info('Once you have the new token, you can:');
        logger.info('• Use this script again');
        logger.info('• Use: node update-facebook-token.mjs');
        logger.info('• Update it manually in the admin panel');
        rl.close();
      }
    });

  } catch (error) {
    logger.error('❌ Error:', error.message);
  }
}

getNewFacebookToken();
