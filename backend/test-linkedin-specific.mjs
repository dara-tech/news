#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import SocialMediaService from './services/socialMediaService.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testLinkedInSpecific() {
  logger.info('🔗 LinkedIn Specific Test');
  logger.info('========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Get LinkedIn settings
    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 LinkedIn Configuration:');
    logger.info(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    logger.info(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    logger.info(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    logger.info(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    logger.info(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    logger.info(`Enabled: ${settings.linkedinEnabled}\n`);

    if (!settings.linkedinEnabled) {
      logger.info('❌ LinkedIn is not enabled');
      return;
    }

    if (!settings.linkedinAccessToken) {
      logger.info('❌ LinkedIn Access Token is not set');
      logger.info('💡 Follow the guide: node get-linkedin-refresh-token.mjs');
      return;
    }

    // Test LinkedIn API directly
    logger.info('🧪 Testing LinkedIn API Access...');
    
    try {
      const axios = await import('axios');
      
      // Test 1: Check if we can access the profile
      logger.info('\n📋 Test 1: Profile Access');
      const profileResponse = await axios.default.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      logger.info('✅ Profile access successful');
      logger.info(`Profile ID: ${profileResponse.data.id}`);
      logger.info(`Name: ${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}\n`);

      // Test 2: Check organization access
      if (settings.linkedinOrganizationId) {
        logger.info('📋 Test 2: Organization Access');
        try {
          const orgResponse = await axios.default.get(`https://api.linkedin.com/v2/organizations/${settings.linkedinOrganizationId}`, {
            headers: {
              'Authorization': `Bearer ${settings.linkedinAccessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          logger.info('✅ Organization access successful');
          logger.info(`Organization: ${orgResponse.data.localizedName}\n`);
        } catch (orgError) {
          logger.info('❌ Organization access failed');
          logger.info(`Error: ${orgError.response?.data?.message || orgError.message}\n`);
        }
      }

      // Test 3: Check organizational entity ACLs
      logger.info('📋 Test 3: Organization Permissions');
      try {
        const aclResponse = await axios.default.get('https://api.linkedin.com/v2/organizationalEntityAcls', {
          headers: {
            'Authorization': `Bearer ${settings.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          },
          params: {
            q: 'roleAssignee',
            role: 'ADMINISTRATOR'
          }
        });
        logger.info('✅ Organization permissions check successful');
        logger.info(`Found ${aclResponse.data.elements?.length || 0} organization access entries\n`);
      } catch (aclError) {
        logger.info('❌ Organization permissions check failed');
        logger.info(`Error: ${aclError.response?.data?.message || aclError.message}\n`);
      }

      // Test 4: Try to create a test post
      logger.info('📋 Test 4: Test Post Creation');
      const testPostData = {
        author: `urn:li:organization:${settings.linkedinOrganizationId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: '🔗 LinkedIn API Test Post\n\nThis is a test post to verify LinkedIn integration.\n\n#LinkedIn #API #Test'
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      logger.info('📝 Post Data:');
      logger.info(JSON.stringify(testPostData, null, 2));

      const postResponse = await axios.default.post('https://api.linkedin.com/v2/ugcPosts', testPostData, {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      });

      logger.info('✅ Test post created successfully!');
      logger.info(`Post ID: ${postResponse.data.id}\n`);

    } catch (apiError) {
      logger.info('❌ LinkedIn API test failed');
      logger.info(`Status: ${apiError.response?.status}`);
      logger.info(`Error: ${apiError.response?.data?.message || apiError.message}`);
      
      if (apiError.response?.data) {
        logger.info('\n📋 Full Error Response:');
        logger.info(JSON.stringify(apiError.response.data, null, 2));
      }
    }

  } catch (error) {
    logger.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLinkedInSpecific();
