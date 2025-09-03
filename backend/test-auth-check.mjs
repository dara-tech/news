import axios from 'axios';
import logger from '../utils/logger.mjs';

const testAuthAndRoute = async () => {
  logger.info('🧪 Testing authentication and user login route...');
  
  try {
    // Test 1: Check if server is running
    logger.info('1. Testing server connectivity...');
    const healthResponse = await axios.get('http://localhost:5001/api/dashboard/stats');
    logger.info('✅ Server is running, dashboard stats endpoint works');
    
    // Test 2: Check if user login route exists (should return 401 without auth)
    logger.info('2. Testing user login route without auth...');
    try {
      await axios.get('http://localhost:5001/api/admin/user-logins/map?days=7');
      logger.info('❌ Route should require authentication but didn\'t');
    } catch (error) {
      if (error.response?.status === 401) {
        logger.info('✅ Route properly requires authentication (401)');
      } else if (error.response?.status === 404) {
        logger.info('❌ Route not found (404) - route not registered');
      } else {
        logger.info(`⚠️ Unexpected status: ${error.response?.status}`);
      }
    }
    
    // Test 3: Check if we can get a valid token
    logger.info('3. Testing authentication...');
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'admin@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        logger.info('✅ Authentication successful, got token');
        
        // Test 4: Test the route with valid token
        logger.info('4. Testing user login route with auth...');
        const token = loginResponse.data.token;
        const mapResponse = await axios.get('http://localhost:5001/api/admin/user-logins/map?days=7', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        logger.info('✅ Route works with authentication!');
        logger.info('Response:', mapResponse.data);
        
      } else {
        logger.info('❌ Authentication failed');
      }
    } catch (error) {
      logger.info('❌ Authentication error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    logger.error('❌ Test failed:', error.message);
  }
};

testAuthAndRoute(); 