import axios from 'axios';

const testRoute = async () => {
  console.log('🧪 Testing user login route...');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const response = await axios.get('http://localhost:5001/api/dashboard/stats');
    console.log('✅ Server is running');
    
    // Test 2: Test the user login map route
    console.log('2. Testing user login map route...');
    const mapResponse = await axios.get('http://localhost:5001/api/admin/user-logins/map?days=7');
    console.log('✅ Route is working!');
    console.log('Response:', mapResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
};

testRoute(); 