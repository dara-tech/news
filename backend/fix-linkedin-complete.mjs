import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import logger from '../utils/logger.mjs';

dotenv.config();

async function fixLinkedInComplete() {
  logger.info('🔗 LinkedIn Complete Fix Tool');
  logger.info('=============================\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Get current settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current LinkedIn Configuration:');
    logger.info(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    logger.info(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    logger.info(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    logger.info(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    logger.info(`Enabled: ${settings.linkedinEnabled}\n`);
    
    // Test current access token
    if (settings.linkedinAccessToken) {
      logger.info('🧪 Testing current access token...');
      try {
        const testResponse = await axios.get('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${settings.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        
        logger.info('✅ Access token is valid!');
        logger.info(`User: ${testResponse.data.localizedFirstName} ${testResponse.data.localizedLastName}`);
        logger.info(`Profile ID: ${testResponse.data.id}`);
        
        // Test organization access
        if (settings.linkedinOrganizationId) {
          logger.info('\n🏢 Testing organization access...');
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
            
            logger.info('✅ Organization access successful!');
            logger.info(`Organization: ${orgResponse.data.localizedName || orgResponse.data.name}`);
            logger.info(`Organization ID: ${orgResponse.data.id}`);
            
          } catch (orgError) {
            logger.info('❌ Organization access failed:', orgError.response?.data?.message || orgError.message);
            logger.info('💡 This might be because:');
            logger.info('   - You don\'t have admin access to this organization');
            logger.info('   - Organization ID is incorrect');
            logger.info('   - Access token doesn\'t have organization permissions');
          }
        }
        
      } catch (error) {
        logger.info('❌ Access token is invalid or expired:', error.response?.data?.message || error.message);
        logger.info('💡 You need to get a new access token');
      }
    }
    
    // Instructions for getting refresh token
    logger.info('\n📝 To get LinkedIn Refresh Token:');
    logger.info('1. Go to: https://www.linkedin.com/developers/tools/oauth/playground');
    logger.info('2. Enter your credentials:');
    logger.info(`   - Client ID: ${settings.linkedinClientId || 'YOUR_CLIENT_ID'}`);
    logger.info(`   - Client Secret: ${settings.linkedinClientSecret ? 'SET' : 'YOUR_CLIENT_SECRET'}`);
    logger.info('3. Add redirect URI: https://www.linkedin.com/developers/tools/oauth/playground');
    logger.info('4. Select scopes:');
    logger.info('   - r_liteprofile');
    logger.info('   - w_member_social');
    logger.info('   - r_organization_social');
    logger.info('   - w_organization_social');
    logger.info('5. Click "Request Token"');
    logger.info('6. Copy the refresh token from the response\n');
    
    // Test LinkedIn posting
    logger.info('🧪 Testing LinkedIn posting...');
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
      
      logger.info('✅ LinkedIn posting successful!');
      logger.info(`Post ID: ${result.postId}`);
      logger.info(`URL: ${result.url}`);
      
    } catch (error) {
      logger.info('❌ LinkedIn posting failed:', error.message);
      logger.info('\n🔧 Common fixes:');
      logger.info('1. Get a new access token with correct permissions');
      logger.info('2. Ensure you have admin access to the organization');
      logger.info('3. Verify the organization ID is correct');
      logger.info('4. Check that your LinkedIn app has the required scopes');
    }
    
    // Summary and next steps
    logger.info('\n📋 Summary:');
    logger.info(`✅ Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    logger.info(`✅ Client ID: ${settings.linkedinClientId ? 'Set' : 'Not set'}`);
    logger.info(`✅ Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    logger.info(`✅ Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`❌ Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    
    logger.info('\n🎯 Next Steps:');
    logger.info('1. Get refresh token from LinkedIn OAuth Playground');
    logger.info('2. Add refresh token to admin panel');
    logger.info('3. Test connection in admin panel');
    logger.info('4. Enable LinkedIn auto-posting');
    
  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the fix
fixLinkedInComplete();
