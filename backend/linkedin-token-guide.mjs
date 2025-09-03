import logger from '../utils/logger.mjs';
#!/usr/bin/env node

logger.info('🔗 LinkedIn Token Setup Guide');
logger.info('=============================\n');

logger.info('❌ Your LinkedIn access token has insufficient permissions');
logger.info('🔧 Here\'s how to fix it:\n');

logger.info('📋 STEP 1: Get New Access Token');
logger.info('1. Go to: https://www.linkedin.com/developers/tools/oauth/playground');
logger.info('2. Enter your credentials:');
logger.info('   - Client ID: 86fluuypixnml0');
logger.info('   - Client Secret: (your current secret)');
logger.info('3. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
logger.info('4. Select these scopes:');
logger.info('   ✅ r_liteprofile');
logger.info('   ✅ w_member_social');
logger.info('   ✅ r_organization_social');
logger.info('   ✅ w_organization_social');
logger.info('5. Click "Request Token"');
logger.info('6. Copy the access token and refresh token\n');

logger.info('📋 STEP 2: Update Your Settings');
logger.info('1. Go to: Admin → System → Auto-Posting → LinkedIn');
logger.info('2. Update the Access Token with the new one');
logger.info('3. Add the Refresh Token');
logger.info('4. Verify Organization ID is: 108162812');
logger.info('5. Test the connection\n');

logger.info('📋 STEP 3: Test LinkedIn Posting');
logger.info('1. Click "Test Connection" in the LinkedIn tab');
logger.info('2. If successful, try a manual test post');
logger.info('3. Check your LinkedIn page for the test post\n');

logger.info('🎯 Expected Results:');
logger.info('✅ Access token with correct permissions');
logger.info('✅ Refresh token for automatic renewal');
logger.info('✅ Organization access (108162812)');
logger.info('✅ Successful test posts to LinkedIn\n');

logger.info('🚨 If Still Having Issues:');
logger.info('1. Check if you have admin access to the organization');
logger.info('2. Verify the organization ID is correct');
logger.info('3. Ensure your LinkedIn app has the required scopes');
logger.info('4. Try posting to personal profile first (leave Organization ID empty)\n');

logger.info('💡 Pro Tips:');
logger.info('• Start with personal profile posting to test basic functionality');
logger.info('• Then move to organization posting once personal works');
logger.info('• Save both access token and refresh token securely');
logger.info('• Test with small posts before enabling auto-posting\n');

logger.info('📞 Need Help?');
logger.info('• LinkedIn Developer Docs: https://developer.linkedin.com/docs');
logger.info('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2');
logger.info('• Marketing API: https://developer.linkedin.com/docs/marketing-api');
