#!/usr/bin/env node

console.log('🔗 LinkedIn Permissions Fix');
console.log('===========================\n');

console.log('❌ Current Issue:');
console.log('Your LinkedIn access token has insufficient permissions');
console.log('Error: "Not enough permissions to access: me.GET.NO_VERSION"\n');

console.log('🔧 Solution: Get New Tokens with Correct Permissions\n');

console.log('📋 STEP 1: Go to LinkedIn OAuth Playground');
console.log('URL: https://www.linkedin.com/developers/tools/oauth/playground\n');

console.log('📋 STEP 2: Enter Your Credentials');
console.log('Client ID: 86fluuypixnml0');
console.log('Client Secret: WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==');
console.log('Redirect URI: https://www.linkedin.com/developers/tools/oauth/playground\n');

console.log('📋 STEP 3: Select ALL Required Scopes');
console.log('✅ r_liteprofile (Read your profile) - REQUIRED');
console.log('✅ w_member_social (Write posts to your profile) - REQUIRED');
console.log('✅ r_organization_social (Read organization posts) - REQUIRED');
console.log('✅ w_organization_social (Write posts to organization) - REQUIRED\n');

console.log('📋 STEP 4: Generate New Tokens');
console.log('1. Click "Request Token" button');
console.log('2. Authorize the app when prompted');
console.log('3. Copy BOTH tokens from the response\n');

console.log('📋 STEP 5: Update Your Settings');
console.log('1. Go to: Admin → System → Auto-Posting → LinkedIn');
console.log('2. Replace the Access Token with the new one');
console.log('3. Replace the Refresh Token with the new one');
console.log('4. Verify Organization ID is: 108162812');
console.log('5. Test the connection\n');

console.log('🎯 Expected Results:');
console.log('✅ Profile access successful');
console.log('✅ Organization access successful');
console.log('✅ Test post creation successful');
console.log('✅ LinkedIn auto-posting working\n');

console.log('🚨 Critical Points:');
console.log('• You MUST select ALL 4 scopes listed above');
console.log('• The r_liteprofile scope is essential for basic API access');
console.log('• Without proper scopes, you get "Not enough permissions" errors');
console.log('• Old tokens with wrong permissions won\'t work\n');

console.log('💡 Pro Tips:');
console.log('• Clear your browser cache before trying again');
console.log('• Make sure you\'re logged into the correct LinkedIn account');
console.log('• Ensure you have admin access to organization 108162812');
console.log('• Test with a small post first\n');

console.log('🔍 Verification Steps:');
console.log('1. After updating tokens, run: node test-linkedin-specific.mjs');
console.log('2. Check that "Profile Access" shows ✅');
console.log('3. Check that "Organization Access" shows ✅');
console.log('4. Check that "Test Post Creation" shows ✅\n');

console.log('📞 If Still Having Issues:');
console.log('• Check LinkedIn Developer Console app settings');
console.log('• Verify app is approved and active');
console.log('• Ensure redirect URI matches exactly');
console.log('• Contact LinkedIn support if app issues persist\n');

console.log('🎉 Once you have the correct tokens, LinkedIn will work perfectly!');
