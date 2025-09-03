#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function setupAutoTokenManagement() {
  logger.info('🔧 Setting Up Automatic Token Management');
  logger.info('=========================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Current Token Status:');
    logger.info('========================\n');

    // Check Facebook token
    if (settings.facebookEnabled && settings.facebookPageAccessToken) {
      logger.info('📘 Facebook Token:');
      try {
        const axios = await import('axios');
        
        // Test current token
        const testResponse = await axios.default.get(`https://graph.facebook.com/v18.0/me`, {
          params: {
            access_token: settings.facebookPageAccessToken,
            fields: 'id,name'
          }
        });

        // Get token info
        const tokenInfoResponse = await axios.default.get(`https://graph.facebook.com/v18.0/debug_token`, {
          params: {
            input_token: settings.facebookPageAccessToken,
            access_token: `${settings.facebookAppId}|${settings.facebookAppSecret}`
          }
        });

        const tokenInfo = tokenInfoResponse.data.data;
        const expiresAt = tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000) : null;
        const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

        logger.info(`  Status: ${daysLeft && daysLeft > 0 ? '🟢 Valid' : '🔴 Expired'}`);
        logger.info(`  Page: ${testResponse.data.name}`);
        logger.info(`  Expires: ${expiresAt ? expiresAt.toLocaleString() : 'Never'}`);
        logger.info(`  Days Left: ${daysLeft || 'N/A'}\n`);

        if (daysLeft && daysLeft > 0) {
          logger.info('✅ Facebook token is valid! Setting up automatic management...\n');
          
          logger.info('🚀 Starting Facebook Token Manager...');
          logger.info('This will:');
          logger.info('• Check token every 24 hours');
          logger.info('• Auto-refresh when ≤10 days left');
          logger.info('• Never let your token expire again!\n');

          // Start the token manager
          const { spawn } = await import('child_process');
          const tokenManager = spawn('node', ['facebook-token-manager.mjs'], {
            detached: true,
            stdio: 'ignore'
          });

          tokenManager.unref();
          logger.info('✅ Facebook Token Manager started in background');
          logger.info(`Process ID: ${tokenManager.pid}\n`);

          logger.info('📋 How It Works:');
          logger.info('===============');
          logger.info('1. Token Manager runs continuously in background');
          logger.info('2. Checks token health every 24 hours');
          logger.info('3. Automatically refreshes when token is ≤10 days from expiry');
          logger.info('4. Updates database with new token');
          logger.info('5. Logs all activities for monitoring\n');

          logger.info('🔧 To Stop Token Manager:');
          logger.info('kill $(pgrep -f "facebook-token-manager.mjs")\n');

          logger.info('📊 To Monitor Token Manager:');
          logger.info('tail -f logs/facebook-token-manager.log\n');

        } else {
          logger.info('❌ Facebook token is expired or invalid');
          logger.info('🔧 You need to get a new token first, then run this script again\n');
          
          logger.info('💡 Quick Fix:');
          logger.info('1. Get new token from Facebook Developer Console');
          logger.info('2. Run: node quick-facebook-fix.mjs');
          logger.info('3. Then run this script again to set up auto-management\n');
        }

      } catch (error) {
        logger.info('❌ Facebook token test failed:');
        logger.info(`Error: ${error.response?.data?.error?.message || error.message}\n`);
        logger.info('🔧 You need to fix the token first before setting up auto-management\n');
      }
    } else {
      logger.info('❌ Facebook not configured');
      logger.info('🔧 Configure Facebook first, then run this script\n');
    }

    // Check other platforms
    logger.info('📋 Other Platforms:');
    logger.info('===================\n');

    if (settings.twitterEnabled && settings.twitterAccessToken) {
      logger.info('🐦 Twitter/X: ✅ Configured (tokens don\'t expire)');
    } else {
      logger.info('🐦 Twitter/X: ❌ Not configured');
    }

    if (settings.linkedinEnabled && settings.linkedinAccessToken) {
      logger.info('🔗 LinkedIn: ✅ Configured (refresh token available)');
    } else {
      logger.info('🔗 LinkedIn: ❌ Not configured');
    }

    if (settings.instagramEnabled && settings.instagramAccessToken) {
      logger.info('📷 Instagram: ✅ Configured');
    } else {
      logger.info('📷 Instagram: ❌ Not configured');
    }

    logger.info('\n🎯 Best Practices for Token Management:');
    logger.info('=======================================');
    logger.info('1. ✅ Use Facebook Token Manager for Facebook');
    logger.info('2. ✅ Monitor tokens in admin panel');
    logger.info('3. ✅ Set up alerts for token issues');
    logger.info('4. ✅ Keep backup tokens for critical platforms');
    logger.info('5. ✅ Document token generation processes\n');

    logger.info('💡 Pro Tips:');
    logger.info('============');
    logger.info('• Facebook tokens expire every 60 days');
    logger.info('• LinkedIn refresh tokens last 60 days');
    logger.info('• Twitter tokens don\'t expire but can be revoked');
    logger.info('• Always use long-lived tokens when possible');
    logger.info('• Monitor token health regularly\n');

    logger.info('🔧 Commands for Token Management:');
    logger.info('=================================');
    logger.info('• Start Facebook Token Manager: node facebook-token-manager.mjs');
    logger.info('• Check token health: node test-token-monitoring.mjs');
    logger.info('• Test all platforms: node test-auto-posting.mjs');
    logger.info('• View token status: Admin → System → Auto-Posting → Monitoring\n');

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupAutoTokenManagement();
