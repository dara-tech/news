import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://news-vzdx.onrender.com/api';
let authToken = '';

async function login() {
  try {
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
      return true;
    }
    throw new Error('No JWT token in response');
  } catch (error) {
    return false;
  }
}

async function testAdminEndpoints() {
  // Test 1: Get all users
  try {
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  } catch (error) {
  }

  // Test 2: Create a test user
  let testUserId = null;
  try {
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
  } catch (error) {
  }

  // Test 3: Update test user
  if (testUserId) {
    try {
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
    } catch (error) {
    }
  }

  // Test 4: Get news stats
  try {
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  } catch (error) {
  }

  // Cleanup: Delete test user
  if (testUserId) {
    try {
      await axios.delete(`${API_URL}/users/${testUserId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
    } catch (error) {
    }
  }
}

// Run tests
async function runTests() {
  const isLoggedIn = await login();
  if (isLoggedIn) {
    await testAdminEndpoints();
  } else {
    process.exit(1);
  }
}

