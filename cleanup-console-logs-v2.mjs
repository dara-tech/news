#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const FRONTEND_SRC = './frontend/src';
const BACKEND_SRC = './backend';

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Console methods to remove
const CONSOLE_METHODS = [
  'console.log',
  'console.warn', 
  'console.error',
  'console.info',
  'console.debug',
  'console.trace',
  'console.table',
  'console.group',
  'console.groupEnd',
  'console.time',
  'console.timeEnd',
  'console.count',
  'console.clear'
];

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  return EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
}

function removeConsoleStatements(content) {
  let modified = false;
  let newContent = content;
  
  // Remove single line console statements
  CONSOLE_METHODS.forEach(method => {
    // Match console.method(...) with optional semicolon
    const singleLineRegex = new RegExp(`\\s*${method.replace('.', '\\.')}\\([^;]*\\);?\\s*\\n?`, 'g');
    if (singleLineRegex.test(newContent)) {
      newContent = newContent.replace(singleLineRegex, '');
      modified = true;
    }
  });
  
  // Remove multi-line console statements (basic)
  CONSOLE_METHODS.forEach(method => {
    // Match console.method({...}) or console.method([...]) with proper bracket matching
    const multiLineRegex = new RegExp(`\\s*${method.replace('.', '\\.')}\\(\\{[\\s\\S]*?\\}\\);?\\s*\\n?`, 'g');
    if (multiLineRegex.test(newContent)) {
      newContent = newContent.replace(multiLineRegex, '');
      modified = true;
    }
    
    const arrayRegex = new RegExp(`\\s*${method.replace('.', '\\.')}\\(\\[[\\s\\S]*?\\]\\);?\\s*\\n?`, 'g');
    if (arrayRegex.test(newContent)) {
      newContent = newContent.replace(arrayRegex, '');
      modified = true;
    }
  });
  
  // Remove console statements that are part of if conditions
  CONSOLE_METHODS.forEach(method => {
    const ifRegex = new RegExp(`\\s*if\\s*\\([^)]*\\)\\s*{\\s*${method.replace('.', '\\.')}\\([^;]*\\);?\\s*\\n?\\s*}\\s*\\n?`, 'g');
    if (ifRegex.test(newContent)) {
      newContent = newContent.replace(ifRegex, '');
      modified = true;
    }
  });
  
  return { content: newContent, modified };
}

function processDirectory(dirPath) {
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  function processFile(filePath) {
    if (!shouldProcessFile(filePath)) return;
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const { content: newContent, modified } = removeConsoleStatements(content);
      
      totalFiles++;
      
      if (modified) {
        writeFileSync(filePath, newContent, 'utf8');
        modifiedFiles++;
        console.log(`✅ Cleaned: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  function walkDir(currentPath) {
    const items = readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        processFile(fullPath);
      }
    }
  }
  
  walkDir(dirPath);
  return { totalFiles, modifiedFiles };
}

console.log('🧹 Starting console.log cleanup...\n');

// Process frontend
console.log('📁 Processing frontend...');
const frontendResult = processDirectory(FRONTEND_SRC);

// Process backend  
console.log('\n📁 Processing backend...');
const backendResult = processDirectory(BACKEND_SRC);

console.log('\n📊 Cleanup Summary:');
console.log(`Frontend: ${frontendResult.modifiedFiles}/${frontendResult.totalFiles} files cleaned`);
console.log(`Backend: ${backendResult.modifiedFiles}/${backendResult.totalFiles} files cleaned`);
console.log(`Total: ${frontendResult.modifiedFiles + backendResult.modifiedFiles}/${frontendResult.totalFiles + backendResult.totalFiles} files cleaned`);

console.log('\n✅ Console.log cleanup completed!');
