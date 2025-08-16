#!/usr/bin/env node

import readline from 'readline';

console.log('🔗 Manual LinkedIn OAuth Flow');
console.log('=============================\n');

console.log('📋 STEP 1: Authorization URL');
console.log('Copy and paste this URL in your browser:\n');

const authUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86fluuypixnml0&redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground&scope=r_liteprofile%20w_member_social%20r_organization_social%20w_organization_social&state=razewire123';

console.log(authUrl);
console.log('\n📋 STEP 2: Get Authorization Code');
console.log('1. Visit the URL above');
console.log('2. Sign in to LinkedIn');
console.log('3. Authorize the application');
console.log('4. Copy the authorization code from the redirect URL');
console.log('   (It will look like: ?code=AQR...&state=razewire123)');
console.log('5. Paste the code below (just the code part, not the full URL)\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Enter the authorization code: ', async (authCode) => {
  if (!authCode || authCode.trim() === '') {
    console.log('❌ No authorization code provided');
    rl.close();
    return;
  }

  console.log('\n📋 STEP 3: Exchanging Code for Tokens');
  console.log('Making API request...\n');

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

    console.log('✅ Tokens received successfully!\n');
    console.log('📋 Your LinkedIn Tokens:');
    console.log('========================');
    console.log(`Access Token: ${tokenResponse.data.access_token}`);
    console.log(`Refresh Token: ${tokenResponse.data.refresh_token}`);
    console.log(`Expires In: ${tokenResponse.data.expires_in} seconds\n`);

    console.log('📋 STEP 4: Update Your Settings');
    console.log('1. Go to: Admin → System → Auto-Posting → LinkedIn');
    console.log('2. Replace the Access Token with the new one above');
    console.log('3. Replace the Refresh Token with the new one above');
    console.log('4. Verify Organization ID is: 108162812');
    console.log('5. Test the connection\n');

    console.log('📋 STEP 5: Test the Tokens');
    console.log('Run this command to test:');
    console.log('node test-linkedin-specific.mjs\n');

    console.log('🎯 Expected Results:');
    console.log('✅ Profile access successful');
    console.log('✅ Organization access successful');
    console.log('✅ Test post creation successful');
    console.log('✅ LinkedIn auto-posting working\n');

    console.log('💡 Pro Tips:');
    console.log('• Save these tokens securely');
    console.log('• Test with a small post first');
    console.log('• Check your LinkedIn company page for test posts');
    console.log('• The refresh token lasts 60 days\n');

  } catch (error) {
    console.log('❌ Error exchanging code for tokens:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.error_description || error.message}`);
    
    if (error.response?.data) {
      console.log('\n📋 Full Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n🚨 Common Issues:');
    console.log('• Authorization code expired (they expire quickly)');
    console.log('• Incorrect client ID or secret');
    console.log('• Redirect URI mismatch');
    console.log('• App not approved for requested scopes');
    console.log('\n💡 Try getting a fresh authorization code and try again');
  }

  rl.close();
});
