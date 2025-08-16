#!/usr/bin/env node

console.log('🔗 LinkedIn Token - Alternative Methods');
console.log('=======================================\n');

console.log('❌ Issue: LinkedIn OAuth Playground is not accessible');
console.log('🔧 Alternative Methods to Get LinkedIn Tokens\n');

console.log('📋 METHOD 1: LinkedIn Developer Console');
console.log('=======================================');
console.log('1. Go to: https://www.linkedin.com/developers/apps');
console.log('2. Click on your app: "razewire" or similar');
console.log('3. Go to "Auth" tab');
console.log('4. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
console.log('5. Go to "Products" tab');
console.log('6. Request access to "Marketing Developer Platform"');
console.log('7. Request these permissions:');
console.log('   - r_liteprofile');
console.log('   - w_member_social');
console.log('   - r_organization_social');
console.log('   - w_organization_social');
console.log('8. Wait for approval (may take 24-48 hours)\n');

console.log('📋 METHOD 2: Manual OAuth Flow');
console.log('==============================');
console.log('1. Create this authorization URL:');
console.log('https://www.linkedin.com/oauth/v2/authorization?');
console.log('response_type=code&');
console.log('client_id=86fluuypixnml0&');
console.log('redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground&');
console.log('scope=r_liteprofile%20w_member_social%20r_organization_social%20w_organization_social&');
console.log('state=razewire123');
console.log('');
console.log('2. Visit this URL in your browser');
console.log('3. Authorize the application');
console.log('4. Copy the authorization code from the redirect URL');
console.log('5. Use curl to exchange code for tokens:\n');

console.log('📋 METHOD 3: LinkedIn Marketing API');
console.log('===================================');
console.log('1. Go to: https://www.linkedin.com/developers/apps');
console.log('2. Select your app');
console.log('3. Go to "Products" tab');
console.log('4. Add "Marketing Developer Platform"');
console.log('5. Request organization access');
console.log('6. Use the Marketing API endpoints\n');

console.log('📋 METHOD 4: LinkedIn Postman Collection');
console.log('========================================');
console.log('1. Download LinkedIn API Postman Collection');
console.log('2. Import into Postman');
console.log('3. Set up OAuth 2.0 authentication');
console.log('4. Use the collection to get tokens\n');

console.log('🔧 Quick Fix: Manual Token Exchange');
console.log('===================================');
console.log('If you have an authorization code, use this curl command:');
console.log('');
console.log('curl -X POST https://www.linkedin.com/oauth/v2/accessToken \\');
console.log('  -H "Content-Type: application/x-www-form-urlencoded" \\');
console.log('  -d "grant_type=authorization_code" \\');
console.log('  -d "code=YOUR_AUTHORIZATION_CODE" \\');
console.log('  -d "client_id=86fluuypixnml0" \\');
console.log('  -d "client_secret=WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==" \\');
console.log('  -d "redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground"');
console.log('');

console.log('📋 METHOD 5: LinkedIn App Review Process');
console.log('========================================');
console.log('1. Go to LinkedIn Developer Console');
console.log('2. Submit your app for review');
console.log('3. Request these permissions:');
console.log('   - r_liteprofile');
console.log('   - w_member_social');
console.log('   - r_organization_social');
console.log('   - w_organization_social');
console.log('4. Wait for approval (1-2 weeks)');
console.log('5. Use approved app credentials\n');

console.log('🚨 Important Notes:');
console.log('• LinkedIn has strict app review process');
console.log('• Some permissions require app approval');
console.log('• Organization posting requires admin access');
console.log('• Tokens expire and need refresh\n');

console.log('💡 Recommended Approach:');
console.log('1. Try Method 1 (Developer Console) first');
console.log('2. If that fails, use Method 2 (Manual OAuth)');
console.log('3. For production, complete Method 5 (App Review)');
console.log('4. Always test with small posts first\n');

console.log('📞 LinkedIn Developer Resources:');
console.log('• Developer Console: https://www.linkedin.com/developers/apps');
console.log('• API Documentation: https://developer.linkedin.com/docs');
console.log('• Marketing API: https://developer.linkedin.com/docs/marketing-api');
console.log('• OAuth 2.0 Guide: https://developer.linkedin.com/docs/oauth2\n');

console.log('🎯 Next Steps:');
console.log('1. Try accessing the Developer Console');
console.log('2. Check your app permissions');
console.log('3. Request necessary scopes');
console.log('4. Generate new tokens with correct permissions');
console.log('5. Test with: node test-linkedin-specific.mjs\n');

console.log('🎉 Once you have the correct tokens, LinkedIn auto-posting will work!');
