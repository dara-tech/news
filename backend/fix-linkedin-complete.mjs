import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

async function fixLinkedInComplete() {
  console.log('🔗 LinkedIn Complete Fix Tool');
  console.log('=============================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current LinkedIn Configuration:');
    console.log(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    console.log(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    console.log(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    console.log(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    console.log(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    console.log(`Enabled: ${settings.linkedinEnabled}\n`);
    
    // Test current access token
    if (settings.linkedinAccessToken) {
      console.log('🧪 Testing current access token...');
      try {
        const testResponse = await axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${settings.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        console.log('✅ Access token is valid!');
        console.log(`User: ${testResponse.data.localizedFirstName} ${testResponse.data.localizedLastName}`);
        console.log(`Profile ID: ${testResponse.data.id}`);
        
        // Test organization access
        if (settings.linkedinOrganizationId) {
          console.log('\n🏢 Testing organization access...');
          try {
            const orgResponse = await axios.get(`https://api.linkedin.com/v2/organizations/${settings.linkedinOrganizationId}`, {
              headers: {
                'Authorization': `Bearer ${settings.linkedinAccessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
              },
              params: {
                projection: '(id,name,localizedName)'
              }
            });
            
            console.log('✅ Organization access successful!');
            console.log(`Organization: ${orgResponse.data.localizedName || orgResponse.data.name}`);
            console.log(`Organization ID: ${orgResponse.data.id}`);
            
          } catch (orgError) {
            console.log('❌ Organization access failed:', orgError.response?.data?.message || orgError.message);
            console.log('💡 This might be because:');
            console.log('   - You don\'t have admin access to this organization');
            console.log('   - Organization ID is incorrect');
            console.log('   - Access token doesn\'t have organization permissions');
          }
        }
        
      } catch (error) {
        console.log('❌ Access token is invalid or expired:', error.response?.data?.message || error.message);
        console.log('💡 You need to get a new access token');
      }
    }
    
    // Instructions for getting refresh token
    console.log('\n📝 To get LinkedIn Refresh Token:');
    console.log('1. Go to: https://www.linkedin.com/developers/tools/oauth/playground');
    console.log('2. Enter your credentials:');
    console.log(`   - Client ID: ${settings.linkedinClientId || 'YOUR_CLIENT_ID'}`);
    console.log(`   - Client Secret: ${settings.linkedinClientSecret ? 'SET' : 'YOUR_CLIENT_SECRET'}`);
    console.log('3. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
    console.log('4. Select scopes:');
    console.log('   - r_liteprofile');
    console.log('   - w_member_social');
    console.log('   - r_organization_social');
    console.log('   - w_organization_social');
    console.log('5. Click "Request Token"');
    console.log('6. Copy the refresh token from the response\n');
    
    // Test LinkedIn posting
    console.log('🧪 Testing LinkedIn posting...');
    try {
      const socialMediaService = (await import('./services/socialMediaService.mjs')).default;
      const testArticle = {
        title: { en: 'Test: LinkedIn Fix' },
        description: { en: 'This is a test to verify LinkedIn auto-posting is working correctly.' },
        slug: 'test-linkedin-fix',
        category: { name: { en: 'Test' } }
      };
      
      const result = await socialMediaService.postToLinkedIn(
        { platform: 'linkedin', url: '' },
        testArticle,
        settings
      );
      
      console.log('✅ LinkedIn posting successful!');
      console.log(`Post ID: ${result.postId}`);
      console.log(`URL: ${result.url}`);
      
    } catch (error) {
      console.log('❌ LinkedIn posting failed:', error.message);
      console.log('\n🔧 Common fixes:');
      console.log('1. Get a new access token with correct permissions');
      console.log('2. Ensure you have admin access to the organization');
      console.log('3. Verify the organization ID is correct');
      console.log('4. Check that your LinkedIn app has the required scopes');
    }
    
    // Summary and next steps
    console.log('\n📋 Summary:');
    console.log(`✅ Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    console.log(`✅ Client ID: ${settings.linkedinClientId ? 'Set' : 'Not set'}`);
    console.log(`✅ Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    console.log(`✅ Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    console.log(`❌ Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Get refresh token from LinkedIn OAuth Playground');
    console.log('2. Add refresh token to admin panel');
    console.log('3. Test connection in admin panel');
    console.log('4. Enable LinkedIn auto-posting');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixLinkedInComplete();
