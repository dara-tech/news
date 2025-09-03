import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import socialMediaService from './services/socialMediaService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');

logger.info('🧵 Threads Integration Test');
logger.info('==========================\n');

try {
  // Get current social media settings
  const socialMediaSettings = await Settings.getCategorySettings('social-media');
  
  logger.info('📋 Current Social Media Settings:');
  logger.info(`Facebook Enabled: ${socialMediaSettings.facebookEnabled}`);
  logger.info(`Twitter Enabled: ${socialMediaSettings.twitterEnabled}`);
  logger.info(`Instagram Enabled: ${socialMediaSettings.instagramEnabled}`);
  logger.info(`Threads Enabled: ${socialMediaSettings.threadsEnabled}\n`);
  
  // Test Threads configuration
  logger.info(`Threads App ID: ${socialMediaSettings.threadsAppId || 'Not set'}`);
  logger.info(`Threads App Secret: ${socialMediaSettings.threadsAppSecret ? 'Set' : 'Not set'}`);
  logger.info(`Threads Page ID: ${socialMediaSettings.threadsPageId || 'Not set'}`);
  logger.info(`Threads Access Token: ${socialMediaSettings.threadsAccessToken ? 'Set' : 'Not set'}\n`);
  
  if (socialMediaSettings.threadsEnabled && socialMediaSettings.threadsAccessToken) {
    logger.info('✅ Threads is configured! Testing posting functionality...\n');
    
    // Create a test news article
    const testArticle = {
      title: { en: 'Test Threads Post from NewsApp' },
      description: { en: 'This is a test post to verify Threads integration is working correctly. Stay tuned for more updates!' },
      slug: 'test-threads-post',
      category: { name: { en: 'Technology' } }
    };
    
    // Test Threads posting
    logger.info('📤 Testing Threads posting...');
    
    try {
      const result = await socialMediaService.postToThreads(
        { platform: 'threads', url: 'https://threads.net' },
        testArticle,
        socialMediaSettings
      );
      
      logger.info('✅ Threads posting result:');
      logger.info(`   Success: ${result.success}`);
      logger.info(`   Message: ${result.message}`);
      logger.info(`   URL: ${result.url}`);
      logger.info(`   Post ID: ${result.postId}\n`);
      
    } catch (error) {
      logger.info('❌ Threads posting failed:');
      logger.info(`   Error: ${error.message}\n`);
    }
    
  } else {
    logger.info('❌ Threads is not properly configured.');
    logger.info('💡 To configure Threads:');
    logger.info('   1. First configure Instagram (Threads uses same credentials)');
    logger.info('   2. Get a valid Facebook Page Access Token with Instagram permissions');
    logger.info('   3. Connect your Instagram Business Account to your Facebook page');
    logger.info('   4. Run the Instagram setup script to get credentials');
    logger.info('   5. Threads will automatically use the same credentials\n');
    
    // Check if Instagram is configured
    if (socialMediaSettings.instagramEnabled && socialMediaSettings.instagramAccessToken) {
      logger.info('✅ Instagram is configured! Auto-configuring Threads...\n');
      
      // Auto-configure Threads with Instagram credentials
      const threadsSettings = {
        threadsAppId: socialMediaSettings.instagramAppId,
        threadsAppSecret: socialMediaSettings.instagramAppSecret,
        threadsPageId: socialMediaSettings.instagramPageId,
        threadsAccessToken: socialMediaSettings.instagramAccessToken,
        threadsEnabled: true
      };
      
      // Create a system user ID for the update
      const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');
      
      await Settings.updateCategorySettings('social-media', threadsSettings, systemUserId);
      
      logger.info('✅ Threads auto-configured with Instagram credentials!');
      logger.info('🔄 Please run this test script again to verify Threads posting.\n');
      
    } else {
      logger.info('❌ Instagram is also not configured.');
      logger.info('📖 You need to:');
      logger.info('   1. Get a new Facebook Page Access Token (current one expired)');
      logger.info('   2. Configure Instagram with the new token');
      logger.info('   3. Threads will automatically use the same credentials\n');
    }
  }
  
  // Show Threads post format
  logger.info('📝 Threads Post Format Example:');
  const sampleArticle = {
    title: { en: 'Breaking News: New Technology Breakthrough' },
    description: { en: 'Scientists discover revolutionary new technology that could change the world. This breakthrough has the potential to transform multiple industries.' },
    slug: 'breaking-news-technology',
    category: { name: { en: 'Technology' } }
  };
  
  const threadsContent = socialMediaService.generatePostContent(sampleArticle, 'threads');
  logger.info('Sample Threads post content:');
  logger.info('─'.repeat(50));
  logger.info(threadsContent);
  logger.info('─'.repeat(50));
  logger.info(`Character count: ${threadsContent.length}\n`);
  
} catch (error) {
  logger.error('❌ Error during Threads test:', error.message);
}

await mongoose.disconnect();
logger.info('✅ Threads integration test completed!');
