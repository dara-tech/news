#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting development server (Ctrl+C will be ignored)...');
console.log('💡 To stop the server, use: pkill -f "node server.mjs"');

// Start the server
const server = spawn('node', ['server.mjs'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received - ignoring to keep server running');
  console.log('💡 To stop the server, use: pkill -f "node server.mjs"');
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received - ignoring to keep server running');
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`\n❌ Server exited with code ${code}`);
  process.exit(code);
});

// Handle server errors
server.on('error', (error) => {
  console.error('\n❌ Server error:', error);
  process.exit(1);
}); 