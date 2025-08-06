import axios from 'axios';

const testAuthAndRoute = async () => {
  console.log('🧪 Testing authentication and user login route...');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await axios.get('http://localhost:5001/api/dashboard/stats');
    console.log('✅ Server is running, dashboard stats endpoint works');
    
    // Test 2: Check if user login route exists (should return 401 without auth)
    console.log('2. Testing user login route without auth...');
    try {
      await axios.get('http://localhost:5001/api/admin/user-logins/map?days=7');
      console.log('❌ Route should require authentication but didn\'t');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route properly requires authentication (401)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route not found (404) - route not registered');
      } else {
        console.log(`⚠️ Unexpected status: ${error.response?.status}`);
      }
    }
    
    // Test 3: Check if we can get a valid token
    console.log('3. Testing authentication...');
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'admin@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        console.log('✅ Authentication successful, got token');
        
        // Test 4: Test the route with valid token
        console.log('4. Testing user login route with auth...');
        const token = loginResponse.data.token;
        const mapResponse = await axios.get('http://localhost:5001/api/admin/user-logins/map?days=7', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Route works with authentication!');
        console.log('Response:', mapResponse.data);
        
      } else {
        console.log('❌ Authentication failed');
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAuthAndRoute(); 