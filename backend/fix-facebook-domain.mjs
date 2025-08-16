#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('🔧 Fixing Facebook Domain Configuration...\n');

// Define the correct production domain
const PRODUCTION_DOMAIN = 'https://razewire.com';

console.log('📋 Current Configuration:');
console.log('- Current FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
console.log('- Target FRONTEND_URL:', PRODUCTION_DOMAIN);

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('\n🌍 Environment:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('- Is Development:', isDevelopment);
console.log('- Is Production:', isProduction);

// Determine the correct URL to use
let correctUrl;
if (isProduction) {
  correctUrl = PRODUCTION_DOMAIN;
  console.log('✅ Using production domain for production environment');
} else {
  // For development, we need to use a public domain for Facebook
  correctUrl = PRODUCTION_DOMAIN;
  console.log('⚠️  Using production domain for Facebook (even in development)');
  console.log('   This ensures Facebook can access the URLs');
}

console.log('\n🔗 URL Configuration:');
console.log('- Correct URL:', correctUrl);
console.log('- Test Article URL:', `${correctUrl}/news/test-article`);

// Test if the URL would be included in Facebook posts
const isLocalhost = correctUrl.includes('localhost') || correctUrl.includes('127.0.0.1');
console.log('- Would be included in Facebook posts:', !isLocalhost);

console.log('\n💡 Solution:');
console.log('1. Set FRONTEND_URL environment variable to:', correctUrl);
console.log('2. Restart the backend server');
console.log('3. Test Facebook posting again');

console.log('\n📝 Environment Variable Setup:');
console.log('Add this to your .env file or environment:');
console.log(`FRONTEND_URL=${correctUrl}`);

console.log('\n🚀 Next Steps:');
console.log('1. Set the FRONTEND_URL environment variable');
console.log('2. Restart your backend server');
console.log('3. Test Facebook auto-posting with a real article');
console.log('4. Check that the domain appears correctly in Facebook posts');

console.log('\n⚠️  Important Notes:');
console.log('- Facebook requires public URLs (not localhost)');
console.log('- The domain must be accessible from the internet');
console.log('- SSL (https://) is recommended for better Facebook integration');
console.log('- Test the URL manually to ensure it works before posting');
