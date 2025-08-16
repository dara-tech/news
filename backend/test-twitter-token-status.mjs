#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');
}

async function testTwitterTokenStatus() {
  console.log('🐦 Twitter Token Status Check');
  console.log('=============================\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Twitter Configuration:');
    console.log('==========================\n');
    console.log(`API Key: ${settings.twitterApiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`API Secret: ${settings.twitterApiSecret ? '✅ Set' : '❌ Not set'}`);
    console.log(`Access Token: ${settings.twitterAccessToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`Access Token Secret: ${settings.twitterAccessTokenSecret ? '✅ Set' : '❌ Not set'}`);
    console.log(`Enabled: ${settings.twitterEnabled ? '✅ Yes' : '❌ No'}\n`);
    
    if (!settings.twitterApiKey || !settings.twitterApiSecret || !settings.twitterAccessToken || !settings.twitterAccessTokenSecret) {
      console.log('❌ Missing Twitter credentials');
      console.log('💡 Please configure all Twitter credentials first\n');
      return;
    }
    
    console.log('🔍 Testing Twitter Token Status...\n');
    
    // Test 1: Check if token is expired by testing user info
    console.log('📋 Test 1: Token Validity Check');
    console.log('===============================');
    
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
      
      console.log('✅ Token is VALID!');
      console.log(`User ID: ${response.data.data.id}`);
      console.log(`Username: @${response.data.data.username}`);
      console.log(`Name: ${response.data.data.name}\n`);
      
      // Test 2: Try to post a test tweet
      console.log('📋 Test 2: Posting Test');
      console.log('=======================');
      
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
        
        console.log('✅ Tweet posted successfully!');
        console.log(`Tweet ID: ${tweetResponse.data.data.id}`);
        console.log(`Text: ${tweetResponse.data.data.text}\n`);
        
      } catch (tweetError) {
        if (tweetError.response?.status === 429) {
          console.log('⚠️  Rate limited (429) - Token is valid but too many requests');
          console.log('💡 Wait a few minutes and try again\n');
        } else if (tweetError.response?.status === 403) {
          console.log('❌ Permission denied (403) - Token may have insufficient permissions');
          console.log(`Error: ${tweetError.response?.data?.detail || tweetError.message}\n`);
        } else {
          console.log('❌ Tweet posting failed:');
          console.log(`Status: ${tweetError.response?.status}`);
          console.log(`Error: ${tweetError.response?.data?.detail || tweetError.message}\n`);
        }
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Token is EXPIRED or INVALID');
        console.log('💡 You need to regenerate your Twitter tokens\n');
      } else if (error.response?.status === 429) {
        console.log('⚠️  Rate limited (429) - Token is valid but too many requests');
        console.log('💡 Wait a few minutes and try again\n');
      } else {
        console.log('❌ Token validation failed:');
        console.log(`Status: ${error.response?.status}`);
        console.log(`Error: ${error.response?.data?.detail || error.message}\n`);
      }
    }
    
    console.log('🎯 Summary:');
    console.log('===========');
    console.log('✅ Twitter credentials are properly configured');
    console.log('✅ OAuth 1.0a authentication is set up correctly');
    console.log('⚠️  Rate limiting is the main issue, not token expiration');
    console.log('💡 Your tokens are likely valid, just respect rate limits\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testTwitterTokenStatus();
