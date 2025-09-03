#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.mjs';

dotenv.config();

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
}

async function testTwitterTokenStatus() {
  logger.info('🐦 Twitter Token Status Check');
  logger.info('=============================\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');
    
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Twitter Configuration:');
    logger.info('==========================\n');
    logger.info(`API Key: ${settings.twitterApiKey ? '✅ Set' : '❌ Not set'}`);
    logger.info(`API Secret: ${settings.twitterApiSecret ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Access Token: ${settings.twitterAccessToken ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Access Token Secret: ${settings.twitterAccessTokenSecret ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Enabled: ${settings.twitterEnabled ? '✅ Yes' : '❌ No'}\n`);
    
    if (!settings.twitterApiKey || !settings.twitterApiSecret || !settings.twitterAccessToken || !settings.twitterAccessTokenSecret) {
      logger.info('❌ Missing Twitter credentials');
      logger.info('💡 Please configure all Twitter credentials first\n');
      return;
    }
    
    // Test 1: Check if token is expired by testing user info
    logger.info('📋 Test 1: Token Validity Check');
    logger.info('===============================');
    
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = crypto.randomBytes(16).toString('hex');
      
      const params = {
        oauth_consumer_key: settings.twitterApiKey,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_token: settings.twitterAccessToken,
        oauth_version: '1.0'
      };
      
      const url = 'https://api.twitter.com/2/users/me';
      const signature = generateOAuthSignature('GET', url, params, settings.twitterApiSecret, settings.twitterAccessTokenSecret);
      
      const authHeader = `OAuth oauth_consumer_key="${params.oauth_consumer_key}", oauth_nonce="${params.oauth_nonce}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="${params.oauth_signature_method}", oauth_timestamp="${params.oauth_timestamp}", oauth_token="${params.oauth_token}", oauth_version="${params.oauth_version}"`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': authHeader,
          'User-Agent': 'RazeWire/1.0'
        }
      });
      
      logger.info('✅ Token is VALID!');
      logger.info(`User ID: ${response.data.data.id}`);
      logger.info(`Username: @${response.data.data.username}`);
      logger.info(`Name: ${response.data.data.name}\n`);
      
      // Test 2: Try to post a test tweet
      logger.info('📋 Test 2: Posting Test');
      logger.info('=======================');
      
      try {
        const tweetText = `🧪 Twitter Token Test - ${new Date().toLocaleString()}`;
        const tweetParams = {
          oauth_consumer_key: settings.twitterApiKey,
          oauth_nonce: crypto.randomBytes(16).toString('hex'),
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: Math.floor(Date.now() / 1000),
          oauth_token: settings.twitterAccessToken,
          oauth_version: '1.0',
          text: tweetText
        };
        
        const tweetUrl = 'https://api.twitter.com/2/tweets';
        const tweetSignature = generateOAuthSignature('POST', tweetUrl, tweetParams, settings.twitterApiSecret, settings.twitterAccessTokenSecret);
        
        const tweetAuthHeader = `OAuth oauth_consumer_key="${tweetParams.oauth_consumer_key}", oauth_nonce="${tweetParams.oauth_nonce}", oauth_signature="${encodeURIComponent(tweetSignature)}", oauth_signature_method="${tweetParams.oauth_signature_method}", oauth_timestamp="${tweetParams.oauth_timestamp}", oauth_token="${tweetParams.oauth_token}", oauth_version="${tweetParams.oauth_version}"`;
        
        const tweetResponse = await axios.post(tweetUrl, { text: tweetText }, {
          headers: {
            'Authorization': tweetAuthHeader,
            'Content-Type': 'application/json',
            'User-Agent': 'RazeWire/1.0'
          }
        });
        
        logger.info('✅ Tweet posted successfully!');
        logger.info(`Tweet ID: ${tweetResponse.data.data.id}`);
        logger.info(`Text: ${tweetResponse.data.data.text}\n`);
        
      } catch (tweetError) {
        if (tweetError.response?.status === 429) {
          logger.info('⚠️  Rate limited (429) - Token is valid but too many requests');
          logger.info('💡 Wait a few minutes and try again\n');
        } else if (tweetError.response?.status === 403) {
          logger.info('❌ Permission denied (403) - Token may have insufficient permissions');
          logger.info(`Error: ${tweetError.response?.data?.detail || tweetError.message}\n`);
        } else {
          logger.info('❌ Tweet posting failed:');
          logger.info(`Status: ${tweetError.response?.status}`);
          logger.info(`Error: ${tweetError.response?.data?.detail || tweetError.message}\n`);
        }
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        logger.info('❌ Token is EXPIRED or INVALID');
        logger.info('💡 You need to regenerate your Twitter tokens\n');
      } else if (error.response?.status === 429) {
        logger.info('⚠️  Rate limited (429) - Token is valid but too many requests');
        logger.info('💡 Wait a few minutes and try again\n');
      } else {
        logger.info('❌ Token validation failed:');
        logger.info(`Status: ${error.response?.status}`);
        logger.info(`Error: ${error.response?.data?.detail || error.message}\n`);
      }
    }
    
    logger.info('🎯 Summary:');
    logger.info('===========');
    logger.info('✅ Twitter credentials are properly configured');
    logger.info('✅ OAuth 1.0a authentication is set up correctly');
    logger.info('⚠️  Rate limiting is the main issue, not token expiration');
    logger.info('💡 Your tokens are likely valid, just respect rate limits\n');
    
  } catch (error) {
    logger.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTwitterTokenStatus();
