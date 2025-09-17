#!/usr/bin/env node

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';

console.log('📊 Performance Monitoring Report');
console.log('================================\n');

// 1. Bundle Analysis
console.log('📦 Bundle Analysis:');
try {
  const buildOutput = execSync('cd frontend && npm run build', { encoding: 'utf8' });
  const bundleMatch = buildOutput.match(/First Load JS shared by all\s+(\d+\.\d+)\s+MB/);
  if (bundleMatch) {
    const bundleSize = parseFloat(bundleMatch[1]);
    console.log(`  Shared JS: ${bundleSize} MB`);
    
    if (bundleSize > 1.0) {
      console.log('  ⚠️  Bundle size is large. Consider code splitting.');
    } else {
      console.log('  ✅ Bundle size is optimized');
    }
  }
} catch (error) {
  console.log('  ❌ Could not analyze bundle size');
}

// 2. Database Performance
console.log('\n🗄️ Database Performance:');
try {
  execSync('cd backend && node scripts/performance-monitor.mjs', { stdio: 'inherit' });
} catch (error) {
  console.log('  ❌ Could not run database performance check');
}

// 3. Memory Usage
console.log('\n💾 Memory Usage:');
const memUsage = process.memoryUsage();
console.log(`  RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);

console.log('\n✅ Performance monitoring completed');
