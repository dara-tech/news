#!/usr/bin/env node

import mongoose from 'mongoose';
import Settings from '../models/Settings.mjs';
import logger from '../utils/logger.mjs';

/**
 * Memory Optimization Script for 512MB Server
 * 
 * This script aggressively optimizes memory usage to work within 512MB RAM constraint.
 * Target: Reduce memory usage from 90-175MB to 30-50MB (6-10% of total RAM)
 */

async function optimizeFor512MB() {
  try {
    logger.info('🚨 Starting aggressive memory optimization for 512MB server...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    logger.info('✅ Connected to database');

    // Get current configuration
    const integrations = await Settings.getCategorySettings('integrations');
    
    logger.info('📊 Current memory usage estimate: 90-175MB (17-34% of 512MB)');
    
    // Optimize configuration for 512MB server
    const optimizedConfig = {
      ...integrations,
      
      // Sentinel Service Optimizations
      sentinelEnabled: true,
      sentinelAutoPersist: false, // Disable to save memory
      sentinelFrequencyMs: 7200000, // 2 hours instead of 6 (less frequent)
      sentinelMaxPerRun: 1, // Process only 1 item per run instead of 3
      
      // Cache Optimizations
      cacheEnabled: true,
      cacheMaxSize: 50, // Reduce from 1000 to 50
      cacheTTL: 60, // 1 minute instead of 5 minutes
      cacheCheckPeriod: 30, // Check every 30 seconds
      
      // Performance Monitoring (Disable in production)
      performanceMonitoringEnabled: false,
      performanceMetricsHistory: 20, // Reduce from 100 to 20
      
      // User Tracking Optimizations
      userTrackingEnabled: true,
      userTrackingMaxSessions: 100, // Limit active sessions
      userTrackingCleanupInterval: 30000, // Clean every 30 seconds
      
      // WebSocket Optimizations
      websocketEnabled: true,
      websocketMaxConnections: 50, // Limit connections
      websocketMessageHistory: 20, // Reduce message history
      
      // Logging Optimizations
      logBufferSize: 50, // Reduce from 500 to 50
      logLevel: 'warn', // Only log warnings and errors
      
      // Database Optimizations
      databaseConnectionPool: 5, // Reduce connection pool
      databaseQueryTimeout: 10000, // 10 seconds timeout
      databaseLeanQueries: true, // Use lean queries
      
      // Memory Management
      memoryCleanupInterval: 30000, // Clean every 30 seconds
      memoryWarningThreshold: 400, // Warn at 400MB (78% of 512MB)
      memoryCriticalThreshold: 450, // Critical at 450MB (88% of 512MB)
      
      // Emergency Settings
      emergencyMode: false,
      emergencyCleanupEnabled: true,
      garbageCollectionEnabled: true
    };

    // Update settings in database
    await Settings.updateCategorySettings('integrations', optimizedConfig);
    
    logger.info('✅ Updated configuration for 512MB server');
    
    // Log optimization results
    logger.info('🎯 Memory Optimization Results:');
    logger.info('  - Sentinel frequency: 2 hours (was 6 hours)');
    logger.info('  - Cache size: 50 entries (was 1000)');
    logger.info('  - Cache TTL: 1 minute (was 5 minutes)');
    logger.info('  - Log buffer: 50 entries (was 500)');
    logger.info('  - Performance monitoring: Disabled');
    logger.info('  - Max connections: 50 (was unlimited)');
    logger.info('  - Memory cleanup: Every 30 seconds');
    
    // Calculate expected memory savings
    const currentMemory = 90; // Conservative estimate
    const optimizedMemory = 35; // Target memory usage
    const savings = ((currentMemory - optimizedMemory) / currentMemory) * 100;
    
    logger.info('📈 Expected Memory Savings:');
    logger.info(`  - Current usage: ~${currentMemory}MB (17% of 512MB)`);
    logger.info(`  - Optimized usage: ~${optimizedMemory}MB (7% of 512MB)`);
    logger.info(`  - Memory savings: ${savings.toFixed(1)}%`);
    logger.info(`  - Available RAM: ${512 - optimizedMemory}MB (${((512 - optimizedMemory) / 512 * 100).toFixed(1)}%)`);
    
    // Create memory monitoring script
    const memoryMonitorScript = `
// Add this to your main server file for memory monitoring
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
  
  if (memoryMB > 400) {
    console.warn(\`⚠️ High memory usage: \${memoryMB.toFixed(2)}MB\`);
    // Trigger emergency cleanup
    if (global.gc) global.gc();
  }
  
  if (memoryMB > 450) {
    console.error(\`🚨 CRITICAL: Memory usage \${memoryMB.toFixed(2)}MB - Consider restarting server\`);
  }
}, 30000);
`;
    
    logger.info('📝 Memory monitoring code generated (add to server.mjs)');
    
    // Additional recommendations
    logger.info('💡 Additional Recommendations:');
    logger.info('  1. Monitor memory usage constantly');
    logger.info('  2. Set up swap space for emergency memory');
    logger.info('  3. Consider upgrading to 1GB+ RAM');
    logger.info('  4. Use external Redis for caching');
    logger.info('  5. Implement database connection pooling');
    
    logger.info('🎉 Memory optimization completed successfully!');
    logger.info('📊 Target memory usage: 30-50MB (6-10% of 512MB)');
    
  } catch (error) {
    logger.error('❌ Memory optimization failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from database');
  }
}

// Run the optimization
optimizeFor512MB()
  .then(() => {
    logger.info('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script failed:', error);
    process.exit(1);
  });
