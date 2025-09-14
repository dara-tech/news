#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📊 Analyzing bundle size...\n');

// Build the frontend
console.log('🔨 Building frontend...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Analyze bundle with webpack-bundle-analyzer
console.log('📈 Analyzing bundle...');
try {
  execSync('cd frontend && ANALYZE=true npm run build', { stdio: 'inherit' });
  console.log('✅ Bundle analysis completed\n');
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
}

// Check build output size
const buildDir = path.join(process.cwd(), 'frontend', '.next');
if (fs.existsSync(buildDir)) {
  console.log('📁 Build output analysis:');
  
  const getDirSize = (dir) => {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  };
  
  const totalSize = getDirSize(buildDir);
  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log(`  Total build size: ${sizeInMB} MB`);
  
  // Check specific directories
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const staticSize = getDirSize(staticDir);
    const staticSizeMB = (staticSize / 1024 / 1024).toFixed(2);
    console.log(`  Static assets: ${staticSizeMB} MB`);
  }
  
  console.log('');
}

// Check for large dependencies
console.log('🔍 Checking for large dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const largeDeps = [];
  for (const [name, version] of Object.entries(dependencies)) {
    // This is a simplified check - in reality you'd need to check actual bundle size
    if (name.includes('framer-motion') || name.includes('chart') || name.includes('map')) {
      largeDeps.push(name);
    }
  }
  
  if (largeDeps.length > 0) {
    console.log('  Large dependencies found:');
    largeDeps.forEach(dep => console.log(`    - ${dep}`));
  } else {
    console.log('  No obviously large dependencies detected');
  }
  
  console.log('');
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
}

console.log('🎉 Bundle analysis complete!');
console.log('\n💡 Recommendations:');
console.log('  - Use dynamic imports for large components');
console.log('  - Implement code splitting for admin pages');
console.log('  - Consider lazy loading for non-critical features');
console.log('  - Optimize images and assets');

