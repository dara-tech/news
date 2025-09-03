import logger from '../utils/logger.mjs';
#!/usr/bin/env node

logger.info('🔗 LinkedIn Token - Alternative Methods');
logger.info('=======================================\n');

logger.info('❌ Issue: LinkedIn OAuth Playground is not accessible');
logger.info('🔧 Alternative Methods to Get LinkedIn Tokens\n');

logger.info('📋 METHOD 1: LinkedIn Developer Console');
logger.info('=======================================');
logger.info('1. Go to: https://www.linkedin.com/developers/apps');
logger.info('2. Click on your app: "razewire" or similar');
logger.info('3. Go to "Auth" tab');
logger.info('4. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
logger.info('5. Go to "Products" tab');
logger.info('6. Request access to "Marketing Developer Platform"');
logger.info('7. Request these permissions:');
logger.info('   - r_liteprofile');
logger.info('   - w_member_social');
logger.info('   - r_organization_social');
logger.info('   - w_organization_social');
logger.info('8. Wait for approval (may take 24-48 hours)\n');

logger.info('📋 METHOD 2: Manual OAuth Flow');
logger.info('==============================');
logger.info('1. Create this authorization URL:');
logger.info('https://www.linkedin.com/oauth/v2/authorization?');
logger.info('response_type=code&');
logger.info('client_id=86fluuypixnml0&');
logger.info('redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground&');
logger.info('scope=r_liteprofile%20w_member_social%20r_organization_social%20w_organization_social&');
logger.info('state=razewire123');
logger.info('');
logger.info('2. Visit this URL in your browser');
logger.info('3. Authorize the application');
logger.info('4. Copy the authorization code from the redirect URL');
logger.info('5. Use curl to exchange code for tokens:\n');

logger.info('📋 METHOD 3: LinkedIn Marketing API');
logger.info('===================================');
logger.info('1. Go to: https://www.linkedin.com/developers/apps');
logger.info('2. Select your app');
logger.info('3. Go to "Products" tab');
logger.info('4. Add "Marketing Developer Platform"');
logger.info('5. Request organization access');
logger.info('6. Use the Marketing API endpoints\n');

logger.info('📋 METHOD 4: LinkedIn Postman Collection');
logger.info('========================================');
logger.info('1. Download LinkedIn API Postman Collection');
logger.info('2. Import into Postman');
logger.info('3. Set up OAuth 2.0 authentication');
logger.info('4. Use the collection to get tokens\n');

logger.info('🔧 Quick Fix: Manual Token Exchange');
logger.info('===================================');
logger.info('If you have an authorization code, use this curl command:');
logger.info('');
logger.info('curl -X POST https://www.linkedin.com/oauth/v2/accessToken \\');
logger.info('  -H "Content-Type: application/x-www-form-urlencoded" \\');
logger.info('  -d "grant_type=authorization_code" \\');
logger.info('  -d "code=YOUR_AUTHORIZATION_CODE" \\');
logger.info('  -d "client_id=86fluuypixnml0" \\');
logger.info('  -d "client_secret=WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==" \\');
logger.info('  -d "redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground"');
logger.info('');

logger.info('📋 METHOD 5: LinkedIn App Review Process');
logger.info('========================================');
logger.info('1. Go to LinkedIn Developer Console');
logger.info('2. Submit your app for review');
logger.info('3. Request these permissions:');
logger.info('   - r_liteprofile');
logger.info('   - w_member_social');
logger.info('   - r_organization_social');
logger.info('   - w_organization_social');
logger.info('4. Wait for approval (1-2 weeks)');
logger.info('5. Use approved app credentials\n');

logger.info('🚨 Important Notes:');
logger.info('• LinkedIn has strict app review process');
logger.info('• Some permissions require app approval');
logger.info('• Organization posting requires admin access');
logger.info('• Tokens expire and need refresh\n');

logger.info('💡 Recommended Approach:');
logger.info('1. Try Method 1 (Developer Console) first');
logger.info('2. If that fails, use Method 2 (Manual OAuth)');
logger.info('3. For production, complete Method 5 (App Review)');
logger.info('4. Always test with small posts first\n');

logger.info('📞 LinkedIn Developer Resources:');
logger.info('• Developer Console: https://www.linkedin.com/developers/apps');
logger.info('• API Documentation: https://developer.linkedin.com/docs');
logger.info('• Marketing API: https://developer.linkedin.com/docs/marketing-api');
logger.info('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2\n');

logger.info('🎯 Next Steps:');
logger.info('1. Try accessing the Developer Console');
logger.info('2. Check your app permissions');
logger.info('3. Request necessary scopes');
logger.info('4. Generate new tokens with correct permissions');
logger.info('5. Test with: node test-linkedin-specific.mjs\n');

logger.info('🎉 Once you have the correct tokens, LinkedIn auto-posting will work!');
