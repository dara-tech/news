#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to clean console statements from a file
function cleanConsoleStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace console.log with comments or remove
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.error\([^)]*\);?\s*/g, '');
    
    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and clean files
function cleanDirectory(dirPath) {
  let cleanedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        cleanedCount += cleanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
        if (cleanConsoleStatements(fullPath)) {
          cleanedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
  
  return cleanedCount;
}

// Main execution
console.log('🧹 Starting console.log cleanup...');

const frontendSrc = path.join(__dirname, 'frontend', 'src');
const backendSrc = path.join(__dirname, 'backend');

let totalCleaned = 0;

if (fs.existsSync(frontendSrc)) {
  console.log('📁 Cleaning frontend...');
  totalCleaned += cleanDirectory(frontendSrc);
}

if (fs.existsSync(backendSrc)) {
  console.log('📁 Cleaning backend...');
  totalCleaned += cleanDirectory(backendSrc);
}

console.log(`🎉 Cleanup complete! Cleaned ${totalCleaned} files.`);

