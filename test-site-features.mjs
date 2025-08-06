import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';
let adminToken = '';
let userToken = '';
let testCommentId = '';

// Test configuration
const testConfig = {
  adminUser: {
    email: 'admin@example.com',
    password: '123456'
  },
  regularUser: {
    email: 'admin@example.com',
    password: '123456'
  },
  testNewsId: '507f1f77bcf86cd799439011' // Mock news ID
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test 1: Login as admin
const testAdminLogin = async () => {
  console.log('\n🔐 Test 1: Admin Login');
  
  const result = await makeRequest('POST', '/auth/login', testConfig.adminUser);
  
  if (result.success) {
    adminToken = result.data.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
};

// Test 2: Get current settings
const testGetSettings = async () => {
  console.log('\n⚙️ Test 2: Get Current Settings');
  
  const result = await makeRequest('GET', '/admin/settings/general', null, adminToken);
  
  if (result.success) {
    console.log('✅ Settings retrieved:', result.data.settings);
    return result.data.settings;
  } else {
    console.log('❌ Failed to get settings:', result.error);
    return null;
  }
};

// Test 3: Update settings to disable registration
const testDisableRegistration = async () => {
  console.log('\n🚫 Test 3: Disable User Registration');
  
  const settings = {
    allowRegistration: false,
    commentsEnabled: true,
    moderationRequired: false,
    analyticsEnabled: true,
    maintenanceMode: false
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Registration disabled successfully');
    return true;
  } else {
    console.log('❌ Failed to disable registration:', result.error);
    return false;
  }
};

// Test 4: Try to register when disabled
const testRegistrationWhenDisabled = async () => {
  console.log('\n🚫 Test 4: Try Registration When Disabled');
  
  const newUser = {
    username: 'testuser',
    email: 'newuser@test.com',
    password: 'password123'
  };
  
  const result = await makeRequest('POST', '/auth/register', newUser);
  
  if (!result.success && result.status === 403) {
    console.log('✅ Registration correctly blocked when disabled');
    return true;
  } else {
    console.log('❌ Registration should have been blocked:', result);
    return false;
  }
};

// Test 5: Re-enable registration
const testEnableRegistration = async () => {
  console.log('\n✅ Test 5: Re-enable User Registration');
  
  const settings = {
    allowRegistration: true,
    commentsEnabled: true,
    moderationRequired: false,
    analyticsEnabled: true,
    maintenanceMode: false
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Registration re-enabled successfully');
    return true;
  } else {
    console.log('❌ Failed to re-enable registration:', result.error);
    return false;
  }
};

// Test 6: Test registration when enabled
const testRegistrationWhenEnabled = async () => {
  console.log('\n✅ Test 6: Registration When Enabled');
  
  const newUser = {
    username: 'testuser2',
    email: 'newuser2@test.com',
    password: 'password123'
  };
  
  const result = await makeRequest('POST', '/auth/register', newUser);
  
  if (result.success) {
    console.log('✅ Registration successful when enabled');
    return true;
  } else {
    console.log('❌ Registration failed when enabled:', result.error);
    return false;
  }
};

// Test 7: Login as regular user
const testUserLogin = async () => {
  console.log('\n👤 Test 7: User Login');
  
  const result = await makeRequest('POST', '/auth/login', testConfig.regularUser);
  
  if (result.success) {
    userToken = result.data.token;
    console.log('✅ User login successful');
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
};

// Test 8: Test comments when enabled
const testCommentsEnabled = async () => {
  console.log('\n💬 Test 8: Comments When Enabled');
  
  const comment = {
    content: 'This is a test comment'
  };
  
  const result = await makeRequest('POST', `/comments/${testConfig.testNewsId}`, comment, userToken);
  
  if (result.success) {
    testCommentId = result.data.data._id;
    console.log('✅ Comment created successfully');
    return true;
  } else {
    console.log('❌ Comment creation failed:', result.error);
    return false;
  }
};

// Test 9: Disable comments
const testDisableComments = async () => {
  console.log('\n🚫 Test 9: Disable Comments');
  
  const settings = {
    allowRegistration: true,
    commentsEnabled: false,
    moderationRequired: false,
    analyticsEnabled: true,
    maintenanceMode: false
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Comments disabled successfully');
    return true;
  } else {
    console.log('❌ Failed to disable comments:', result.error);
    return false;
  }
};

// Test 10: Try to comment when disabled
const testCommentsWhenDisabled = async () => {
  console.log('\n🚫 Test 10: Try Commenting When Disabled');
  
  const comment = {
    content: 'This comment should be blocked'
  };
  
  const result = await makeRequest('POST', `/comments/${testConfig.testNewsId}`, comment, userToken);
  
  if (!result.success && result.status === 403) {
    console.log('✅ Comments correctly blocked when disabled');
    return true;
  } else {
    console.log('❌ Comments should have been blocked:', result);
    return false;
  }
};

// Test 11: Enable comment moderation
const testEnableModeration = async () => {
  console.log('\n🔍 Test 11: Enable Comment Moderation');
  
  const settings = {
    allowRegistration: true,
    commentsEnabled: true,
    moderationRequired: true,
    analyticsEnabled: true,
    maintenanceMode: false
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Comment moderation enabled');
    return true;
  } else {
    console.log('❌ Failed to enable moderation:', result.error);
    return false;
  }
};

// Test 12: Create comment with moderation
const testCommentWithModeration = async () => {
  console.log('\n⏳ Test 12: Comment With Moderation');
  
  const comment = {
    content: 'This comment needs moderation'
  };
  
  const result = await makeRequest('POST', `/comments/${testConfig.testNewsId}`, comment, userToken);
  
  if (result.success && result.data.message.includes('submitted for approval')) {
    console.log('✅ Comment submitted for moderation');
    return result.data.data._id;
  } else {
    console.log('❌ Comment moderation failed:', result.error);
    return null;
  }
};

// Test 13: Get pending comments
const testGetPendingComments = async () => {
  console.log('\n📋 Test 13: Get Pending Comments');
  
  const result = await makeRequest('GET', '/admin/comments/pending', null, adminToken);
  
  if (result.success) {
    console.log('✅ Pending comments retrieved:', result.data.data.length);
    return result.data.data;
  } else {
    console.log('❌ Failed to get pending comments:', result.error);
    return [];
  }
};

// Test 14: Approve comment
const testApproveComment = async (commentId) => {
  console.log('\n✅ Test 14: Approve Comment');
  
  const result = await makeRequest('POST', `/admin/comments/${commentId}/approve`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Comment approved successfully');
    return true;
  } else {
    console.log('❌ Failed to approve comment:', result.error);
    return false;
  }
};

// Test 15: Test analytics
const testAnalytics = async () => {
  console.log('\n📊 Test 15: Analytics');
  
  const result = await makeRequest('GET', '/admin/analytics/summary', null, adminToken);
  
  if (result.success) {
    console.log('✅ Analytics data retrieved:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed to get analytics:', result.error);
    return false;
  }
};

// Test 16: Enable maintenance mode
const testMaintenanceMode = async () => {
  console.log('\n🔧 Test 16: Enable Maintenance Mode');
  
  const settings = {
    allowRegistration: true,
    commentsEnabled: true,
    moderationRequired: false,
    analyticsEnabled: true,
    maintenanceMode: true
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Maintenance mode enabled');
    return true;
  } else {
    console.log('❌ Failed to enable maintenance mode:', result.error);
    return false;
  }
};

// Test 17: Test access during maintenance (non-admin)
const testMaintenanceAccess = async () => {
  console.log('\n🚫 Test 17: Non-Admin Access During Maintenance');
  
  const result = await makeRequest('GET', '/news', null, userToken);
  
  if (!result.success && result.status === 503) {
    console.log('✅ Non-admin correctly blocked during maintenance');
    return true;
  } else {
    console.log('❌ Non-admin should have been blocked:', result);
    return false;
  }
};

// Test 18: Test admin access during maintenance
const testAdminMaintenanceAccess = async () => {
  console.log('\n👑 Test 18: Admin Access During Maintenance');
  
  const result = await makeRequest('GET', '/admin/dashboard', null, adminToken);
  
  if (result.success) {
    console.log('✅ Admin can access during maintenance');
    return true;
  } else {
    console.log('❌ Admin should be able to access:', result.error);
    return false;
  }
};

// Test 19: Disable maintenance mode
const testDisableMaintenance = async () => {
  console.log('\n✅ Test 19: Disable Maintenance Mode');
  
  const settings = {
    allowRegistration: true,
    commentsEnabled: true,
    moderationRequired: false,
    analyticsEnabled: true,
    maintenanceMode: false
  };
  
  const result = await makeRequest('PUT', '/admin/settings/general', { settings }, adminToken);
  
  if (result.success) {
    console.log('✅ Maintenance mode disabled');
    return true;
  } else {
    console.log('❌ Failed to disable maintenance mode:', result.error);
    return false;
  }
};

// Test 20: Test normal access after maintenance
const testNormalAccess = async () => {
  console.log('\n✅ Test 20: Normal Access After Maintenance');
  
  const result = await makeRequest('GET', '/news', null, userToken);
  
  if (result.success) {
    console.log('✅ Normal access restored after maintenance');
    return true;
  } else {
    console.log('❌ Normal access should be restored:', result.error);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Site Features Test Suite');
  console.log('=====================================');
  
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Get Settings', fn: testGetSettings },
    { name: 'Disable Registration', fn: testDisableRegistration },
    { name: 'Registration Blocked', fn: testRegistrationWhenDisabled },
    { name: 'Enable Registration', fn: testEnableRegistration },
    { name: 'Registration Allowed', fn: testRegistrationWhenEnabled },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Comments Enabled', fn: testCommentsEnabled },
    { name: 'Disable Comments', fn: testDisableComments },
    { name: 'Comments Blocked', fn: testCommentsWhenDisabled },
    { name: 'Enable Moderation', fn: testEnableModeration },
    { name: 'Comment With Moderation', fn: testCommentWithModeration },
    { name: 'Get Pending Comments', fn: testGetPendingComments },
    { name: 'Approve Comment', fn: () => testApproveComment(testCommentId) },
    { name: 'Analytics', fn: testAnalytics },
    { name: 'Enable Maintenance', fn: testMaintenanceMode },
    { name: 'Maintenance Block', fn: testMaintenanceAccess },
    { name: 'Admin Maintenance Access', fn: testAdminMaintenanceAccess },
    { name: 'Disable Maintenance', fn: testDisableMaintenance },
    { name: 'Normal Access', fn: testNormalAccess }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n=====================================');
  console.log('📊 Test Results Summary');
  console.log('=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Site features are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runAllTests().catch(console.error); 