#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function setupAutoTokenManagement() {
  console.log('🔧 Setting Up Automatic Token Management');
  console.log('=========================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Current Token Status:');
    console.log('========================\n');

    // Check Facebook token
    if (settings.facebookEnabled && settings.facebookPageAccessToken) {
      console.log('📘 Facebook Token:');
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

        console.log(`  Status: ${daysLeft && daysLeft > 0 ? '🟢 Valid' : '🔴 Expired'}`);
        console.log(`  Page: ${testResponse.data.name}`);
        console.log(`  Expires: ${expiresAt ? expiresAt.toLocaleString() : 'Never'}`);
        console.log(`  Days Left: ${daysLeft || 'N/A'}\n`);

        if (daysLeft && daysLeft > 0) {
          console.log('✅ Facebook token is valid! Setting up automatic management...\n');
          
          console.log('🚀 Starting Facebook Token Manager...');
          console.log('This will:');
          console.log('• Check token every 24 hours');
          console.log('• Auto-refresh when ≤10 days left');
          console.log('• Never let your token expire again!\n');

          // Start the token manager
          const { spawn } = await import('child_process');
          const tokenManager = spawn('node', ['facebook-token-manager.mjs'], {
            detached: true,
            stdio: 'ignore'
          });

          tokenManager.unref();
          console.log('✅ Facebook Token Manager started in background');
          console.log(`Process ID: ${tokenManager.pid}\n`);

          console.log('📋 How It Works:');
          console.log('===============');
          console.log('1. Token Manager runs continuously in background');
          console.log('2. Checks token health every 24 hours');
          console.log('3. Automatically refreshes when token is ≤10 days from expiry');
          console.log('4. Updates database with new token');
          console.log('5. Logs all activities for monitoring\n');

          console.log('🔧 To Stop Token Manager:');
          console.log('kill $(pgrep -f "facebook-token-manager.mjs")\n');

          console.log('📊 To Monitor Token Manager:');
          console.log('tail -f logs/facebook-token-manager.log\n');

        } else {
          console.log('❌ Facebook token is expired or invalid');
          console.log('🔧 You need to get a new token first, then run this script again\n');
          
          console.log('💡 Quick Fix:');
          console.log('1. Get new token from Facebook Developer Console');
          console.log('2. Run: node quick-facebook-fix.mjs');
          console.log('3. Then run this script again to set up auto-management\n');
        }

      } catch (error) {
        console.log('❌ Facebook token test failed:');
        console.log(`Error: ${error.response?.data?.error?.message || error.message}\n`);
        console.log('🔧 You need to fix the token first before setting up auto-management\n');
      }
    } else {
      console.log('❌ Facebook not configured');
      console.log('🔧 Configure Facebook first, then run this script\n');
    }

    // Check other platforms
    console.log('📋 Other Platforms:');
    console.log('===================\n');

    if (settings.twitterEnabled && settings.twitterAccessToken) {
      console.log('🐦 Twitter/X: ✅ Configured (tokens don\'t expire)');
    } else {
      console.log('🐦 Twitter/X: ❌ Not configured');
    }

    if (settings.linkedinEnabled && settings.linkedinAccessToken) {
      console.log('🔗 LinkedIn: ✅ Configured (refresh token available)');
    } else {
      console.log('🔗 LinkedIn: ❌ Not configured');
    }

    if (settings.instagramEnabled && settings.instagramAccessToken) {
      console.log('📷 Instagram: ✅ Configured');
    } else {
      console.log('📷 Instagram: ❌ Not configured');
    }

    console.log('\n🎯 Best Practices for Token Management:');
    console.log('=======================================');
    console.log('1. ✅ Use Facebook Token Manager for Facebook');
    console.log('2. ✅ Monitor tokens in admin panel');
    console.log('3. ✅ Set up alerts for token issues');
    console.log('4. ✅ Keep backup tokens for critical platforms');
    console.log('5. ✅ Document token generation processes\n');

    console.log('💡 Pro Tips:');
    console.log('============');
    console.log('• Facebook tokens expire every 60 days');
    console.log('• LinkedIn refresh tokens last 60 days');
    console.log('• Twitter tokens don\'t expire but can be revoked');
    console.log('• Always use long-lived tokens when possible');
    console.log('• Monitor token health regularly\n');

    console.log('🔧 Commands for Token Management:');
    console.log('=================================');
    console.log('• Start Facebook Token Manager: node facebook-token-manager.mjs');
    console.log('• Check token health: node test-token-monitoring.mjs');
    console.log('• Test all platforms: node test-auto-posting.mjs');
    console.log('• View token status: Admin → System → Auto-Posting → Monitoring\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupAutoTokenManagement();
