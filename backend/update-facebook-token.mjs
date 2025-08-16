import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

async function updateFacebookToken() {
  console.log('🔑 Facebook Token Update Tool');
  console.log('=============================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current Facebook Configuration:');
    console.log(`App ID: ${settings.facebookAppId}`);
    console.log(`Page ID: ${settings.facebookPageId}`);
    console.log(`Token Set: ${settings.facebookPageAccessToken ? 'Yes' : 'No'}`);
    console.log(`Enabled: ${settings.facebookEnabled}\n`);
    
    // Instructions for getting new token
    console.log('📝 To get a new Facebook token:');
    console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
    console.log('2. Select your app: 2017594075645280');
    console.log('3. Add permissions: pages_manage_posts, pages_read_engagement');
    console.log('4. Click "Generate Access Token"');
    console.log('5. Copy the token\n');
    
    // Get new token from user
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const newToken = await new Promise((resolve) => {
      rl.question('🔑 Enter your new Facebook Page Access Token: ', (token) => {
        resolve(token.trim());
      });
    });
    
    if (!newToken) {
      console.log('❌ No token provided');
      return;
    }
    
    // Test the new token
    console.log('\n🧪 Testing new token...');
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
      const tokenInfoResponse = await axios.get(`https://graph.facebook.com/v18.0/debug_token`, {
        params: {
          input_token: newToken,
          access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
        }
      });
      
      const tokenInfo = tokenInfoResponse.data.data;
      console.log(`Token Type: ${tokenInfo.type}`);
      console.log(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
      
      // Update the token in database
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newToken
      });
      
      console.log('\n✅ Token updated successfully in database!');
      
      // Set up automatic refresh
      console.log('\n🔄 Setting up automatic token refresh...');
      console.log('💡 Run this command to start the token manager:');
      console.log('   node facebook-token-manager.mjs');
      console.log('\n📋 The token manager will:');
      console.log('   • Check token every 24 hours');
      console.log('   • Auto-refresh when ≤10 days left');
      console.log('   • Never let your token expire again!');
      
    } catch (error) {
      console.log('❌ Token test failed:', error.response?.data?.error?.message || error.message);
      console.log('💡 Make sure you have the correct permissions and the token is valid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the update
updateFacebookToken();
