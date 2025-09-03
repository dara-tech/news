#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info('🚀 Starting clean development server...');
logger.info('📁 Watching only essential files:');
logger.info('   - server.mjs');
logger.info('   - routes/');
logger.info('   - controllers/');
logger.info('   - models/');
logger.info('   - middleware/');
logger.info('   - config/');
logger.info('   - utils/');
logger.info('');
logger.info('🚫 Ignoring test files and utilities');
logger.info('');

const nodemon = spawn('npx', [
  'nodemon',
  '--watch', 'server.mjs',
  '--watch', 'routes',
  '--watch', 'controllers', 
  '--watch', 'models',
  '--watch', 'middleware',
  '--watch', 'config',
  '--watch', 'utils',
  '--ignore', 'test-*.mjs',
  '--ignore', 'debug-*.mjs',
  '--ignore', 'check-*.mjs',
  '--ignore', 'disable-*.mjs',
  '--ignore', 'clear-*.mjs',
  '--ignore', 'generate-*.mjs',
  '--ignore', 'initialize-*.mjs',
  '--ignore', 'list-*.mjs',
  '--ignore', 'create-*.mjs',
  '--ignore', 'migration.mjs',
  '--ignore', 'seeder.js',
  '--ignore', 'update-*.js',
  '--ignore', 'quick-*.mjs',
  '--ignore', 'dev-*.mjs',
  '--ignore', 'analytics-data.json',
  'server.mjs'
], {
  stdio: 'inherit',
  cwd: __dirname
});

nodemon.on('error', (error) => {
  logger.error('❌ Error starting nodemon:', error);
  process.exit(1);
});

nodemon.on('exit', (code) => {
  logger.info(`\n🛑 Development server stopped with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('\n🛑 Shutting down development server...');
  nodemon.kill('SIGINT');
});

process.on('SIGTERM', () => {
  logger.info('\n🛑 Shutting down development server...');
  nodemon.kill('SIGTERM');
}); 