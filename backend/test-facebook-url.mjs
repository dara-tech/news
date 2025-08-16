#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Facebook URL Configuration...\n');

console.log('📋 Environment Variables:');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test URL generation
const baseUrl = process.env.FRONTEND_URL || 'https://razewire.com';
const testSlug = 'test-article-slug';
const articleUrl = `${baseUrl}/news/${testSlug}`;

console.log('\n🔗 Generated URLs:');
console.log('- Base URL:', baseUrl);
console.log('- Article URL:', articleUrl);

// Check if URL would be included in Facebook post
const isLocalhost = articleUrl.includes('localhost') || articleUrl.includes('127.0.0.1');
const isLocal = articleUrl.includes('localhost') || articleUrl.includes('127.0.0.1') || articleUrl.includes('192.168.') || articleUrl.includes('10.') || articleUrl.includes('172.');

console.log('\n📊 URL Analysis:');
console.log('- Contains localhost:', isLocalhost);
console.log('- Is local URL:', isLocal);
console.log('- Would be included in Facebook post:', !isLocalhost);

console.log('\n💡 Recommendations:');
if (!process.env.FRONTEND_URL) {
  console.log('❌ FRONTEND_URL is not set');
  console.log('   Set FRONTEND_URL to your actual domain (e.g., https://razewire.com)');
} else if (isLocal) {
  console.log('❌ FRONTEND_URL points to a local address');
  console.log('   Set FRONTEND_URL to your production domain');
} else {
  console.log('✅ FRONTEND_URL is properly configured');
}

console.log('\n🎯 To fix Facebook domain display:');
console.log('1. Set FRONTEND_URL environment variable to your actual domain');
console.log('2. Ensure the domain is accessible and has proper SSL');
console.log('3. Test the URL manually to ensure it works');
console.log('4. Restart the backend server after setting the environment variable');
