import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://news-vzdx.onrender.com/api';
let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: '123456'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract token from cookies
    const cookies = response.headers['set-cookie'] || [];
    const jwtCookie = cookies.find(c => c.startsWith('jwt='));
    if (jwtCookie) {
      authToken = jwtCookie.split(';')[0].split('=')[1];
      console.log('✅ Logged in successfully');
      return true;
    }
    throw new Error('No JWT token in response');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAdminEndpoints() {
  // Test 1: Get all users
  try {
    console.log('\n👥 Testing get all users...');
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    console.log('✅ Users:', usersRes.data);
  } catch (error) {
    console.error('❌ Get users failed:', error.response?.data || error.message);
  }

  // Test 2: Create a test user
  let testUserId = null;
  try {
    console.log('\n👤 Testing create user...');
    const newUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'test123',
      role: 'user'
    };
    const createRes = await axios.post(`${API_URL}/users`, newUser, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    testUserId = createRes.data._id;
    console.log('✅ User created:', createRes.data);
  } catch (error) {
    console.error('❌ Create user failed:', error.response?.data || error.message);
  }

  // Test 3: Update test user
  if (testUserId) {
    try {
      console.log('\n🔄 Testing update user...');
      const updateRes = await axios.put(
        `${API_URL}/users/${testUserId}`,
        { role: 'editor' },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      console.log('✅ User updated:', updateRes.data);
    } catch (error) {
      console.error('❌ Update user failed:', error.response?.data || error.message);
    }
  }

  // Test 4: Get news stats
  try {
    console.log('\n📊 Testing news stats...');
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    console.log('✅ News stats:', statsRes.data);
  } catch (error) {
    console.error('❌ Get stats failed:', error.response?.data || error.message);
  }

  // Cleanup: Delete test user
  if (testUserId) {
    try {
      console.log('\� Cleaning up test user...');
      await axios.delete(`${API_URL}/users/${testUserId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('✅ Test user deleted');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.response?.data || error.message);
    }
  }
}

// Run tests
async function runTests() {
  const isLoggedIn = await login();
  if (isLoggedIn) {
    await testAdminEndpoints();
  } else {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }
}

runTests().catch(console.error);