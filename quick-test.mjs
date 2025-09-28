#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function quickTest() {
  console.log('🔍 Quick API Test...');
  console.log('==================');
  
  // Test backend
  console.log('\n1️⃣ Testing Backend...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    console.log(`✅ Backend status: ${response.status}`);
    
    // Get some articles to test with
    const articlesResponse = await fetch(`${API_BASE}/news?limit=3`);
    const articlesData = await articlesResponse.json();
    
    if (articlesData.success && articlesData.data.length > 0) {
      console.log('📰 Found articles:');
      articlesData.data.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} (ID: ${article._id})`);
      });
      
      // Test with first article
      const testArticleId = articlesData.data[0]._id;
      console.log(`\n🧪 Testing with article: ${testArticleId}`);
      
      // Test like count
      const likeResponse = await fetch(`${API_BASE}/likes/${testArticleId}/count`);
      const likeData = await likeResponse.json();
      console.log(`❤️ Like count: ${likeData.count || 'N/A'}`);
      
      // Test comments
      const commentResponse = await fetch(`${API_BASE}/comments/${testArticleId}`);
      const commentData = await commentResponse.json();
      console.log(`💬 Comments: ${commentData.data?.length || 0} comments`);
      
    } else {
      console.log('❌ No articles found');
    }
    
  } catch (error) {
    console.log(`❌ Backend error: ${error.message}`);
  }
  
  // Test frontend
  console.log('\n2️⃣ Testing Frontend...');
  try {
    const response = await fetch(`${FRONTEND_BASE}`);
    console.log(`✅ Frontend status: ${response.status}`);
    
    // Test author page
    const authorResponse = await fetch(`${FRONTEND_BASE}/en/author/test`);
    console.log(`👤 Author page status: ${authorResponse.status}`);
    
  } catch (error) {
    console.log(`❌ Frontend error: ${error.message}`);
  }
  
  console.log('\n🎉 Quick test completed!');
}

quickTest().catch(console.error);
