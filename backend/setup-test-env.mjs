#!/usr/bin/env node

// Test Environment Setup Script
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up test environment...');

// Load existing .env file
dotenv.config();

// Test environment variables
const testEnvVars = {
  NODE_ENV: 'test',
  PORT: '5001',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app-test',
  JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'test-api-key',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'test-api-secret',
  DB_NAME: 'news_app_test',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || 'test-facebook-app-id',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || 'test-facebook-app-secret',
  TWITTER_API_KEY: process.env.TWITTER_API_KEY || 'test-twitter-api-key',
  TWITTER_API_SECRET: process.env.TWITTER_API_SECRET || 'test-twitter-api-secret',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || 'test-linkedin-client-id',
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || 'test-linkedin-client-secret',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'test-telegram-bot-token',
  INSTAGRAM_APP_ID: process.env.INSTAGRAM_APP_ID || 'test-instagram-app-id',
  INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET || 'test-instagram-app-secret',
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || 'test@example.com',
  SMTP_PASS: process.env.SMTP_PASS || 'test-password',
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || '4',
  SESSION_SECRET: process.env.SESSION_SECRET || 'test-session-secret'
};

// Set environment variables for current process
Object.entries(testEnvVars).forEach(([key, value]) => {
  process.env[key] = value;
});

console.log('✅ Test environment variables configured');
console.log('📋 Test Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   - PORT: ${process.env.PORT}`);
console.log(`   - MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`   - API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);

export default testEnvVars;
