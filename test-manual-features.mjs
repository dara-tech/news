import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

// Test helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

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

// Manual test functions
const testSettings = async () => {
  log('\n=== Testing Settings System ===', 'info');
  
  // Login as admin
  log('1. Logging in as admin...', 'info');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'admin@example.com',
    password: '123456'
  });
  
  if (!loginResult.success) {
    log('❌ Admin login failed. Please ensure admin user exists.', 'error');
    return null;
  }
  
  const adminToken = loginResult.data.token;
  log('✅ Admin login successful', 'success');
  
  // Get current settings
  log('2. Getting current settings...', 'info');
  const settingsResult = await makeRequest('GET', '/admin/settings/general', null, adminToken);
  
  if (settingsResult.success) {
    log('✅ Current settings:', 'success');
    console.log(JSON.stringify(settingsResult.data.settings, null, 2));
  } else {
    log('❌ Failed to get settings', 'error');
    return null;
  }
  
  return adminToken;
};

const testRegistrationControl = async (adminToken) => {
  log('\n=== Testing Registration Control ===', 'info');
  
  // Disable registration
  log('1. Disabling user registration...', 'info');
  const disableResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: false,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (disableResult.success) {
    log('✅ Registration disabled', 'success');
  } else {
    log('❌ Failed to disable registration', 'error');
    return false;
  }
  
  // Try to register when disabled
  log('2. Trying to register when disabled...', 'info');
  const registerResult = await makeRequest('POST', '/auth/register', {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (!registerResult.success && registerResult.status === 403) {
    log('✅ Registration correctly blocked when disabled', 'success');
  } else {
    log('❌ Registration should have been blocked', 'error');
    return false;
  }
  
  // Re-enable registration
  log('3. Re-enabling registration...', 'info');
  const enableResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (enableResult.success) {
    log('✅ Registration re-enabled', 'success');
  } else {
    log('❌ Failed to re-enable registration', 'error');
    return false;
  }
  
  return true;
};

const testCommentsControl = async (adminToken) => {
  log('\n=== Testing Comments Control ===', 'info');
  
  // Login as regular user
  log('1. Logging in as regular user...', 'info');
  const userLogin = await makeRequest('POST', '/auth/login', {
    email: 'admin@example.com',
    password: '123456'
  });
  
  if (!userLogin.success) {
    log('❌ User login failed. Please ensure user exists.', 'error');
    return false;
  }
  
  const userToken = userLogin.data.token;
  log('✅ User login successful', 'success');
  
  // Disable comments
  log('2. Disabling comments...', 'info');
  const disableResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: false,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (disableResult.success) {
    log('✅ Comments disabled', 'success');
  } else {
    log('❌ Failed to disable comments', 'error');
    return false;
  }
  
  // Try to comment when disabled
  log('3. Trying to comment when disabled...', 'info');
  const commentResult = await makeRequest('POST', '/comments/507f1f77bcf86cd799439011', {
    content: 'This comment should be blocked'
  }, userToken);
  
  if (!commentResult.success && commentResult.status === 403) {
    log('✅ Comments correctly blocked when disabled', 'success');
  } else {
    log('❌ Comments should have been blocked', 'error');
    return false;
  }
  
  // Re-enable comments
  log('4. Re-enabling comments...', 'info');
  const enableResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (enableResult.success) {
    log('✅ Comments re-enabled', 'success');
  } else {
    log('❌ Failed to re-enable comments', 'error');
    return false;
  }
  
  return true;
};

const testModeration = async (adminToken) => {
  log('\n=== Testing Comment Moderation ===', 'info');
  
  // Login as user
  const userLogin = await makeRequest('POST', '/auth/login', {
    email: 'admin@example.com',
    password: '123456'
  });
  
  if (!userLogin.success) {
    log('❌ User login failed', 'error');
    return false;
  }
  
  const userToken = userLogin.data.token;
  
  // Enable moderation
  log('1. Enabling comment moderation...', 'info');
  const moderationResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: true,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (moderationResult.success) {
    log('✅ Moderation enabled', 'success');
  } else {
    log('❌ Failed to enable moderation', 'error');
    return false;
  }
  
  // Create comment with moderation
  log('2. Creating comment with moderation...', 'info');
  const commentResult = await makeRequest('POST', '/comments/507f1f77bcf86cd799439011', {
    content: 'This comment needs moderation'
  }, userToken);
  
  if (commentResult.success && commentResult.data.message.includes('submitted for approval')) {
    log('✅ Comment submitted for moderation', 'success');
  } else {
    log('❌ Comment moderation failed', 'error');
    return false;
  }
  
  // Get pending comments
  log('3. Getting pending comments...', 'info');
  const pendingResult = await makeRequest('GET', '/admin/comments/pending', null, adminToken);
  
  if (pendingResult.success) {
    log(`✅ Found ${pendingResult.data.data.length} pending comments`, 'success');
  } else {
    log('❌ Failed to get pending comments', 'error');
    return false;
  }
  
  return true;
};

const testMaintenanceMode = async (adminToken) => {
  log('\n=== Testing Maintenance Mode ===', 'info');
  
  // Login as user
  const userLogin = await makeRequest('POST', '/auth/login', {
    email: 'admin@example.com',
    password: '123456'
  });
  
  if (!userLogin.success) {
    log('❌ User login failed', 'error');
    return false;
  }
  
  const userToken = userLogin.data.token;
  
  // Enable maintenance mode
  log('1. Enabling maintenance mode...', 'info');
  const maintenanceResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: true
    }
  }, adminToken);
  
  if (maintenanceResult.success) {
    log('✅ Maintenance mode enabled', 'success');
  } else {
    log('❌ Failed to enable maintenance mode', 'error');
    return false;
  }
  
  // Test user access during maintenance
  log('2. Testing user access during maintenance...', 'info');
  const userAccess = await makeRequest('GET', '/news', null, userToken);
  
  if (!userAccess.success && userAccess.status === 503) {
    log('✅ User correctly blocked during maintenance', 'success');
  } else {
    log('❌ User should have been blocked', 'error');
    return false;
  }
  
  // Test admin access during maintenance
  log('3. Testing admin access during maintenance...', 'info');
  const adminAccess = await makeRequest('GET', '/admin/dashboard', null, adminToken);
  
  if (adminAccess.success) {
    log('✅ Admin can access during maintenance', 'success');
  } else {
    log('❌ Admin should be able to access', 'error');
    return false;
  }
  
  // Disable maintenance mode
  log('4. Disabling maintenance mode...', 'info');
  const disableResult = await makeRequest('PUT', '/admin/settings/general', {
    settings: {
      siteName: 'NewsApps',
      siteDescription: 'Test description',
      siteUrl: '',
      adminEmail: '',
      contactEmail: '',
      allowRegistration: true,
      commentsEnabled: true,
      moderationRequired: false,
      analyticsEnabled: true,
      maintenanceMode: false
    }
  }, adminToken);
  
  if (disableResult.success) {
    log('✅ Maintenance mode disabled', 'success');
  } else {
    log('❌ Failed to disable maintenance mode', 'error');
    return false;
  }
  
  return true;
};

const testAnalytics = async (adminToken) => {
  log('\n=== Testing Analytics ===', 'info');
  
  // Get analytics data
  log('1. Getting analytics data...', 'info');
  const analyticsResult = await makeRequest('GET', '/admin/analytics/summary', null, adminToken);
  
  if (analyticsResult.success) {
    log('✅ Analytics data retrieved', 'success');
    console.log('Analytics Summary:', JSON.stringify(analyticsResult.data.data, null, 2));
  } else {
    log('❌ Failed to get analytics data', 'error');
    return false;
  }
  
  return true;
};

// Main test runner
const runManualTests = async () => {
  log('🚀 Starting Manual Site Features Tests', 'info');
  log('=====================================', 'info');
  
  try {
    // Test 1: Settings system
    const adminToken = await testSettings();
    if (!adminToken) {
      log('❌ Settings test failed. Stopping tests.', 'error');
      return;
    }
    
    // Test 2: Registration control
    const registrationTest = await testRegistrationControl(adminToken);
    if (!registrationTest) {
      log('❌ Registration control test failed.', 'error');
    }
    
    // Test 3: Comments control
    const commentsTest = await testCommentsControl(adminToken);
    if (!commentsTest) {
      log('❌ Comments control test failed.', 'error');
    }
    
    // Test 4: Moderation
    const moderationTest = await testModeration(adminToken);
    if (!moderationTest) {
      log('❌ Moderation test failed.', 'error');
    }
    
    // Test 5: Maintenance mode
    const maintenanceTest = await testMaintenanceMode(adminToken);
    if (!maintenanceTest) {
      log('❌ Maintenance mode test failed.', 'error');
    }
    
    // Test 6: Analytics
    const analyticsTest = await testAnalytics(adminToken);
    if (!analyticsTest) {
      log('❌ Analytics test failed.', 'error');
    }
    
    log('\n=====================================', 'info');
    log('🎉 Manual tests completed!', 'success');
    log('Check the results above to verify functionality.', 'info');
    
  } catch (error) {
    log(`❌ Test suite failed with error: ${error.message}`, 'error');
  }
};

// Run the manual tests
runManualTests(); 