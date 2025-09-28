#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';
const FRONTEND_BASE = 'http://localhost:3000';

// Test data - replace with actual article ID from your database
const TEST_ARTICLE_ID = '689581b3ed4da10e3ffc90eb';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  console.log(`\n🔗 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    if (response.ok) {
      console.log(`✅ Success:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error:`, JSON.stringify(data, null, 2));
    }
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Network Error:`, error.message);
    return { error };
  }
}

// Test public APIs
async function testPublicAPIs() {
  console.log('\n🌐 Testing Public APIs...');
  
  // 1. Health check
  console.log('\n1️⃣ Health check...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    console.log(`📊 Health status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
  
  // 2. Get like count
  console.log('\n2️⃣ Getting like count...');
  await apiCall(`/likes/${TEST_ARTICLE_ID}/count`);
  
  // 3. Get like status (public)
  console.log('\n3️⃣ Getting like status (public)...');
  await apiCall(`/likes/${TEST_ARTICLE_ID}/status/public`);
  
  // 4. Get comments
  console.log('\n4️⃣ Getting comments...');
  await apiCall(`/comments/${TEST_ARTICLE_ID}`);
  
  // 5. Get comment stats
  console.log('\n5️⃣ Getting comment stats...');
  await apiCall(`/comments/${TEST_ARTICLE_ID}/stats`);
  
  // 6. Get popular articles
  console.log('\n6️⃣ Getting popular articles...');
  await apiCall('/likes/popular');
}

// Test frontend pages
async function testFrontendPages() {
  console.log('\n🌐 Testing Frontend Pages...');
  
  // 1. Home page
  console.log('\n1️⃣ Testing home page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/`);
    console.log(`📊 Home page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Home page error: ${error.message}`);
  }
  
  // 2. English home page
  console.log('\n2️⃣ Testing English home page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/en`);
    console.log(`📊 English home page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ English home page error: ${error.message}`);
  }
  
  // 3. Khmer home page
  console.log('\n3️⃣ Testing Khmer home page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/kh`);
    console.log(`📊 Khmer home page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Khmer home page error: ${error.message}`);
  }
  
  // 4. Author page
  console.log('\n4️⃣ Testing author page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/en/author/${TEST_ARTICLE_ID}`);
    console.log(`📊 Author page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Author page error: ${error.message}`);
  }
  
  // 5. News page
  console.log('\n5️⃣ Testing news page...');
  try {
    const response = await fetch(`${FRONTEND_BASE}/en/news`);
    console.log(`📊 News page status: ${response.status}`);
  } catch (error) {
    console.log(`❌ News page error: ${error.message}`);
  }
}

// Test with different article IDs
async function testWithDifferentArticles() {
  console.log('\n📰 Testing with different article IDs...');
  
  // Common test article IDs (replace with actual ones from your database)
  const testArticleIds = [
    '689581b3ed4da10e3ffc90eb',
    '6886733416315db847ca5e74',
    '687362dbfcd8692cef0917df'
  ];
  
  for (const articleId of testArticleIds) {
    console.log(`\n🔍 Testing with article ID: ${articleId}`);
    
    // Test like count
    await apiCall(`/likes/${articleId}/count`);
    
    // Test comments
    await apiCall(`/comments/${articleId}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Simple API Tests...');
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
    return;
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
    return;
  }
  
  // Run tests
  await testPublicAPIs();
  await testFrontendPages();
  await testWithDifferentArticles();
  
  console.log('\n🎉 Simple API Tests Completed!');
  console.log('================================');
  console.log('\n💡 To test authenticated endpoints:');
  console.log('   1. Create a user account');
  console.log('   2. Get authentication token');
  console.log('   3. Update the test script with valid credentials');
}

// Run the tests
runTests().catch(console.error);
