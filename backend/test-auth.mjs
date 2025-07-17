import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://news-vzdx.onrender.com/api';

// Helper function to extract cookie
function getCookie(cookies, name) {
  const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
  return cookie ? cookie.split(';')[0].split('=')[1] : null;
}

async function testAuth() {
  console.log('🚀 Starting authentication test...');
  console.log(`🌐 API URL: ${API_URL}`);
  
  try {
    // 1. Test login with admin credentials
    console.log('\n🔐 Testing login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: '123456'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📨 Login response headers:', JSON.stringify(loginRes.headers, null, 2));
    
    console.log('✅ Login successful!');
    console.log('User:', {
      id: loginRes.data._id,
      email: loginRes.data.email,
      role: loginRes.data.role
    });
    
    // 2. Extract token from cookies
    const cookies = loginRes.headers['set-cookie'] || [];
    console.log('🍪 Cookies received:', cookies);
    
    const token = getCookie(cookies, 'jwt');
    
    if (!token) {
      throw new Error('No JWT token found in response cookies');
    }
    
    console.log('\n🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');
    
    // 3. Test protected endpoint
    console.log('\n🔍 Testing protected endpoint...');
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    console.log('✅ Protected endpoint successful!');
    console.log('📊 Stats data:', statsRes.data);
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    
    if (error.config) {
      console.error('\nRequest config:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      });
    }
  }
}

testAuth();
