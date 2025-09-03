#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testTokenMonitoring() {
  logger.info('========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get social media settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Platform Status Overview:');
    logger.info('=============================\n');

    // Facebook
    logger.info('📘 Facebook:');
    logger.info(`  Enabled: ${settings.facebookEnabled ? '✅' : '❌'}`);
    logger.info(`  App ID: ${settings.facebookAppId ? '✅' : '❌'}`);
    logger.info(`  Page Access Token: ${settings.facebookPageAccessToken ? '✅' : '❌'}`);
    logger.info(`  Status: ${settings.facebookEnabled && settings.facebookPageAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Twitter
    logger.info('🐦 Twitter/X:');
    logger.info(`  Enabled: ${settings.twitterEnabled ? '✅' : '❌'}`);
    logger.info(`  API Key: ${settings.twitterApiKey ? '✅' : '❌'}`);
    logger.info(`  API Secret: ${settings.twitterApiSecret ? '✅' : '❌'}`);
    logger.info(`  Access Token: ${settings.twitterAccessToken ? '✅' : '❌'}`);
    logger.info(`  Access Token Secret: ${settings.twitterAccessTokenSecret ? '✅' : '❌'}`);
    logger.info(`  Status: ${settings.twitterEnabled && settings.twitterApiKey && settings.twitterAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // LinkedIn
    logger.info('🔗 LinkedIn:');
    logger.info(`  Enabled: ${settings.linkedinEnabled ? '✅' : '❌'}`);
    logger.info(`  Client ID: ${settings.linkedinClientId ? '✅' : '❌'}`);
    logger.info(`  Client Secret: ${settings.linkedinClientSecret ? '✅' : '❌'}`);
    logger.info(`  Access Token: ${settings.linkedinAccessToken ? '✅' : '❌'}`);
    logger.info(`  Refresh Token: ${settings.linkedinRefreshToken ? '✅' : '❌'}`);
    logger.info(`  Organization ID: ${settings.linkedinOrganizationId ? '✅' : '❌'}`);
    logger.info(`  Status: ${settings.linkedinEnabled && settings.linkedinAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Instagram
    logger.info('📷 Instagram:');
    logger.info(`  Enabled: ${settings.instagramEnabled ? '✅' : '❌'}`);
    logger.info(`  App ID: ${settings.instagramAppId ? '✅' : '❌'}`);
    logger.info(`  Access Token: ${settings.instagramAccessToken ? '✅' : '❌'}`);
    logger.info(`  Status: ${settings.instagramEnabled && settings.instagramAccessToken ? '🟢 Ready' : '🔴 Not Configured'}\n`);

    // Summary
    const platforms = [
      { name: 'Facebook', ready: settings.facebookEnabled && settings.facebookPageAccessToken },
      { name: 'Twitter/X', ready: settings.twitterEnabled && settings.twitterApiKey && settings.twitterAccessToken },
      { name: 'LinkedIn', ready: settings.linkedinEnabled && settings.linkedinAccessToken },
      { name: 'Instagram', ready: settings.instagramEnabled && settings.instagramAccessToken }
    ];

    const readyPlatforms = platforms.filter(p => p.ready);
    const totalPlatforms = platforms.length;

    logger.info('📊 Summary:');
    logger.info('===========');
    logger.info(`Total Platforms: ${totalPlatforms}`);
    logger.info(`Ready Platforms: ${readyPlatforms.length}`);
    logger.info(`Success Rate: ${Math.round((readyPlatforms.length / totalPlatforms) * 100)}%\n`);

    logger.info('🎯 Ready Platforms:');
    readyPlatforms.forEach(platform => {
      logger.info(`  ✅ ${platform.name}`);
    });

    logger.info('\n❌ Platforms Needing Configuration:');
    platforms.filter(p => !p.ready).forEach(platform => {
      logger.info(`  🔴 ${platform.name}`);
    });

    logger.info('\n💡 Next Steps:');
    logger.info('==============');
    if (readyPlatforms.length === 0) {
      logger.info('• Configure at least one platform to start auto-posting');
      logger.info('• Start with Facebook or Twitter/X for easiest setup');
    } else if (readyPlatforms.length < totalPlatforms) {
      logger.info('• Configure remaining platforms for maximum reach');
      logger.info('• Test each platform individually before enabling auto-posting');
    } else {
      logger.info('• All platforms are ready! 🎉');
      logger.info('• Test auto-posting with a manual post');
      logger.info('• Monitor token health regularly');
    }

    logger.info('\n🔧 Testing Commands:');
    logger.info('===================');
    logger.info('• Test all platforms: node test-auto-posting.mjs');
    logger.info('• Test Facebook: node test-facebook-specific.mjs');
    logger.info('• Test Twitter: node test-twitter-specific.mjs');
    logger.info('• Test LinkedIn: node test-linkedin-specific.mjs');
    logger.info('• Check credentials: node check-twitter-credentials.mjs');

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTokenMonitoring();
