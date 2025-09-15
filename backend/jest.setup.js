// Jest setup for backend tests
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

