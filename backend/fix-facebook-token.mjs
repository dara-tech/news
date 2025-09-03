import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import logger from '../utils/logger.mjs';

dotenv.config();

async function fixFacebookToken() {
  logger.info('🔑 Facebook Token Fix Tool');
  logger.info('==========================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // The correct token (removing any duplicates)
    const newToken = 'EAAcqZCbouBWABPHNUc6Pbeu67iKDfiruI0UQ6peYZAWOMIL5DgqctNzBiE4dvFKhQekz9UoABoy9ZCsghi2j9BmIxeCpc14SFt3ppgreNQuY384FTaXqLCUAqZATyiYUmRWkV2kXwQkZA5tKZAB5v25PZBcTFkaiyf9UniJceuCxRieKwkpnpjTtb3apuEkA0B2E8oWgYz6p0mq2Kk0l2z3oYNTS6U9vZASjBswXUQYZD';
    
    logger.info('🔑 Using the provided token...');
    logger.info(`Token length: ${newToken.length} characters`);
    logger.info(`Token starts with: ${newToken.substring(0, 10)}...`);
    logger.info(`Token ends with: ...${newToken.substring(newToken.length - 10)}\n`);
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current Configuration:');
    logger.info(`App ID: ${settings.facebookAppId}`);
    logger.info(`Page ID: ${settings.facebookPageId}`);
    logger.info(`App Secret: ${settings.facebookAppSecret ? 'Set' : 'Not set'}\n`);
    
    // Test the token
    logger.info('🧪 Testing token...');
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
      if (settings.facebookAppId && settings.facebookAppSecret) {
        try {
          const tokenInfoResponse = await axios.get(`https://graph.facebook.com/v18.0/debug_token`, {
            params: {
              input_token: newToken,
              access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
            }
          });
          
          const tokenInfo = tokenInfoResponse.data.data;
          logger.info(`Token Type: ${tokenInfo.type}`);
          logger.info(`Expires At: ${tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never'}`);
          logger.info(`Permissions: ${tokenInfo.scopes?.join(', ') || 'None'}`);
        } catch (debugError) {
          logger.info('⚠️ Could not get detailed token info (App Secret might be missing)');
        }
      }
      
      // Update the token in database
      logger.info('\n💾 Updating token in database...');
      await Settings.updateCategorySettings('social-media', {
        facebookPageAccessToken: newToken
      });
      
      logger.info('✅ Token updated successfully in database!');
      
      // Test auto-posting
      logger.info('\n🧪 Testing auto-posting...');
      const socialMediaService = (await import('./services/socialMediaService.mjs')).default;
      const testArticle = {
        title: { en: 'Test: Facebook Token Fixed' },
        description: { en: 'This is a test to verify the Facebook token is working correctly.' },
        slug: 'test-facebook-token-fix',
        category: { name: { en: 'Test' } }
      };
      
      const result = await socialMediaService.autoPostContent(testArticle, { _id: 'test-user' });
      
      logger.info('\n📊 Auto-posting test results:');
      logger.info(`Success: ${result.success}`);
      logger.info(`Total Platforms: ${result.totalPlatforms}`);
      logger.info(`Successful Posts: ${result.successfulPosts}`);
      
      if (result.results) {
        result.results.forEach(r => {
          logger.info(`- ${r.platform}: ${r.success ? '✅' : '❌'} - ${r.message}`);
        });
      }
      
      // Set up prevention
      logger.info('\n🛡️ Setting up token prevention...');
      logger.info('💡 To prevent future expiration, run:');
      logger.info('   node facebook-token-manager.mjs');
      logger.info('\n📋 This will:');
      logger.info('   • Check token every 24 hours');
      logger.info('   • Auto-refresh when ≤10 days left');
      logger.info('   • Never let your token expire again!');
      
    } catch (error) {
      logger.info('❌ Token test failed:', error.response?.data?.error?.message || error.message);
      logger.info('💡 The token might be:');
      logger.info('   • A user token instead of page token');
      logger.info('   • Missing required permissions');
      logger.info('   • Expired or invalid');
      
      if (error.response?.data?.error?.code === 190) {
        logger.info('\n🔧 To fix this:');
        logger.info('1. Go to: https://developers.facebook.com/tools/explorer/');
        logger.info('2. Select your app: 2017594075645280');
        logger.info('3. Add permissions: pages_manage_posts, pages_read_engagement');
        logger.info('4. Generate token');
        logger.info('5. Get page token from: /775481852311918?fields=access_token');
      }
    }
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixFacebookToken();
