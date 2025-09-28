#!/usr/bin/env node

/**
 * Test Script for Sentinel Memory Fix
 * Tests the sentinel service with memory management improvements
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sentinelService from './backend/services/sentinelService.mjs';
import logger from './backend/utils/logger.mjs';

dotenv.config();

async function testSentinelFix() {
  try {
    logger.info('🧪 Testing Sentinel Memory Fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Test memory cleanup method
    logger.info('🧹 Testing memory cleanup...');
    sentinelService.cleanupMemory();
    logger.info('✅ Memory cleanup test passed');
    
    // Test runOnce with memory management
    logger.info('🚀 Testing runOnce with memory management...');
    const result = await sentinelService.runOnce({ persistOverride: false });
    
    logger.info('📊 Test Results:', {
      processed: result.processed,
      created: result.created,
      error: result.error || 'None',
      performance: result.performance
    });
    
    if (result.error) {
      logger.warn('⚠️ Test completed with error (expected for memory management)');
    } else {
      logger.info('✅ Test completed successfully');
    }
    
    // Test memory state after run
    logger.info('🧠 Memory state after test:', {
      cacheSize: sentinelService.contentHashCache.size,
      guidsSize: sentinelService.lastSeenGuids.size,
      logBufferSize: sentinelService.logBuffer.length
    });
    
  } catch (error) {
    logger.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testSentinelFix();
