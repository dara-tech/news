import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');

logger.info('🧵 Threads Auto-Posting Setup Guide');
logger.info('==================================\n');

logger.info('📋 About Threads Integration:');
logger.info('✅ Threads is Meta\'s new social media platform');
logger.info('✅ Built on the same infrastructure as Instagram');
logger.info('✅ Uses similar APIs and authentication methods');
logger.info('✅ Requires Instagram Business Account connection\n');

logger.info('🔑 Required Threads Credentials:');
logger.info('1. Threads App ID (same as Instagram/Facebook App ID)');
logger.info('2. Threads App Secret (same as Instagram/Facebook App Secret)');
logger.info('3. Threads Page ID (same as Instagram Page ID)');
logger.info('4. Threads Access Token (same as Instagram Access Token)\n');

logger.info('💡 Important Notes:');
logger.info('- Threads uses the same Meta app as Instagram and Facebook');
logger.info('- You need an Instagram Business Account connected to your Facebook page');
logger.info('- Threads posting requires the same permissions as Instagram');
logger.info('- Currently, Threads API is limited and may require media for posts\n');

logger.info('⚙️ Current Threads Settings in Database:');
try {
  const socialMediaSettings = await Settings.getCategorySettingsMasked('social-media');
  
  logger.info(`Threads App ID: ${socialMediaSettings.threadsAppId || 'Not set'}`);
  logger.info(`Threads App Secret: ${socialMediaSettings.threadsAppSecret || 'Not set'}`);
  logger.info(`Threads Page ID: ${socialMediaSettings.threadsPageId || 'Not set'}`);
  logger.info(`Threads Access Token: ${socialMediaSettings.threadsAccessToken || 'Not set'}`);
  logger.info(`Threads Enabled: ${socialMediaSettings.threadsEnabled || false}\n`);
  
  // Check if Instagram is configured (Threads uses same credentials)
  if (socialMediaSettings.instagramAppId && socialMediaSettings.instagramAccessToken) {
    logger.info('✅ Instagram credentials found! Threads can use the same credentials.\n');
    
    logger.info('🚀 Auto-configure Threads with Instagram credentials?');
    logger.info('   This will copy Instagram settings to Threads settings.\n');
    
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
    
    logger.info('✅ Threads settings auto-configured with Instagram credentials!');
    logger.info('\n📋 Updated Threads Settings:');
    logger.info(`   App ID: ${threadsSettings.threadsAppId}`);
    logger.info(`   App Secret: ${threadsSettings.threadsAppSecret ? 'Set' : 'Not set'}`);
    logger.info(`   Page ID: ${threadsSettings.threadsPageId}`);
    logger.info(`   Access Token: ${threadsSettings.threadsAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`   Enabled: ${threadsSettings.threadsEnabled}`);
    
  } else {
    logger.info('❌ Instagram credentials not found.');
    logger.info('💡 You need to configure Instagram first before setting up Threads.\n');
    
    logger.info('📖 Prerequisites for Threads:');
    logger.info('1. Configure Instagram auto-posting (uses same Meta app)');
    logger.info('2. Ensure Instagram Business Account is connected to Facebook page');
    logger.info('3. Get Instagram Access Token with required permissions');
    logger.info('4. Threads will automatically use the same credentials\n');
  }
  
} catch (error) {
  logger.error('❌ Error reading settings:', error.message);
}

logger.info('🔧 Threads API Limitations:');
logger.info('- Threads API is still in development');
logger.info('- May require media (images/videos) for posts');
logger.info('- Text-only posts may not be supported yet');
logger.info('- Uses Instagram Graph API endpoints\n');

logger.info('🚀 Next Steps:');
logger.info('1. Ensure Instagram is properly configured');
logger.info('2. Test Threads auto-posting with a sample post');
logger.info('3. Monitor Threads posts in your admin dashboard');
logger.info('4. Configure auto-posting settings in your admin panel\n');

logger.info('📝 Threads Post Format:');
logger.info('- Similar to Instagram posts');
logger.info('- Supports text, images, and videos');
logger.info('- Hashtags and mentions work');
logger.info('- Character limits similar to Instagram\n');

await mongoose.disconnect();
logger.info('✅ Threads setup guide completed!');
