#!/usr/bin/env node

import readline from 'readline';
import logger from '../utils/logger.mjs';

logger.info('🔗 Manual LinkedIn OAuth Flow');
logger.info('=============================\n');

logger.info('📋 STEP 1: Authorization URL');
logger.info('Copy and paste this URL in your browser:\n');

const authUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86fluuypixnml0&redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground&scope=r_liteprofile%20w_member_social%20r_organization_social%20w_organization_social&state=razewire123';

logger.info(authUrl);
logger.info('\n📋 STEP 2: Get Authorization Code');
logger.info('1. Visit the URL above');
logger.info('2. Sign in to LinkedIn');
logger.info('3. Authorize the application');
logger.info('4. Copy the authorization code from the redirect URL');
logger.info('   (It will look like: ?code=AQR...&state=razewire123)');
logger.info('5. Paste the code below (just the code part, not the full URL)\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Enter the authorization code: ', async (authCode) => {
  if (!authCode || authCode.trim() === '') {
    logger.info('❌ No authorization code provided');
    rl.close();
    return;
  }

  logger.info('\n📋 STEP 3: Exchanging Code for Tokens');
  logger.info('Making API request...\n');

  try {
    const axios = await import('axios');
    
    const tokenResponse = await axios.default.post('https://www.linkedin.com/oauth/v2/accessToken', 
      `grant_type=authorization_code&code=${authCode.trim()}&client_id=86fluuypixnml0&client_secret=WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==&redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    logger.info('✅ Tokens received successfully!\n');
    logger.info('📋 Your LinkedIn Tokens:');
    logger.info('========================');
    logger.info(`Access Token: ${tokenResponse.data.access_token}`);
    logger.info(`Refresh Token: ${tokenResponse.data.refresh_token}`);
    logger.info(`Expires In: ${tokenResponse.data.expires_in} seconds\n`);

    logger.info('📋 STEP 4: Update Your Settings');
    logger.info('1. Go to: Admin → System → Auto-Posting → LinkedIn');
    logger.info('2. Replace the Access Token with the new one above');
    logger.info('3. Replace the Refresh Token with the new one above');
    logger.info('4. Verify Organization ID is: 108162812');
    logger.info('5. Test the connection\n');

    logger.info('📋 STEP 5: Test the Tokens');
    logger.info('Run this command to test:');
    logger.info('node test-linkedin-specific.mjs\n');

    logger.info('🎯 Expected Results:');
    logger.info('✅ Profile access successful');
    logger.info('✅ Organization access successful');
    logger.info('✅ Test post creation successful');
    logger.info('✅ LinkedIn auto-posting working\n');

    logger.info('💡 Pro Tips:');
    logger.info('• Save these tokens securely');
    logger.info('• Test with a small post first');
    logger.info('• Check your LinkedIn company page for test posts');
    logger.info('• The refresh token lasts 60 days\n');

  } catch (error) {
    logger.info('❌ Error exchanging code for tokens:');
    logger.info(`Status: ${error.response?.status}`);
    logger.info(`Error: ${error.response?.data?.error_description || error.message}`);
    
    if (error.response?.data) {
      logger.info('\n📋 Full Error Response:');
      logger.info(JSON.stringify(error.response.data, null, 2));
    }

    logger.info('\n🚨 Common Issues:');
    logger.info('• Authorization code expired (they expire quickly)');
    logger.info('• Incorrect client ID or secret');
    logger.info('• Redirect URI mismatch');
    logger.info('• App not approved for requested scopes');
    logger.info('\n💡 Try getting a fresh authorization code and try again');
  }

  rl.close();
});
