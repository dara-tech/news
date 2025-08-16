#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function checkTwitterCredentials() {
  console.log('🐦 Twitter Credentials Check');
  console.log('===========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Twitter settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Twitter Configuration:');
    console.log(`API Key: ${settings.twitterApiKey ? 'Set' : 'Not set'}`);
    console.log(`API Secret: ${settings.twitterApiSecret ? 'Set' : 'Not set'}`);
    console.log(`Access Token: ${settings.twitterAccessToken ? 'Set' : 'Not set'}`);
    console.log(`Access Token Secret: ${settings.twitterAccessTokenSecret ? 'Set' : 'Not set'}`);
    console.log(`Enabled: ${settings.twitterEnabled}\n`);

    if (!settings.twitterEnabled) {
      console.log('❌ Twitter is not enabled');
      return;
    }

    // Check what type of credentials we have
    console.log('🔍 Credential Analysis:');
    
    if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && settings.twitterAccessTokenSecret) {
      console.log('✅ OAuth 1.0a User Context - Complete');
      console.log('   This is the correct setup for posting tweets\n');
    } else if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && !settings.twitterAccessTokenSecret) {
      console.log('⚠️  OAuth 2.0 Application-Only - Incomplete');
      console.log('   Missing Access Token Secret for user context\n');
    } else if (settings.twitterAccessToken && !settings.twitterApiKey) {
      console.log('⚠️  OAuth 2.0 Bearer Token - Limited');
      console.log('   Can only read public data, cannot post\n');
    } else {
      console.log('❌ Incomplete Twitter credentials');
      console.log('   Missing required fields for posting\n');
    }

    // Test with OAuth 1.0a if we have all credentials
    if (settings.twitterApiKey && settings.twitterApiSecret && settings.twitterAccessToken && settings.twitterAccessTokenSecret) {
      console.log('🧪 Testing OAuth 1.0a User Context...');
      
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

        console.log('✅ OAuth 1.0a User Context Test Successful!');
        console.log(`User ID: ${userResponse.data.data.id}`);
        console.log(`Username: ${userResponse.data.data.username}`);
        console.log(`Name: ${userResponse.data.data.name}\n`);

        // Test posting a tweet
        console.log('🧪 Testing Tweet Creation...');
        
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

        console.log('✅ Tweet Created Successfully!');
        console.log(`Tweet ID: ${postResponse.data.data.id}`);
        console.log(`Tweet URL: https://twitter.com/${userResponse.data.data.username}/status/${postResponse.data.data.id}\n`);

        console.log('🎉 Twitter/X is working perfectly with OAuth 1.0a!');
        console.log('✅ All credentials are correct');
        console.log('✅ User context authentication works');
        console.log('✅ Tweet posting works\n');

      } catch (error) {
        console.log('❌ OAuth 1.0a test failed');
        console.log(`Status: ${error.response?.status}`);
        console.log(`Error: ${error.response?.data?.detail || error.response?.data?.message || error.message}`);
        
        if (error.response?.data) {
          console.log('\n📋 Full Error Response:');
          console.log(JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      console.log('❌ Cannot test - missing required credentials');
      console.log('\n🔧 To fix Twitter/X posting, you need:');
      console.log('1. API Key (Consumer Key)');
      console.log('2. API Secret (Consumer Secret)');
      console.log('3. Access Token');
      console.log('4. Access Token Secret');
      console.log('\n💡 Get these from: https://developer.twitter.com/en/portal/dashboard');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkTwitterCredentials();
