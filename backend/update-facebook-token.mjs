import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import logger from '../utils/logger.mjs';

dotenv.config();

async function updateFacebookToken() {
  logger.info('🔑 Facebook Token Update Tool');
  logger.info('=============================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current Facebook Configuration:');
    logger.info(`App ID: ${settings.facebookAppId}`);
    logger.info(`Page ID: ${settings.facebookPageId}`);
    logger.info(`Token Set: ${settings.facebookPageAccessToken ? 'Yes' : 'No'}`);
    logger.info(`Enabled: ${settings.facebookEnabled}\n`);
    
    // Instructions for getting new token
    logger.info('📝 To get a new Facebook token:');
    logger.info('1. Go to: https://developers.facebook.com/tools/explorer/');
    logger.info('2. Select your app: 2017594075645280');
    logger.info('3. Add permissions: pages_manage_posts, pages_read_engagement');
    logger.info('4. Click "Generate Access Token"');
    logger.info('5. Copy the token\n');
    
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
      logger.info('❌ No token provided');
      return;
    }
    
    // Test the new token
    logger.info('\n🧪 Testing new token...');
    try {
      const testResponse = await axios.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: newToken,
          fields: 'id,name'
        }
      });
      
      logger.info('✅ Token is valid!');
      logger.info(`Page Name: ${testResponse.data.name}`);
      logger.info(`Page ID: ${testResponse.data.id}`);
      
      // Get token info
      const tokenInfoResponse = await axios.get(`https://graph.facebook.com/v18.0/debug_token`, {
        params: {
          input_token: newToken,
          access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
        }
      });
      
      const tokenInfo = tokenInfoResponse.data.data;
      logger.info(`Token Type: ${tokenInfo.type}`);
      logger.info(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
      
      // Update the token in database
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newToken
      });
      
      logger.info('\n✅ Token updated successfully in database!');
      
      // Set up automatic refresh
      logger.info('\n🔄 Setting up automatic token refresh...');
      logger.info('💡 Run this command to start the token manager:');
      logger.info('   node facebook-token-manager.mjs');
      logger.info('\n📋 The token manager will:');
      logger.info('   • Check token every 24 hours');
      logger.info('   • Auto-refresh when ≤10 days left');
      logger.info('   • Never let your token expire again!');
      
    } catch (error) {
      logger.info('❌ Token test failed:', error.response?.data?.error?.message || error.message);
      logger.info('💡 Make sure you have the correct permissions and the token is valid');
    }
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the update
updateFacebookToken();
