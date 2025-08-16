import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

async function fixFacebookToken() {
  console.log('🔑 Facebook Token Fix Tool');
  console.log('==========================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // The correct token (removing any duplicates)
    const newToken = 'EAAcqZCbouBWABPHNUc6Pbeu67iKDfiruI0UQ6peYZAWOMIL5DgqctNzBiE4dvFKhQekz9UoABoy9ZCsghi2j9BmIxeCpc14SFt3ppgreNQuY384FTaXqLCUAqZATyiYUmRWkV2kXwQkZA5tKZAB5v25PZBcTFkaiyf9UniJceuCxRieKwkpnpjTtb3apuEkA0B2E8oWgYz6p0mq2Kk0l2z3oYNTS6U9vZASjBswXUQYZD';
    
    console.log('🔑 Using the provided token...');
    console.log(`Token length: ${newToken.length} characters`);
    console.log(`Token starts with: ${newToken.substring(0, 10)}...`);
    console.log(`Token ends with: ...${newToken.substring(newToken.length - 10)}\n`);
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current Configuration:');
    console.log(`App ID: ${settings.facebookAppId}`);
    console.log(`Page ID: ${settings.facebookPageId}`);
    console.log(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}\n`);
    
    // Test the token
    console.log('🧪 Testing token...');
    try {
      const testResponse = await axios.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: newToken,
          fields: 'id,name'
        }
      });
      
      console.log('✅ Token is valid!');
      console.log(`Page Name: ${testResponse.data.name}`);
      console.log(`Page ID: ${testResponse.data.id}`);
      
      // Get token info
      if (settings.facebookAppId && settings.facebookAppSecret) {
        try {
          const tokenInfoResponse = await axios.get(`https://graph.facebook.com/v18.0/debug_token`, {
            params: {
              input_token: newToken,
              access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
            }
          });
          
          const tokenInfo = tokenInfoResponse.data.data;
          console.log(`Token Type: ${tokenInfo.type}`);
          console.log(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
          console.log(`Permissions: ${tokenInfo.scopes?.join(', ') || 'None'}`);
        } catch (debugError) {
          console.log('⚠️ Could not get detailed token info (App Secret might be missing)');
        }
      }
      
      // Update the token in database
      console.log('\n💾 Updating token in database...');
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newToken
      });
      
      console.log('✅ Token updated successfully in database!');
      
      // Test auto-posting
      console.log('\n🧪 Testing auto-posting...');
      const socialMediaService = (await import('./services/socialMediaService.mjs')).default;
      const testArticle = {
        title: { en: 'Test: Facebook Token Fixed' },
        description: { en: 'This is a test to verify the Facebook token is working correctly.' },
        slug: 'test-facebook-token-fix',
        category: { name: { en: 'Test' } }
      };
      
      const result = await socialMediaService.autoPostContent(testArticle, { _id: 'test-user' });
      
      console.log('\n📊 Auto-posting test results:');
      console.log(`Success: ${result.success}`);
      console.log(`Total Platforms: ${result.totalPlatforms}`);
      console.log(`Successful Posts: ${result.successfulPosts}`);
      
      if (result.results) {
        result.results.forEach(r => {
          console.log(`- ${r.platform}: ${r.success ? '✅' : '❌'} - ${r.message}`);
        });
      }
      
      // Set up prevention
      console.log('\n🛡️ Setting up token prevention...');
      console.log('💡 To prevent future expiration, run:');
      console.log('   node facebook-token-manager.mjs');
      console.log('\n📋 This will:');
      console.log('   • Check token every 24 hours');
      console.log('   • Auto-refresh when ≤10 days left');
      console.log('   • Never let your token expire again!');
      
    } catch (error) {
      console.log('❌ Token test failed:', error.response?.data?.error?.message || error.message);
      console.log('💡 The token might be:');
      console.log('   • A user token instead of page token');
      console.log('   • Missing required permissions');
      console.log('   • Expired or invalid');
      
      if (error.response?.data?.error?.code === 190) {
        console.log('\n🔧 To fix this:');
        console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
        console.log('2. Select your app: 2017594075645280');
        console.log('3. Add permissions: pages_manage_posts, pages_read_engagement');
        console.log('4. Generate token');
        console.log('5. Get page token from: /775481852311918?fields=access_token');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixFacebookToken();
