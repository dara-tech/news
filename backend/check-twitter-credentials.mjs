#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function checkTwitterCredentials() {
  logger.info('🐦 Twitter Credentials Check');
  logger.info('===========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get Twitter settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Twitter Configuration:');
    logger.info(`API Key: ${settings.twitterApiKey ? 'Set' : 'Not set'}`);
    logger.info(`API Secret: ${settings.twitterApiSecret ? 'Set' : 'Not set'}`);
    logger.info(`Access Token: ${settings.twitterAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`Access Token Secret: ${settings.twitterAccessTokenSecret ? 'Set' : 'Not set'}`);
    logger.info(`Enabled: ${settings.twitterEnabled}\n`);

    if (!settings.twitterEnabled) {
      logger.info('❌ Twitter is not enabled');
      return;
    }

    // Check what type of credentials we have
    if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && settings.twitterAccessTokenSecret) {
      logger.info('✅ OAuth 1.0a User Context - Complete');
      logger.info('   This is the correct setup for posting tweets\n');
    } else if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && !settings.twitterAccessTokenSecret) {
      logger.info('⚠️  OAuth 2.0 Application-Only - Incomplete');
      logger.info('   Missing Access Token Secret for user context\n');
    } else if (settings.twitterAccessToken && !settings.twitterApiKey) {
      logger.info('⚠️  OAuth 2.0 Bearer Token - Limited');
      logger.info('   Can only read public data, cannot post\n');
    } else {
      logger.info('❌ Incomplete Twitter credentials');
      logger.info('   Missing required fields for posting\n');
    }

    // Test with OAuth 1.0a if we have all credentials
    if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && settings.twitterAccessTokenSecret) {
      logger.info('🧪 Testing OAuth 1.0a User Context...');
      
      try {
        const crypto = await import('crypto');
        const axios = await import('axios');
        
        // Generate OAuth 1.0a signature for /users/me endpoint
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto.randomBytes(16).toString('hex');
        
        const oauthParams = {
          oauth_consumer_key: settings.twitterApiKey,
          oauth_nonce: nonce,
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: timestamp,
          oauth_token: settings.twitterAccessToken,
          oauth_version: '1.0'
        };

        // Generate signature for GET request
        const sortedParams = Object.keys(oauthParams).sort().map(key => `${key}=${encodeURIComponent(oauthParams[key])}`).join('&');
        const signatureBaseString = `GET&${encodeURIComponent('https://api.twitter.com/2/users/me')}&${encodeURIComponent(sortedParams)}`;
        const signingKey = `${encodeURIComponent(settings.twitterApiSecret)}&${encodeURIComponent(settings.twitterAccessTokenSecret)}`;
        
        const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
        oauthParams.oauth_signature = signature;

        const authHeader = 'OAuth ' + Object.keys(oauthParams)
          .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
          .join(', ');

        // Test user context access
        const userResponse = await axios.default.get('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': authHeader
          }
        });

        logger.info('✅ OAuth 1.0a User Context Test Successful!');
        logger.info(`User ID: ${userResponse.data.data.id}`);
        logger.info(`Username: ${userResponse.data.data.username}`);
        logger.info(`Name: ${userResponse.data.data.name}\n`);

        // Test posting a tweet
        logger.info('🧪 Testing Tweet Creation...');
        
        const timestamp2 = Math.floor(Date.now() / 1000);
        const nonce2 = crypto.randomBytes(16).toString('hex');
        const uniqueContent = `🔧 RazeWire OAuth Test - ${new Date().toISOString()}\n\nTesting OAuth 1.0a user context for posting.\n\n#RazeWire #OAuth #Test #${Date.now()}`;
        
        const oauthParams2 = {
          oauth_consumer_key: settings.twitterApiKey,
          oauth_nonce: nonce2,
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: timestamp2,
          oauth_token: settings.twitterAccessToken,
          oauth_version: '1.0'
        };

        // Generate signature for POST request
        const sortedParams2 = Object.keys(oauthParams2).sort().map(key => `${key}=${encodeURIComponent(oauthParams2[key])}`).join('&');
        const signatureBaseString2 = `POST&${encodeURIComponent('https://api.twitter.com/2/tweets')}&${encodeURIComponent(sortedParams2)}`;
        const signingKey2 = `${encodeURIComponent(settings.twitterApiSecret)}&${encodeURIComponent(settings.twitterAccessTokenSecret)}`;
        
        const signature2 = crypto.createHmac('sha1', signingKey2).update(signatureBaseString2).digest('base64');
        oauthParams2.oauth_signature = signature2;

        const authHeader2 = 'OAuth ' + Object.keys(oauthParams2)
          .map(key => `${key}="${encodeURIComponent(oauthParams2[key])}"`)
          .join(', ');

        const postResponse = await axios.default.post('https://api.twitter.com/2/tweets', {
          text: uniqueContent
        }, {
          headers: {
            'Authorization': authHeader2,
            'Content-Type': 'application/json'
          }
        });

        logger.info('✅ Tweet Created Successfully!');
        logger.info(`Tweet ID: ${postResponse.data.data.id}`);
        logger.info(`Tweet URL: https://twitter.com/${userResponse.data.data.username}/status/${postResponse.data.data.id}\n`);

        logger.info('🎉 Twitter/X is working perfectly with OAuth 1.0a!');
        logger.info('✅ All credentials are correct');
        logger.info('✅ User context authentication works');
        logger.info('✅ Tweet posting works\n');

      } catch (error) {
        logger.info('❌ OAuth 1.0a test failed');
        logger.info(`Status: ${error.response?.status}`);
        logger.info(`Error: ${error.response?.data?.detail || error.response?.data?.message || error.message}`);
        
        if (error.response?.data) {
          logger.info('\n📋 Full Error Response:');
          logger.info(JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      logger.info('❌ Cannot test - missing required credentials');
      logger.info('\n🔧 To fix Twitter/X posting, you need:');
      logger.info('1. API Key (Consumer Key)');
      logger.info('2. API Secret (Consumer Secret)');
      logger.info('3. Access Token');
      logger.info('4. Access Token Secret');
      logger.info('\n💡 Get these from: https://developer.twitter.com/en/portal/dashboard');
    }

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkTwitterCredentials();
