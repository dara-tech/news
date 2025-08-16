import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');

console.log('🧵 Threads Auto-Posting Setup Guide');
console.log('==================================\n');

console.log('📋 About Threads Integration:');
console.log('✅ Threads is Meta\'s new social media platform');
console.log('✅ Built on the same infrastructure as Instagram');
console.log('✅ Uses similar APIs and authentication methods');
console.log('✅ Requires Instagram Business Account connection\n');

console.log('🔑 Required Threads Credentials:');
console.log('1. Threads App ID (same as Instagram/Facebook App ID)');
console.log('2. Threads App Secret (same as Instagram/Facebook App Secret)');
console.log('3. Threads Page ID (same as Instagram Page ID)');
console.log('4. Threads Access Token (same as Instagram Access Token)\n');

console.log('💡 Important Notes:');
console.log('- Threads uses the same Meta app as Instagram and Facebook');
console.log('- You need an Instagram Business Account connected to your Facebook page');
console.log('- Threads posting requires the same permissions as Instagram');
console.log('- Currently, Threads API is limited and may require media for posts\n');

console.log('⚙️ Current Threads Settings in Database:');
try {
  const socialMediaSettings = await Settings.getCategorySettingsMasked('social-media');
  
  console.log(`Threads App ID: ${socialMediaSettings.threadsAppId || 'Not set'}`);
  console.log(`Threads App Secret: ${socialMediaSettings.threadsAppSecret || 'Not set'}`);
  console.log(`Threads Page ID: ${socialMediaSettings.threadsPageId || 'Not set'}`);
  console.log(`Threads Access Token: ${socialMediaSettings.threadsAccessToken || 'Not set'}`);
  console.log(`Threads Enabled: ${socialMediaSettings.threadsEnabled || false}\n`);
  
  // Check if Instagram is configured (Threads uses same credentials)
  if (socialMediaSettings.instagramAppId && socialMediaSettings.instagramAccessToken) {
    console.log('✅ Instagram credentials found! Threads can use the same credentials.\n');
    
    console.log('🚀 Auto-configure Threads with Instagram credentials?');
    console.log('   This will copy Instagram settings to Threads settings.\n');
    
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
    
    console.log('✅ Threads settings auto-configured with Instagram credentials!');
    console.log('\n📋 Updated Threads Settings:');
    console.log(`   App ID: ${threadsSettings.threadsAppId}`);
    console.log(`   App Secret: ${threadsSettings.threadsAppSecret ? 'Set' : 'Not set'}`);
    console.log(`   Page ID: ${threadsSettings.threadsPageId}`);
    console.log(`   Access Token: ${threadsSettings.threadsAccessToken ? 'Set' : 'Not set'}`);
    console.log(`   Enabled: ${threadsSettings.threadsEnabled}`);
    
  } else {
    console.log('❌ Instagram credentials not found.');
    console.log('💡 You need to configure Instagram first before setting up Threads.\n');
    
    console.log('📖 Prerequisites for Threads:');
    console.log('1. Configure Instagram auto-posting (uses same Meta app)');
    console.log('2. Ensure Instagram Business Account is connected to Facebook page');
    console.log('3. Get Instagram Access Token with required permissions');
    console.log('4. Threads will automatically use the same credentials\n');
  }
  
} catch (error) {
  console.error('❌ Error reading settings:', error.message);
}

console.log('🔧 Threads API Limitations:');
console.log('- Threads API is still in development');
console.log('- May require media (images/videos) for posts');
console.log('- Text-only posts may not be supported yet');
console.log('- Uses Instagram Graph API endpoints\n');

console.log('🚀 Next Steps:');
console.log('1. Ensure Instagram is properly configured');
console.log('2. Test Threads auto-posting with a sample post');
console.log('3. Monitor Threads posts in your admin dashboard');
console.log('4. Configure auto-posting settings in your admin panel\n');

console.log('📝 Threads Post Format:');
console.log('- Similar to Instagram posts');
console.log('- Supports text, images, and videos');
console.log('- Hashtags and mentions work');
console.log('- Character limits similar to Instagram\n');

await mongoose.disconnect();
console.log('✅ Threads setup guide completed!');
