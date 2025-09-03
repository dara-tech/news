#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.mjs';

dotenv.config();

logger.info('🔧 Fixing Facebook Domain Configuration...\n');

// Define the correct production domain
const PRODUCTION_DOMAIN = 'https://razewire.com';

logger.info('📋 Current Configuration:');
logger.info('- Current FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
logger.info('- Target FRONTEND_URL:', PRODUCTION_DOMAIN);

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

logger.info('\n🌍 Environment:');
logger.info('- NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
logger.info('- Is Development:', isDevelopment);
logger.info('- Is Production:', isProduction);

// Determine the correct URL to use
let correctUrl;
if (isProduction) {
  correctUrl = PRODUCTION_DOMAIN;
  logger.info('✅ Using production domain for production environment');
} else {
  // For development, we need to use a public domain for Facebook
  correctUrl = PRODUCTION_DOMAIN;
  logger.info('⚠️  Using production domain for Facebook (even in development)');
  logger.info('   This ensures Facebook can access the URLs');
}

logger.info('\n🔗 URL Configuration:');
logger.info('- Correct URL:', correctUrl);
logger.info('- Test Article URL:', `${correctUrl}/news/test-article`);

// Test if the URL would be included in Facebook posts
const isLocalhost = correctUrl.includes('localhost') || correctUrl.includes('127.0.0.1');
logger.info('- Would be included in Facebook posts:', !isLocalhost);

logger.info('\n💡 Solution:');
logger.info('1. Set FRONTEND_URL environment variable to:', correctUrl);
logger.info('2. Restart the backend server');
logger.info('3. Test Facebook posting again');

logger.info('\n📝 Environment Variable Setup:');
logger.info('Add this to your .env file or environment:');
logger.info(`FRONTEND_URL=${correctUrl}`);

logger.info('\n🚀 Next Steps:');
logger.info('1. Set the FRONTEND_URL environment variable');
logger.info('2. Restart your backend server');
logger.info('3. Test Facebook auto-posting with a real article');
logger.info('4. Check that the domain appears correctly in Facebook posts');

logger.info('\n⚠️  Important Notes:');
logger.info('- Facebook requires public URLs (not localhost)');
logger.info('- The domain must be accessible from the internet');
logger.info('- SSL (https://) is recommended for better Facebook integration');
logger.info('- Test the URL manually to ensure it works before posting');
