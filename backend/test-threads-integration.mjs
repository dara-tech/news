import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import socialMediaService from './services/socialMediaService.mjs';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');

console.log('🧵 Threads Integration Test');
console.log('==========================\n');

try {
  // Get current social media settings
  const socialMediaSettings = await Settings.getCategorySettings('social-media');
  
  console.log('📋 Current Social Media Settings:');
  console.log(`Facebook Enabled: ${socialMediaSettings.facebookEnabled}`);
  console.log(`Twitter Enabled: ${socialMediaSettings.twitterEnabled}`);
  console.log(`Instagram Enabled: ${socialMediaSettings.instagramEnabled}`);
  console.log(`Threads Enabled: ${socialMediaSettings.threadsEnabled}\n`);
  
  // Test Threads configuration
  console.log('🔍 Threads Configuration Check:');
  console.log(`Threads App ID: ${socialMediaSettings.threadsAppId || 'Not set'}`);
  console.log(`Threads App Secret: ${socialMediaSettings.threadsAppSecret ? 'Set' : 'Not set'}`);
  console.log(`Threads Page ID: ${socialMediaSettings.threadsPageId || 'Not set'}`);
  console.log(`Threads Access Token: ${socialMediaSettings.threadsAccessToken ? 'Set' : 'Not set'}\n`);
  
  if (socialMediaSettings.threadsEnabled && socialMediaSettings.threadsAccessToken) {
    console.log('✅ Threads is configured! Testing posting functionality...\n');
    
    // Create a test news article
    const testArticle = {
      title: { en: 'Test Threads Post from NewsApp' },
      description: { en: 'This is a test post to verify Threads integration is working correctly. Stay tuned for more updates!' },
      slug: 'test-threads-post',
      category: { name: { en: 'Technology' } }
    };
    
    // Test Threads posting
    console.log('📤 Testing Threads posting...');
    
    try {
      const result = await socialMediaService.postToThreads(
        { platform: 'threads', url: 'https://threads.net' },
        testArticle,
        socialMediaSettings
      );
      
      console.log('✅ Threads posting result:');
      console.log(`   Success: ${result.success}`);
      console.log(`   Message: ${result.message}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Post ID: ${result.postId}\n`);
      
    } catch (error) {
      console.log('❌ Threads posting failed:');
      console.log(`   Error: ${error.message}\n`);
    }
    
  } else {
    console.log('❌ Threads is not properly configured.');
    console.log('💡 To configure Threads:');
    console.log('   1. First configure Instagram (Threads uses same credentials)');
    console.log('   2. Get a valid Facebook Page Access Token with Instagram permissions');
    console.log('   3. Connect your Instagram Business Account to your Facebook page');
    console.log('   4. Run the Instagram setup script to get credentials');
    console.log('   5. Threads will automatically use the same credentials\n');
    
    // Check if Instagram is configured
    if (socialMediaSettings.instagramEnabled && socialMediaSettings.instagramAccessToken) {
      console.log('✅ Instagram is configured! Auto-configuring Threads...\n');
      
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
      
      console.log('✅ Threads auto-configured with Instagram credentials!');
      console.log('🔄 Please run this test script again to verify Threads posting.\n');
      
    } else {
      console.log('❌ Instagram is also not configured.');
      console.log('📖 You need to:');
      console.log('   1. Get a new Facebook Page Access Token (current one expired)');
      console.log('   2. Configure Instagram with the new token');
      console.log('   3. Threads will automatically use the same credentials\n');
    }
  }
  
  // Show Threads post format
  console.log('📝 Threads Post Format Example:');
  const sampleArticle = {
    title: { en: 'Breaking News: New Technology Breakthrough' },
    description: { en: 'Scientists discover revolutionary new technology that could change the world. This breakthrough has the potential to transform multiple industries.' },
    slug: 'breaking-news-technology',
    category: { name: { en: 'Technology' } }
  };
  
  const threadsContent = socialMediaService.generatePostContent(sampleArticle, 'threads');
  console.log('Sample Threads post content:');
  console.log('─'.repeat(50));
  console.log(threadsContent);
  console.log('─'.repeat(50));
  console.log(`Character count: ${threadsContent.length}\n`);
  
} catch (error) {
  console.error('❌ Error during Threads test:', error.message);
}

await mongoose.disconnect();
console.log('✅ Threads integration test completed!');
