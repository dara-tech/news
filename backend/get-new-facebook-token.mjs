#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import readline from 'readline';

dotenv.config();

async function getNewFacebookToken() {
  console.log('📘 Facebook Token Renewal Guide');
  console.log('===============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get current Facebook settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Current Facebook Configuration:');
    console.log(`App ID: ${settings.facebookAppId || 'Not set'}`);
    console.log(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}`);
    console.log(`Page ID: ${settings.facebookPageId || 'Not set'}`);
    console.log(`Page Access Token: ${settings.facebookPageAccessToken ? 'Set (Expired)' : 'Not set'}\n`);

    console.log('❌ Your Facebook token has expired and cannot be refreshed automatically.');
    console.log('🔧 Here\'s how to get a new token:\n');

    console.log('📋 STEP 1: Go to Facebook Developer Console');
    console.log('URL: https://developers.facebook.com/apps/\n');

    console.log('📋 STEP 2: Select Your App');
    console.log(`App ID: ${settings.facebookAppId || 'Your App ID'}`);
    console.log('App Name: Your Facebook App\n');

    console.log('📋 STEP 3: Access Graph API Explorer');
    console.log('1. In your app dashboard, click "Tools" in the left sidebar');
    console.log('2. Click "Graph API Explorer"\n');

    console.log('📋 STEP 4: Generate Page Access Token');
    console.log('1. In Graph API Explorer, select your app from the dropdown');
    console.log('2. Click "Generate Access Token"');
    console.log('3. Grant the necessary permissions:');
    console.log('   ✅ pages_manage_posts');
    console.log('   ✅ pages_read_engagement');
    console.log('   ✅ pages_show_list');
    console.log('4. Copy the generated token\n');

    console.log('📋 STEP 5: Get Page Access Token');
    console.log('1. In the Graph API Explorer, change the endpoint to:');
    console.log(`   /${settings.facebookPageId}?fields=access_token`);
    console.log('2. Use the token from Step 4');
    console.log('3. Click "Submit"');
    console.log('4. Copy the "access_token" value from the response\n');

    console.log('📋 STEP 6: Update Your Settings');
    console.log('1. Go to: Admin → System → Auto-Posting → Facebook');
    console.log('2. Paste the new Page Access Token');
    console.log('3. Save the settings');
    console.log('4. Test the connection\n');

    console.log('💡 Alternative: Use the Quick Update Script');
    console.log('If you have the new token ready, you can use:');
    console.log('node update-facebook-token.mjs\n');

    // Ask if user wants to update token now
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🔑 Do you have a new Facebook Page Access Token? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('🔑 Enter the new Facebook Page Access Token: ', async (newToken) => {
          if (!newToken || newToken.trim() === '') {
            console.log('❌ No token provided');
            rl.close();
            return;
          }

          console.log('\n🧪 Testing new token...');
          try {
            const axios = await import('axios');
            
            // Test the new token
            const testResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
              params: {
                access_token: newToken.trim(),
                fields: 'id,name'
              }
            });

            console.log('✅ New token is valid!');
            console.log(`Page Name: ${testResponse.data.name}`);
            console.log(`Page ID: ${testResponse.data.id}`);

            // Get token info
            const tokenInfoResponse = await axios.default.get(`https://graph.facebook.com/v18.0/debug_token`, {
              params: {
                input_token: newToken.trim(),
                access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
              }
            });

            const tokenInfo = tokenInfoResponse.data.data;
            console.log(`Token Type: ${tokenInfo.type}`);
            console.log(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);

            // Update database
            console.log('\n💾 Updating database...');
            await Settings.updateCategorySettings('social-media', {
              facebookPageAccessToken: newToken.trim()
            });
            console.log('✅ Database updated successfully!');

            console.log('\n🎉 Facebook token updated successfully!');
            console.log('✅ New token is valid and functional');
            console.log('✅ Auto-posting should work now');
            console.log('✅ Token will be monitored for expiration\n');

            console.log('🔧 Next Steps:');
            console.log('1. Test auto-posting: node test-auto-posting.mjs');
            console.log('2. Enable token monitoring in the admin panel');
            console.log('3. Set up automatic token refresh to prevent future expirations');

          } catch (error) {
            console.log('❌ Token test failed:');
            console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
            
            if (error.response?.data?.error?.code === 190) {
              console.log('\n🔧 The token is still invalid. Please:');
              console.log('• Make sure you copied the correct token');
              console.log('• Ensure the token has the right permissions');
              console.log('• Try generating a new token from Facebook Developer Console');
            }
          }

          rl.close();
        });
      } else {
        console.log('\n💡 No problem! Follow the steps above to get a new token.');
        console.log('Once you have the new token, you can:');
        console.log('• Use this script again');
        console.log('• Use: node update-facebook-token.mjs');
        console.log('• Update it manually in the admin panel');
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getNewFacebookToken();
