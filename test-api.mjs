#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';
const FRONTEND_BASE = 'http://localhost:3000';

// Test data
const TEST_ARTICLE_ID = '689581b3ed4da10e3ffc90eb'; // Replace with actual article ID
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };

  console.log(`\n🔗 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { error };
  }
}

// Test authentication
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  // Test login
  const { data: loginData } = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });
  
  if (loginData?.success && loginData?.data?.token) {
    authToken = loginData.data.token;
    console.log('✅ Authentication successful');
    return true;
  } else {
    console.log('❌ Authentication failed - using public endpoints only');
    return false;
  }
}

// Test Like APIs
async function testLikeAPIs() {
  console.log('\n❤️ Testing Like APIs...');
  
  // 1. Get like count (public)
  console.log('\n1️⃣ Getting like count (public)...');
  await apiCall(`/likes/${TEST_ARTICLE_ID}/count`);
  
  // 2. Get like status (public)
  console.log('\n2️⃣ Getting like status (public)...');
  await apiCall(`/likes/${TEST_ARTICLE_ID}/status/public`);
  
  if (authToken) {
    // 3. Check if user liked (private)
    console.log('\n3️⃣ Checking if user liked (private)...');
    await apiCall(`/likes/${TEST_ARTICLE_ID}/check`);
    
    // 4. Get like status (private)
    console.log('\n4️⃣ Getting like status (private)...');
    await apiCall(`/likes/${TEST_ARTICLE_ID}/status`);
    
    // 5. Toggle like (like)
    console.log('\n5️⃣ Toggling like (like)...');
    await apiCall(`/likes/${TEST_ARTICLE_ID}/toggle`, {
      method: 'POST'
    });
    
    // 6. Check like status again
    console.log('\n6️⃣ Checking like status after toggle...');
    await apiCall(`/likes/${TEST_ARTICLE_ID}/status`);
    
    // 7. Toggle like again (unlike)
    console.log('\n7️⃣ Toggling like again (unlike)...');
    await apiCall(`/likes/${TEST_ARTICLE_ID}/toggle`, {
      method: 'POST'
    });
    
    // 8. Get user's liked articles
    console.log('\n8️⃣ Getting user\'s liked articles...');
    await apiCall('/likes/user');
  }
  
  // 9. Get popular articles
  console.log('\n9️⃣ Getting popular articles...');
  await apiCall('/likes/popular');
}

// Test Comment APIs
async function testCommentAPIs() {
  console.log('\n💬 Testing Comment APIs...');
  
  // 1. Get comments (public)
  console.log('\n1️⃣ Getting comments (public)...');
  await apiCall(`/comments/${TEST_ARTICLE_ID}`);
  
  // 2. Get comment stats (public)
  console.log('\n2️⃣ Getting comment stats (public)...');
  await apiCall(`/comments/${TEST_ARTICLE_ID}/stats`);
  
  if (authToken) {
    // 3. Create a comment
    console.log('\n3️⃣ Creating a comment...');
    const { data: commentData } = await apiCall(`/comments/${TEST_ARTICLE_ID}`, {
      method: 'POST',
      body: JSON.stringify({
        content: 'This is a test comment from API testing script!'
      })
    });
    
    const commentId = commentData?.data?._id;
    
    if (commentId) {
      // 4. Like the comment
      console.log('\n4️⃣ Liking the comment...');
      await apiCall(`/comments/${commentId}/like`, {
        method: 'POST'
      });
      
      // 5. Get comments again to see the new comment
      console.log('\n5️⃣ Getting comments after creation...');
      await apiCall(`/comments/${TEST_ARTICLE_ID}`);
      
      // 6. Unlike the comment
      console.log('\n6️⃣ Unliking the comment...');
      await apiCall(`/comments/${commentId}/like`, {
        method: 'DELETE'
      });
    }
  }
}

// Test Frontend Integration
async function testFrontendIntegration() {
  console.log('\n🌐 Testing Frontend Integration...');
  
  // Test author page
  console.log('\n1️⃣ Testing author page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/en/author/${TEST_ARTICLE_ID}`);
    console.log(`📊 Author page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Author page error: ${error.message}`);
  }
  
  // Test news page
  console.log('\n2️⃣ Testing news page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/en/news`);
    console.log(`📊 News page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ News page error: ${error.message}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('================================');
  
  // Check if backend is running
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) {
      throw new Error('Backend not responding');
    }
    console.log('✅ Backend is running');
  } catch (error) {
    console.log('❌ Backend is not running. Please start the backend server first.');
    console.log('Run: cd backend && npm start');
    process.exit(1);
  }
  
  // Check if frontend is running
  try {
    const response = await fetch(`${FRONTEND_BASE}`);
    if (!response.ok) {
      throw new Error('Frontend not responding');
    }
    console.log('✅ Frontend is running');
  } catch (error) {
    console.log('❌ Frontend is not running. Please start the frontend server first.');
    console.log('Run: cd frontend && npm run dev');
    process.exit(1);
  }
  
  // Run tests
  const isAuthenticated = await testAuth();
  await testLikeAPIs();
  await testCommentAPIs();
  await testFrontendIntegration();
  
  console.log('\n🎉 API Tests Completed!');
  console.log('================================');
  
  if (!isAuthenticated) {
    console.log('\n💡 Note: Some tests require authentication.');
    console.log('   To test with authentication, update TEST_USER credentials in the script.');
  }
}

// Run the tests
runTests().catch(console.error);
