#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting clean development server...');
console.log('📁 Watching only essential files:');
console.log('   - server.mjs');
console.log('   - routes/');
console.log('   - controllers/');
console.log('   - models/');
console.log('   - middleware/');
console.log('   - config/');
console.log('   - utils/');
console.log('');
console.log('🚫 Ignoring test files and utilities');
console.log('');

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
  console.error('❌ Error starting nodemon:', error);
  process.exit(1);
});

nodemon.on('exit', (code) => {
  console.log(`\n🛑 Development server stopped with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  nodemon.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  nodemon.kill('SIGTERM');
}); 