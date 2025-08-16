#!/usr/bin/env node

console.log('🔗 LinkedIn Refresh Token Guide');
console.log('===============================\n');

console.log('📋 STEP 1: Go to LinkedIn OAuth Playground');
console.log('URL: https://www.linkedin.com/developers/tools/oauth/playground\n');

console.log('📋 STEP 2: Enter Your Credentials');
console.log('Client ID: 86fluuypixnml0');
console.log('Client Secret: WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==');
console.log('Redirect URI: https://www.linkedin.com/developers/tools/oauth/playground\n');

console.log('📋 STEP 3: Select These Scopes');
console.log('✅ r_liteprofile (Read your profile)');
console.log('✅ w_member_social (Write posts to your profile)');
console.log('✅ r_organization_social (Read organization posts)');
console.log('✅ w_organization_social (Write posts to organization)\n');

console.log('📋 STEP 4: Generate Tokens');
console.log('1. Click "Request Token" button');
console.log('2. Authorize the app when prompted');
console.log('3. Copy both tokens from the response\n');

console.log('📋 STEP 5: Copy Both Tokens');
console.log('The response will look like:');
console.log('{');
console.log('  "access_token": "AQW...",');
console.log('  "refresh_token": "AQW...",');
console.log('  "expires_in": 3600');
console.log('}');
console.log('');
console.log('Copy both the access_token and refresh_token values!\n');

console.log('📋 STEP 6: Update Your Settings');
console.log('1. Go to: Admin → System → Auto-Posting → LinkedIn');
console.log('2. Paste the new Access Token');
console.log('3. Paste the new Refresh Token');
console.log('4. Verify Organization ID is: 108162812');
console.log('5. Test the connection\n');

console.log('🎯 Expected Result:');
console.log('✅ LinkedIn connection successful');
console.log('✅ Auto-posting to organization 108162812');
console.log('✅ Posts appear on your LinkedIn company page\n');

console.log('🚨 If You Get Errors:');
console.log('• Make sure all scopes are selected');
console.log('• Check that Client ID and Secret are correct');
console.log('• Verify Redirect URI matches exactly');
console.log('• Ensure you have admin access to the organization\n');

console.log('💡 Pro Tips:');
console.log('• Save both tokens securely');
console.log('• Test with a small post first');
console.log('• Check your LinkedIn company page for test posts');
console.log('• The refresh token lasts 60 days\n');

console.log('📞 Need Help?');
console.log('• LinkedIn Developer Docs: https://developer.linkedin.com/docs');
console.log('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2');
console.log('• Marketing API: https://developer.linkedin.com/docs/marketing-api\n');

console.log('🎉 Once you have the refresh token, LinkedIn auto-posting will work perfectly!');
