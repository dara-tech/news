#!/usr/bin/env node
import logger from './utils/logger.mjs';

logger.info('🔗 LinkedIn Permissions Fix');
logger.info('===========================\n');

logger.info('❌ Current Issue:');
logger.info('Your LinkedIn access token has insufficient permissions');
logger.info('Error: "Not enough permissions to access: me.GET.NO_VERSION"\n');

logger.info('🔧 Solution: Get New Tokens with Correct Permissions\n');

logger.info('📋 STEP 1: Go to LinkedIn OAuth Playground');
logger.info('URL: https://www.linkedin.com/developers/tools/oauth/playground\n');

logger.info('📋 STEP 2: Enter Your Credentials');
logger.info('Client ID: 86fluuypixnml0');
logger.info('Client Secret: WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==');
logger.info('Redirect URI: https://www.linkedin.com/developers/tools/oauth/playground\n');

logger.info('📋 STEP 3: Select ALL Required Scopes');
logger.info('✅ r_liteprofile (Read your profile) - REQUIRED');
logger.info('✅ w_member_social (Write posts to your profile) - REQUIRED');
logger.info('✅ r_organization_social (Read organization posts) - REQUIRED');
logger.info('✅ w_organization_social (Write posts to organization) - REQUIRED\n');

logger.info('📋 STEP 4: Generate New Tokens');
logger.info('1. Click "Request Token" button');
logger.info('2. Authorize the app when prompted');
logger.info('3. Copy BOTH tokens from the response\n');

logger.info('📋 STEP 5: Update Your Settings');
logger.info('1. Go to: Admin → System → Auto-Posting → LinkedIn');
logger.info('2. Replace the Access Token with the new one');
logger.info('3. Replace the Refresh Token with the new one');
logger.info('4. Verify Organization ID is: 108162812');
logger.info('5. Test the connection\n');

logger.info('🎯 Expected Results:');
logger.info('✅ Profile access successful');
logger.info('✅ Organization access successful');
logger.info('✅ Test post creation successful');
logger.info('✅ LinkedIn auto-posting working\n');

logger.info('🚨 Critical Points:');
logger.info('• You MUST select ALL 4 scopes listed above');
logger.info('• The r_liteprofile scope is essential for basic API access');
logger.info('• Without proper scopes, you get "Not enough permissions" errors');
logger.info('• Old tokens with wrong permissions won\'t work\n');

logger.info('💡 Pro Tips:');
logger.info('• Clear your browser cache before trying again');
logger.info('• Make sure you\'re logged into the correct LinkedIn account');
logger.info('• Ensure you have admin access to organization 108162812');
logger.info('• Test with a small post first\n');

logger.info('1. After updating tokens, run: node test-linkedin-specific.mjs');
logger.info('2. Check that "Profile Access" shows ✅');
logger.info('3. Check that "Organization Access" shows ✅');
logger.info('4. Check that "Test Post Creation" shows ✅\n');

logger.info('📞 If Still Having Issues:');
logger.info('• Check LinkedIn Developer Console app settings');
logger.info('• Verify app is approved and active');
logger.info('• Ensure redirect URI matches exactly');
logger.info('• Contact LinkedIn support if app issues persist\n');

logger.info('🎉 Once you have the correct tokens, LinkedIn will work perfectly!');
