#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import SocialMediaService from './services/socialMediaService.mjs';

dotenv.config();

async function testLinkedInSpecific() {
  console.log('🔗 LinkedIn Specific Test');
  console.log('========================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get LinkedIn settings
    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 LinkedIn Configuration:');
    console.log(`Client ID: ${settings.linkedinClientId || 'Not set'}`);
    console.log(`Client Secret: ${settings.linkedinClientSecret ? 'Set' : 'Not set'}`);
    console.log(`Access Token: ${settings.linkedinAccessToken ? 'Set' : 'Not set'}`);
    console.log(`Refresh Token: ${settings.linkedinRefreshToken ? 'Set' : 'Not set'}`);
    console.log(`Organization ID: ${settings.linkedinOrganizationId || 'Not set'}`);
    console.log(`Enabled: ${settings.linkedinEnabled}\n`);

    if (!settings.linkedinEnabled) {
      console.log('❌ LinkedIn is not enabled');
      return;
    }

    if (!settings.linkedinAccessToken) {
      console.log('❌ LinkedIn Access Token is not set');
      console.log('💡 Follow the guide: node get-linkedin-refresh-token.mjs');
      return;
    }

    // Test LinkedIn API directly
    console.log('🧪 Testing LinkedIn API Access...');
    
    try {
      const axios = await import('axios');
      
      // Test 1: Check if we can access the profile
      console.log('\n📋 Test 1: Profile Access');
      const profileResponse = await axios.default.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log('✅ Profile access successful');
      console.log(`Profile ID: ${profileResponse.data.id}`);
      console.log(`Name: ${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}\n`);

      // Test 2: Check organization access
      if (settings.linkedinOrganizationId) {
        console.log('📋 Test 2: Organization Access');
        try {
          const orgResponse = await axios.default.get(`https://api.linkedin.com/v2/organizations/${settings.linkedinOrganizationId}`, {
            headers: {
              'Authorization': `Bearer ${settings.linkedinAccessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });
          console.log('✅ Organization access successful');
          console.log(`Organization: ${orgResponse.data.localizedName}\n`);
        } catch (orgError) {
          console.log('❌ Organization access failed');
          console.log(`Error: ${orgError.response?.data?.message || orgError.message}\n`);
        }
      }

      // Test 3: Check organizational entity ACLs
      console.log('📋 Test 3: Organization Permissions');
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
        console.log('✅ Organization permissions check successful');
        console.log(`Found ${aclResponse.data.elements?.length || 0} organization access entries\n`);
      } catch (aclError) {
        console.log('❌ Organization permissions check failed');
        console.log(`Error: ${aclError.response?.data?.message || aclError.message}\n`);
      }

      // Test 4: Try to create a test post
      console.log('📋 Test 4: Test Post Creation');
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

      console.log('📝 Post Data:');
      console.log(JSON.stringify(testPostData, null, 2));

      const postResponse = await axios.default.post('https://api.linkedin.com/v2/ugcPosts', testPostData, {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Test post created successfully!');
      console.log(`Post ID: ${postResponse.data.id}\n`);

    } catch (apiError) {
      console.log('❌ LinkedIn API test failed');
      console.log(`Status: ${apiError.response?.status}`);
      console.log(`Error: ${apiError.response?.data?.message || apiError.message}`);
      
      if (apiError.response?.data) {
        console.log('\n📋 Full Error Response:');
        console.log(JSON.stringify(apiError.response.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLinkedInSpecific();
