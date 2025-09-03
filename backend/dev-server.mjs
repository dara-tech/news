#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from '../utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

logger.info('🚀 Starting development server (Ctrl+C will be ignored)...');
logger.info('💡 To stop the server, use: pkill -f "node server.mjs"');

// Start the server
const server = spawn('node', ['server.mjs'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process signals
process.on('SIGINT', () => {
  logger.info('\n⚠️  SIGINT received - ignoring to keep server running');
  logger.info('💡 To stop the server, use: pkill -f "node server.mjs"');
});

process.on('SIGTERM', () => {
  logger.info('\n⚠️  SIGTERM received - ignoring to keep server running');
});

// Handle server exit
server.on('exit', (code) => {
  logger.info(`\n❌ Server exited with code ${code}`);
  process.exit(code);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('\n❌ Server error:', error);
  process.exit(1);
}); 