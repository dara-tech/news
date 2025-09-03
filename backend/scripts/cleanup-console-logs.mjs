#!/usr/bin/env node

/**
 * Console Log Cleanup Script
 * Removes debug console statements and replaces with proper logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to skip (don't modify these)
const SKIP_FILES = [
  'cleanup-console-logs.mjs',
  'logger.mjs',
  'package.json',
  'package-lock.json'
];

// Patterns to remove (debug console statements)
const REMOVE_PATTERNS = [
  /console\.log\([^)]*DEBUG[^)]*\);?\s*/gi,
  /console\.log\([^)]*🔍[^)]*\);?\s*/gi,
  /console\.log\([^)]*debug[^)]*\);?\s*/gi,
  /console\.log\([^)]*Debug[^)]*\);?\s*/gi,
  /console\.log\([^)]*console\.log[^)]*\);?\s*/gi,
  /\/\/ Debug:.*$/gm,
  /\/\/ Debug logging.*$/gm,
  /\/\/ Debug effect.*$/gm,
];

// Patterns to replace with logger
const REPLACE_PATTERNS = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.info('
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let originalContent = content;

    // Remove debug patterns
    REMOVE_PATTERNS.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Replace console statements with logger
    REPLACE_PATTERNS.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Add logger import if we made changes and it's not already imported
    if (modified && !content.includes('import logger from') && !content.includes('const logger =')) {
      // Find the last import statement
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      if (importLines.length > 0) {
        const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
        const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, insertIndex) + "import logger from '../utils/logger.mjs';\n" + content.slice(insertIndex);
      } else {
        // Add at the beginning if no imports
        content = "import logger from '../utils/logger.mjs';\n" + content;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let totalFiles = 0;
  let modifiedFiles = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and logs directories
        if (item === 'node_modules' || item === 'logs' || item === '.git') {
          continue;
        }
        const result = processDirectory(fullPath);
        totalFiles += result.totalFiles;
        modifiedFiles += result.modifiedFiles;
      } else if (stat.isFile() && item.endsWith('.mjs') && !SKIP_FILES.includes(item)) {
        totalFiles++;
        if (processFile(fullPath)) {
          modifiedFiles++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }

  return { totalFiles, modifiedFiles };
}

// Main execution
console.log('🧹 Starting console log cleanup...\n');

const backendDir = path.join(__dirname, '..');
const result = processDirectory(backendDir);

console.log(`\n📊 Cleanup Summary:`);
console.log(`   Total files processed: ${result.totalFiles}`);
console.log(`   Files modified: ${result.modifiedFiles}`);
console.log(`   Files unchanged: ${result.totalFiles - result.modifiedFiles}`);

if (result.modifiedFiles > 0) {
  console.log('\n✅ Console log cleanup completed successfully!');
  console.log('💡 Remember to test your application after these changes.');
} else {
  console.log('\n✨ No console logs found to clean up.');
}
