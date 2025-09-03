import logger from '../utils/logger.mjs';
#!/usr/bin/env node

logger.info('🔗 LinkedIn Refresh Token Guide');
logger.info('===============================\n');

logger.info('📋 STEP 1: Go to LinkedIn OAuth Playground');
logger.info('URL: https://www.linkedin.com/developers/tools/oauth/playground\n');

logger.info('📋 STEP 2: Enter Your Credentials');
logger.info('Client ID: 86fluuypixnml0');
logger.info('Client Secret: WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==');
logger.info('Redirect URI: https://www.linkedin.com/developers/tools/oauth/playground\n');

logger.info('📋 STEP 3: Select These Scopes');
logger.info('✅ r_liteprofile (Read your profile)');
logger.info('✅ w_member_social (Write posts to your profile)');
logger.info('✅ r_organization_social (Read organization posts)');
logger.info('✅ w_organization_social (Write posts to organization)\n');

logger.info('📋 STEP 4: Generate Tokens');
logger.info('1. Click "Request Token" button');
logger.info('2. Authorize the app when prompted');
logger.info('3. Copy both tokens from the response\n');

logger.info('📋 STEP 5: Copy Both Tokens');
logger.info('The response will look like:');
logger.info('{');
logger.info('  "access_token": "AQW...",');
logger.info('  "refresh_token": "AQW...",');
logger.info('  "expires_in": 3600');
logger.info('}');
logger.info('');
logger.info('Copy both the access_token and refresh_token values!\n');

logger.info('📋 STEP 6: Update Your Settings');
logger.info('1. Go to: Admin → System → Auto-Posting → LinkedIn');
logger.info('2. Paste the new Access Token');
logger.info('3. Paste the new Refresh Token');
logger.info('4. Verify Organization ID is: 108162812');
logger.info('5. Test the connection\n');

logger.info('🎯 Expected Result:');
logger.info('✅ LinkedIn connection successful');
logger.info('✅ Auto-posting to organization 108162812');
logger.info('✅ Posts appear on your LinkedIn company page\n');

logger.info('🚨 If You Get Errors:');
logger.info('• Make sure all scopes are selected');
logger.info('• Check that Client ID and Secret are correct');
logger.info('• Verify Redirect URI matches exactly');
logger.info('• Ensure you have admin access to the organization\n');

logger.info('💡 Pro Tips:');
logger.info('• Save both tokens securely');
logger.info('• Test with a small post first');
logger.info('• Check your LinkedIn company page for test posts');
logger.info('• The refresh token lasts 60 days\n');

logger.info('📞 Need Help?');
logger.info('• LinkedIn Developer Docs: https://developer.linkedin.com/docs');
logger.info('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2');
logger.info('• Marketing API: https://developer.linkedin.com/docs/marketing-api\n');

logger.info('🎉 Once you have the refresh token, LinkedIn auto-posting will work perfectly!');
