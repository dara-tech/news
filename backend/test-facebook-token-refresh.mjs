#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testFacebookTokenRefresh() {
  logger.info('📘 Facebook Token Refresh Test');
  logger.info('==============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get Facebook settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Facebook Configuration:');
    logger.info(`Enabled: ${settings.facebookEnabled ? '✅' : '❌'}`);
    logger.info(`App ID: ${settings.facebookAppId || 'Not set'}`);
    logger.info(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}`);
    logger.info(`Page ID: ${settings.facebookPageId || 'Not set'}`);
    logger.info(`Page Access Token: ${settings.facebookPageAccessToken ? 'Set' : 'Not set'}\n`);

    if (!settings.facebookEnabled || !settings.facebookPageAccessToken) {
      logger.info('❌ Facebook not configured properly');
      return;
    }

    // Test current token
    logger.info('🧪 Testing Current Token...');
    try {
      const axios = await import('axios');
      
      // Test 1: Check if current token is valid
      const testResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: settings.facebookPageAccessToken,
          fields: 'id,name'
        }
      });
      logger.info('✅ Current token is valid');
      logger.info(`Page Name: ${testResponse.data.name}`);
      logger.info(`Page ID: ${testResponse.data.id}\n`);

      // Test 2: Get token info
      const tokenInfoResponse = await axios.default.get(`https://graph.facebook.com/v18.0/debug_token`, {
        params: {
          input_token: settings.facebookPageAccessToken,
          access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
        }
      });

      const tokenInfo = tokenInfoResponse.data.data;
      logger.info('📋 Token Information:');
      logger.info(`Type: ${tokenInfo.type}`);
      logger.info(`App ID: ${tokenInfo.app_id}`);
      logger.info(`User ID: ${tokenInfo.user_id}`);
      logger.info(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
      
      if (tokenInfo.expires_at) {
        const daysLeft = Math.ceil((tokenInfo.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        logger.info(`Days Left: ${daysLeft}`);
      }
      logger.info('');

      // Test 3: Try to refresh the token
      logger.info('🔄 Testing Token Refresh...');
      
      // Step 1: Get long-lived user token
      logger.info('Step 1: Getting long-lived user token...');
      const userTokenResponse = await axios.default.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: settings.facebookAppId,
          client_secret: settings.facebookAppSecret,
          fb_exchange_token: settings.facebookPageAccessToken
        }
      });
      
      logger.info('✅ Long-lived user token obtained');
      const longLivedUserToken = userTokenResponse.data.access_token;
      logger.info(`Expires In: ${userTokenResponse.data.expires_in} seconds\n`);
      
      // Step 2: Get page access token
      logger.info('Step 2: Getting page access token...');
      const pageTokenResponse = await axios.default.get(`https://graph.facebook.com/v18.0/${settings.facebookPageId}`, {
        params: {
          fields: 'access_token',
          access_token: longLivedUserToken
        }
      });
      
      logger.info('✅ Page access token obtained');
      const pageToken = pageTokenResponse.data.access_token;
      
      // Step 3: Get long-lived page token
      logger.info('Step 3: Getting long-lived page token...');
      const longLivedPageResponse = await axios.default.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: settings.facebookAppId,
          client_secret: settings.facebookAppSecret,
          fb_exchange_token: pageToken
        }
      });
      
      logger.info('✅ Long-lived page token obtained');
      const newLongLivedToken = longLivedPageResponse.data.access_token;
      logger.info(`New Token: ${newLongLivedToken.substring(0, 20)}...`);
      logger.info(`Expires In: ${longLivedPageResponse.data.expires_in} seconds\n`);
      
      // Test 4: Verify new token works
      logger.info('🧪 Verifying New Token...');
      const newTokenTestResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: newLongLivedToken,
          fields: 'id,name'
        }
      });
      
      logger.info('✅ New token is valid');
      logger.info(`Page Name: ${newTokenTestResponse.data.name}`);
      logger.info(`Page ID: ${newTokenTestResponse.data.id}\n`);
      
      // Test 5: Update database
      logger.info('💾 Updating Database...');
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newLongLivedToken
      });
      logger.info('✅ Database updated successfully\n');
      
      logger.info('🎉 Facebook Token Refresh Test Completed Successfully!');
      logger.info('✅ Token refresh process works correctly');
      logger.info('✅ New token is valid and functional');
      logger.info('✅ Database has been updated\n');

    } catch (error) {
      logger.info('❌ Facebook token test failed');
      logger.info(`Status: ${error.response?.status}`);
      logger.info(`Error: ${error.response?.data?.error?.message || error.message}`);
      
      if (error.response?.data) {
        logger.info('\n📋 Full Error Response:');
        logger.info(JSON.stringify(error.response.data, null, 2));
      }

      // Provide specific troubleshooting steps
      logger.info('\n🔧 Troubleshooting Steps:');
      if (error.response?.data?.error?.code === 190) {
        logger.info('• Token is expired or invalid');
        logger.info('• Get a new token from Facebook Developer Console');
        logger.info('• Run: node update-facebook-token.mjs');
      } else if (error.response?.data?.error?.code === 104) {
        logger.info('• App ID or App Secret is incorrect');
        logger.info('• Check your Facebook app settings');
      } else if (error.response?.data?.error?.code === 100) {
        logger.info('• Invalid parameter');
        logger.info('• Check Page ID and other settings');
      }
    }

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFacebookTokenRefresh();
