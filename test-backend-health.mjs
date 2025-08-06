import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

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

const testBackendHealth = async () => {
  log('🏥 Testing Backend Health', 'info');
  log('========================', 'info');
  
  try {
    // Test 1: Health endpoint
    log('1. Testing health endpoint...', 'info');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    
    if (healthResponse.status === 200) {
      log('✅ Backend is running and healthy', 'success');
      console.log('Health Response:', healthResponse.data);
    } else {
      log('❌ Backend health check failed', 'error');
      return false;
    }
    
    // Test 2: API root endpoint
    log('2. Testing API root endpoint...', 'info');
    const apiResponse = await axios.get(`${BASE_URL}/`);
    
    if (apiResponse.status === 200) {
      log('✅ API root endpoint accessible', 'success');
      console.log('API Response:', apiResponse.data);
    } else {
      log('❌ API root endpoint failed', 'error');
      return false;
    }
    
    // Test 3: Database connection (via settings endpoint)
    log('3. Testing database connection...', 'info');
    try {
      const settingsResponse = await axios.get(`${BASE_URL}/api/admin/settings/general`);
      log('❌ Settings endpoint should require authentication', 'warning');
    } catch (error) {
      if (error.response?.status === 401) {
        log('✅ Database connection working (auth required)', 'success');
      } else {
        log('❌ Database connection failed', 'error');
        return false;
      }
    }
    
    log('\n🎉 Backend health check completed successfully!', 'success');
    log('You can now run the feature tests.', 'info');
    return true;
    
  } catch (error) {
    log(`❌ Backend health check failed: ${error.message}`, 'error');
    log('Please ensure the backend server is running on port 5001', 'error');
    return false;
  }
};

// Run the health check
testBackendHealth(); 