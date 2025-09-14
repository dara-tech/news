#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Components that need React.memo optimization
const componentsToOptimize = [
  'NewsCard',
  'AuthorProfile', 
  'CategoryFilter',
  'LikeButton',
  'FollowButton',
  'CommentForm',
  'CommentList',
  'RecommendationWidget',
  'SearchResults',
  'AdminDashboard',
  'UserProfile',
  'ImageUpload',
  'ThemeSwitcher',
  'NavigationMenu',
  'Footer',
  'Header'
];

function addReactMemo(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if already has React.memo
    if (content.includes('React.memo(') || content.includes('memo(')) {
      return false;
    }

    // Find export default statements
    const exportDefaultRegex = /export\s+default\s+(\w+)/g;
    const matches = [...content.matchAll(exportDefaultRegex)];
    
    for (const match of matches) {
      const componentName = match[1];
      
      // Skip if it's already a React.memo
      if (content.includes(`export default React.memo(${componentName})`)) {
        continue;
      }

      // Add React import if not present
      if (!content.includes('import React') && !content.includes('import { memo }')) {
        content = content.replace(
          /import\s+React[^;]*;/,
          'import React, { memo } from \'react\';'
        );
        if (!content.includes('import React')) {
          content = 'import React, { memo } from \'react\';\n' + content;
        }
        modified = true;
      }

      // Replace export default with React.memo
      content = content.replace(
        `export default ${componentName}`,
        `export default memo(${componentName})`
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Optimized: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
    return false;
  }
}

function optimizeDirectory(dirPath) {
  let optimizedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        optimizedCount += optimizeDirectory(fullPath);
      } else if (stat.isFile() && item.endsWith('.tsx')) {
        if (addReactMemo(fullPath)) {
          optimizedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
  
  return optimizedCount;
}

console.log('⚡ Starting React.memo optimization...');

const frontendSrc = path.join(__dirname, 'frontend', 'src');
let totalOptimized = 0;

if (fs.existsSync(frontendSrc)) {
  console.log('📁 Optimizing frontend components...');
  totalOptimized += optimizeDirectory(frontendSrc);
}

console.log(`🎉 Optimization complete! Optimized ${totalOptimized} components.`);

