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
  
  try {
    // 1. Test login with admin credentials
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: '123456'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    
      id: loginRes.data._id,
      email: loginRes.data.email,
      role: loginRes.data.role
    });
    
    // 2. Extract token from cookies
    const cookies = loginRes.headers['set-cookie'] || [];
    
    const token = getCookie(cookies, 'jwt');
    
    if (!token) {
      throw new Error('No JWT token found in response cookies');
    }
    
    
    // 3. Test protected endpoint
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    
    
  } catch (error) {
    
    if (error.response) {
      // The request was made and the server responded with a status code
    } else if (error.request) {
      // The request was made but no response was received
    } else {
      // Something happened in setting up the request
    }
    
    if (error.config) {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
        data: error.config.data
      });
    }
  }
}

testAuth();
