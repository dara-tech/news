#!/usr/bin/env node

console.log('🔗 LinkedIn Token Setup Guide');
console.log('=============================\n');

console.log('❌ Your LinkedIn access token has insufficient permissions');
console.log('🔧 Here\'s how to fix it:\n');

console.log('📋 STEP 1: Get New Access Token');
console.log('1. Go to: https://www.linkedin.com/developers/tools/oauth/playground');
console.log('2. Enter your credentials:');
console.log('   - Client ID: 86fluuypixnml0');
console.log('   - Client Secret: (your current secret)');
console.log('3. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
console.log('4. Select these scopes:');
console.log('   ✅ r_liteprofile');
console.log('   ✅ w_member_social');
console.log('   ✅ r_organization_social');
console.log('   ✅ w_organization_social');
console.log('5. Click "Request Token"');
console.log('6. Copy the access token and refresh token\n');

console.log('📋 STEP 2: Update Your Settings');
console.log('1. Go to: Admin → System → Auto-Posting → LinkedIn');
console.log('2. Update the Access Token with the new one');
console.log('3. Add the Refresh Token');
console.log('4. Verify Organization ID is: 108162812');
console.log('5. Test the connection\n');

console.log('📋 STEP 3: Test LinkedIn Posting');
console.log('1. Click "Test Connection" in the LinkedIn tab');
console.log('2. If successful, try a manual test post');
console.log('3. Check your LinkedIn page for the test post\n');

console.log('🎯 Expected Results:');
console.log('✅ Access token with correct permissions');
console.log('✅ Refresh token for automatic renewal');
console.log('✅ Organization access (108162812)');
console.log('✅ Successful test posts to LinkedIn\n');

console.log('🚨 If Still Having Issues:');
console.log('1. Check if you have admin access to the organization');
console.log('2. Verify the organization ID is correct');
console.log('3. Ensure your LinkedIn app has the required scopes');
console.log('4. Try posting to personal profile first (leave Organization ID empty)\n');

console.log('💡 Pro Tips:');
console.log('• Start with personal profile posting to test basic functionality');
console.log('• Then move to organization posting once personal works');
console.log('• Save both access token and refresh token securely');
console.log('• Test with small posts before enabling auto-posting\n');

console.log('📞 Need Help?');
console.log('• LinkedIn Developer Docs: https://developer.linkedin.com/docs');
console.log('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2');
console.log('• Marketing API: https://developer.linkedin.com/docs/marketing-api');
