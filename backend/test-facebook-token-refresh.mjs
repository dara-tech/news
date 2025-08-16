#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function testFacebookTokenRefresh() {
  console.log('📘 Facebook Token Refresh Test');
  console.log('==============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Facebook settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Facebook Configuration:');
    console.log(`Enabled: ${settings.facebookEnabled ? '✅' : '❌'}`);
    console.log(`App ID: ${settings.facebookAppId || 'Not set'}`);
    console.log(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}`);
    console.log(`Page ID: ${settings.facebookPageId || 'Not set'}`);
    console.log(`Page Access Token: ${settings.facebookPageAccessToken ? 'Set' : 'Not set'}\n`);

    if (!settings.facebookEnabled || !settings.facebookPageAccessToken) {
      console.log('❌ Facebook not configured properly');
      return;
    }

    // Test current token
    console.log('🧪 Testing Current Token...');
    try {
      const axios = await import('axios');
      
      // Test 1: Check if current token is valid
      const testResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: settings.facebookPageAccessToken,
          fields: 'id,name'
        }
      });
      console.log('✅ Current token is valid');
      console.log(`Page Name: ${testResponse.data.name}`);
      console.log(`Page ID: ${testResponse.data.id}\n`);

      // Test 2: Get token info
      const tokenInfoResponse = await axios.default.get(`https://graph.facebook.com/v18.0/debug_token`, {
        params: {
          input_token: settings.facebookPageAccessToken,
          access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
        }
      });

      const tokenInfo = tokenInfoResponse.data.data;
      console.log('📋 Token Information:');
      console.log(`Type: ${tokenInfo.type}`);
      console.log(`App ID: ${tokenInfo.app_id}`);
      console.log(`User ID: ${tokenInfo.user_id}`);
      console.log(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
      
      if (tokenInfo.expires_at) {
        const daysLeft = Math.ceil((tokenInfo.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(`Days Left: ${daysLeft}`);
      }
      console.log('');

      // Test 3: Try to refresh the token
      console.log('🔄 Testing Token Refresh...');
      
      // Step 1: Get long-lived user token
      console.log('Step 1: Getting long-lived user token...');
      const userTokenResponse = await axios.default.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: settings.facebookAppId,
          client_secret: settings.facebookAppSecret,
          fb_exchange_token: settings.facebookPageAccessToken
        }
      });
      
      console.log('✅ Long-lived user token obtained');
      const longLivedUserToken = userTokenResponse.data.access_token;
      console.log(`Expires In: ${userTokenResponse.data.expires_in} seconds\n`);
      
      // Step 2: Get page access token
      console.log('Step 2: Getting page access token...');
      const pageTokenResponse = await axios.default.get(`https://graph.facebook.com/v18.0/${settings.facebookPageId}`, {
        params: {
          fields: 'access_token',
          access_token: longLivedUserToken
        }
      });
      
      console.log('✅ Page access token obtained');
      const pageToken = pageTokenResponse.data.access_token;
      
      // Step 3: Get long-lived page token
      console.log('Step 3: Getting long-lived page token...');
      const longLivedPageResponse = await axios.default.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: settings.facebookAppId,
          client_secret: settings.facebookAppSecret,
          fb_exchange_token: pageToken
        }
      });
      
      console.log('✅ Long-lived page token obtained');
      const newLongLivedToken = longLivedPageResponse.data.access_token;
      console.log(`New Token: ${newLongLivedToken.substring(0, 20)}...`);
      console.log(`Expires In: ${longLivedPageResponse.data.expires_in} seconds\n`);
      
      // Test 4: Verify new token works
      console.log('🧪 Verifying New Token...');
      const newTokenTestResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: newLongLivedToken,
          fields: 'id,name'
        }
      });
      
      console.log('✅ New token is valid');
      console.log(`Page Name: ${newTokenTestResponse.data.name}`);
      console.log(`Page ID: ${newTokenTestResponse.data.id}\n`);
      
      // Test 5: Update database
      console.log('💾 Updating Database...');
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newLongLivedToken
      });
      console.log('✅ Database updated successfully\n');
      
      console.log('🎉 Facebook Token Refresh Test Completed Successfully!');
      console.log('✅ Token refresh process works correctly');
      console.log('✅ New token is valid and functional');
      console.log('✅ Database has been updated\n');

    } catch (error) {
      console.log('❌ Facebook token test failed');
      console.log(`Status: ${error.response?.status}`);
      console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
      
      if (error.response?.data) {
        console.log('\n📋 Full Error Response:');
        console.log(JSON.stringify(error.response.data, null, 2));
      }

      // Provide specific troubleshooting steps
      console.log('\n🔧 Troubleshooting Steps:');
      if (error.response?.data?.error?.code === 190) {
        console.log('• Token is expired or invalid');
        console.log('• Get a new token from Facebook Developer Console');
        console.log('• Run: node update-facebook-token.mjs');
      } else if (error.response?.data?.error?.code === 104) {
        console.log('• App ID or App Secret is incorrect');
        console.log('• Check your Facebook app settings');
      } else if (error.response?.data?.error?.code === 100) {
        console.log('• Invalid parameter');
        console.log('• Check Page ID and other settings');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFacebookTokenRefresh();
