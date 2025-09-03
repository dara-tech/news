#!/usr/bin/env node

import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

dotenv.config();

logger.info('📋 Environment Variables:');
logger.info('- FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
logger.info('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test URL generation
const baseUrl = process.env.FRONTEND_URL || 'https://razewire.com';
const testSlug = 'test-article-slug';
const articleUrl = `${baseUrl}/news/${testSlug}`;

logger.info('\n🔗 Generated URLs:');
logger.info('- Base URL:', baseUrl);
logger.info('- Article URL:', articleUrl);

// Check if URL would be included in Facebook post
const isLocalhost = articleUrl.includes('localhost') || articleUrl.includes('127.0.0.1');
const isLocal = articleUrl.includes('localhost') || articleUrl.includes('127.0.0.1') || articleUrl.includes('192.168.') || articleUrl.includes('10.') || articleUrl.includes('172.');

logger.info('\n📊 URL Analysis:');
logger.info('- Contains localhost:', isLocalhost);
logger.info('- Is local URL:', isLocal);
logger.info('- Would be included in Facebook post:', !isLocalhost);

logger.info('\n💡 Recommendations:');
if (!process.env.FRONTEND_URL) {
  logger.info('❌ FRONTEND_URL is not set');
  logger.info('   Set FRONTEND_URL to your actual domain (e.g., https://razewire.com)');
} else if (isLocal) {
  logger.info('❌ FRONTEND_URL points to a local address');
  logger.info('   Set FRONTEND_URL to your production domain');
} else {
  logger.info('✅ FRONTEND_URL is properly configured');
}

logger.info('\n🎯 To fix Facebook domain display:');
logger.info('1. Set FRONTEND_URL environment variable to your actual domain');
logger.info('2. Ensure the domain is accessible and has proper SSL');
logger.info('3. Test the URL manually to ensure it works');
logger.info('4. Restart the backend server after setting the environment variable');
