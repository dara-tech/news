#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function testTokenMonitoring() {
  console.log('🔍 Token Monitoring Test');
  console.log('========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get social media settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Platform Status Overview:');
    console.log('=============================\n');

    // Facebook
    console.log('📘 Facebook:');
    console.log(`  Enabled: ${settings.facebookEnabled ? '✅' : '❌'}`);
    console.log(`  App ID: ${settings.facebookAppId ? '✅' : '❌'}`);
    console.log(`  Page Access Token: ${settings.facebookPageAccessToken ? '✅' : '❌'}`);
    console.log(`  Status: ${settings.facebookEnabled && settings.facebookPageAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Twitter
    console.log('🐦 Twitter/X:');
    console.log(`  Enabled: ${settings.twitterEnabled ? '✅' : '❌'}`);
    console.log(`  API Key: ${settings.twitterApiKey ? '✅' : '❌'}`);
    console.log(`  API Secret: ${settings.twitterApiSecret ? '✅' : '❌'}`);
    console.log(`  Access Token: ${settings.twitterAccessToken ? '✅' : '❌'}`);
    console.log(`  Access Token Secret: ${settings.twitterAccessTokenSecret ? '✅' : '❌'}`);
    console.log(`  Status: ${settings.twitterEnabled && settings.twitterApiKey && settings.twitterAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // LinkedIn
    console.log('🔗 LinkedIn:');
    console.log(`  Enabled: ${settings.linkedinEnabled ? '✅' : '❌'}`);
    console.log(`  Client ID: ${settings.linkedinClientId ? '✅' : '❌'}`);
    console.log(`  Client Secret: ${settings.linkedinClientSecret ? '✅' : '❌'}`);
    console.log(`  Access Token: ${settings.linkedinAccessToken ? '✅' : '❌'}`);
    console.log(`  Refresh Token: ${settings.linkedinRefreshToken ? '✅' : '❌'}`);
    console.log(`  Organization ID: ${settings.linkedinOrganizationId ? '✅' : '❌'}`);
    console.log(`  Status: ${settings.linkedinEnabled && settings.linkedinAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Instagram
    console.log('📷 Instagram:');
    console.log(`  Enabled: ${settings.instagramEnabled ? '✅' : '❌'}`);
    console.log(`  App ID: ${settings.instagramAppId ? '✅' : '❌'}`);
    console.log(`  Access Token: ${settings.instagramAccessToken ? '✅' : '❌'}`);
    console.log(`  Status: ${settings.instagramEnabled && settings.instagramAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Summary
    const platforms = [
      { name: 'Facebook', ready: settings.facebookEnabled && settings.facebookPageAccessToken },
      { name: 'Twitter/X', ready: settings.twitterEnabled && settings.twitterApiKey && settings.twitterAccessToken },
      { name: 'LinkedIn', ready: settings.linkedinEnabled && settings.linkedinAccessToken },
      { name: 'Instagram', ready: settings.instagramEnabled && settings.instagramAccessToken }
    ];

    const readyPlatforms = platforms.filter(p => p.ready);
    const totalPlatforms = platforms.length;

    console.log('📊 Summary:');
    console.log('===========');
    console.log(`Total Platforms: ${totalPlatforms}`);
    console.log(`Ready Platforms: ${readyPlatforms.length}`);
    console.log(`Success Rate: ${Math.round((readyPlatforms.length / totalPlatforms) * 100)}%\n`);

    console.log('🎯 Ready Platforms:');
    readyPlatforms.forEach(platform => {
      console.log(`  ✅ ${platform.name}`);
    });

    console.log('\n❌ Platforms Needing Configuration:');
    platforms.filter(p => !p.ready).forEach(platform => {
      console.log(`  🔴 ${platform.name}`);
    });

    console.log('\n💡 Next Steps:');
    console.log('==============');
    if (readyPlatforms.length === 0) {
      console.log('• Configure at least one platform to start auto-posting');
      console.log('• Start with Facebook or Twitter/X for easiest setup');
    } else if (readyPlatforms.length < totalPlatforms) {
      console.log('• Configure remaining platforms for maximum reach');
      console.log('• Test each platform individually before enabling auto-posting');
    } else {
      console.log('• All platforms are ready! 🎉');
      console.log('• Test auto-posting with a manual post');
      console.log('• Monitor token health regularly');
    }

    console.log('\n🔧 Testing Commands:');
    console.log('===================');
    console.log('• Test all platforms: node test-auto-posting.mjs');
    console.log('• Test Facebook: node test-facebook-specific.mjs');
    console.log('• Test Twitter: node test-twitter-specific.mjs');
    console.log('• Test LinkedIn: node test-linkedin-specific.mjs');
    console.log('• Check credentials: node check-twitter-credentials.mjs');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTokenMonitoring();
