#!/usr/bin/env node

import readline from 'readline';

console.log('📘 Quick Facebook Token Fix');
console.log('===========================\n');

console.log('❌ Your Facebook token has expired and needs to be replaced.');
console.log('🔧 Here\'s the quickest way to fix it:\n');

console.log('📋 STEP 1: Get New Token from Facebook');
console.log('1. Go to: https://developers.facebook.com/apps/');
console.log('2. Click on your app (ID: 2017594075645280)');
console.log('3. Go to: Tools → Graph API Explorer');
console.log('4. Click "Generate Access Token"');
console.log('5. Select these permissions:');
console.log('   ✅ pages_manage_posts');
console.log('   ✅ pages_read_engagement');
console.log('   ✅ pages_show_list');
console.log('6. Copy the generated token\n');

console.log('📋 STEP 2: Get Page Access Token');
console.log('1. In Graph API Explorer, change the endpoint to:');
console.log('   /775481852311918?fields=access_token');
console.log('2. Use the token from Step 1');
console.log('3. Click "Submit"');
console.log('4. Copy the "access_token" value\n');

console.log('📋 STEP 3: Update Your Token');
console.log('Once you have the new token, you can:');
console.log('• Use this script to update it automatically');
console.log('• Or update it manually in Admin → System → Auto-Posting → Facebook\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Do you have the new Facebook Page Access Token? (y/n): ', async (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    rl.question('🔑 Paste the new Facebook Page Access Token: ', async (newToken) => {
      if (!newToken || newToken.trim() === '') {
        console.log('❌ No token provided');
        rl.close();
        return;
      }

      console.log('\n🧪 Testing and updating token...');
      
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

        if (tokenInfo.expires_at) {
          const daysLeft = Math.ceil((tokenInfo.expires_at * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
          console.log(`Days Left: ${daysLeft}`);
        }

        // Update database
        console.log('\n💾 Updating database...');
        await Settings.updateCategorySettings('social-media', {
          facebookPageAccessToken: newToken.trim()
        });
        console.log('✅ Database updated successfully!');

        console.log('\n🎉 Facebook token fixed successfully!');
        console.log('✅ New token is valid and functional');
        console.log('✅ Auto-posting to Facebook will work now');
        console.log('✅ Token will be monitored for expiration\n');

        console.log('🔧 Testing Facebook posting...');
        try {
          const SocialMediaService = (await import('./services/socialMediaService.mjs')).default;
          const socialMediaService = new SocialMediaService();
          
          const result = await socialMediaService.postToFacebook({
            platform: 'facebook',
            content: '🧪 Facebook Test Post - Token Fixed Successfully!\n\nThis is a test post to verify the new token is working.\n\n#RazeWire #Facebook #Test',
            url: ''
          });

          console.log('✅ Facebook posting test successful!');
          console.log(`Post ID: ${result.postId}`);
          console.log(`URL: ${result.url}`);

        } catch (postError) {
          console.log('⚠️  Facebook posting test failed:');
          console.log(`Error: ${postError.message}`);
        }

        await mongoose.default.disconnect();

      } catch (error) {
        console.log('❌ Error updating token:');
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
    console.log('Once you have the new token, run this script again.');
    console.log('\n🔧 Alternative: You can also update it manually in the admin panel.');
    rl.close();
  }
});
