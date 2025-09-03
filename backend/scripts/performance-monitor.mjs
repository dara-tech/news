#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Monitors and reports on application performance metrics
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

dotenv.config();

async function monitorPerformance() {
  try {
    logger.info('📊 Starting performance monitoring...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Collection statistics
    const collections = ['news', 'users', 'categories', 'comments', 'likes', 'notifications', 'follows', 'settings', 'activitylogs', 'userlogins', 'sessions'];
    
    logger.info('📈 Collection Statistics:');
    logger.info('========================');
    
    for (const collectionName of collections) {
      try {
        const stats = await db.collection(collectionName).stats();
        const count = await db.collection(collectionName).countDocuments();
        
        logger.info(`${collectionName}:`);
        logger.info(`  Documents: ${count.toLocaleString()}`);
        logger.info(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        logger.info(`  Indexes: ${stats.nindexes}`);
        logger.info(`  Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
        logger.info('');
      } catch (error) {
        logger.warn(`⚠️ Could not get stats for ${collectionName}: ${error.message}`);
      }
    }

    // Database performance metrics
    logger.info('🔍 Database Performance Metrics:');
    logger.info('================================');
    
    const dbStats = await db.stats();
    logger.info(`Total Collections: ${dbStats.collections}`);
    logger.info(`Total Documents: ${dbStats.objects.toLocaleString()}`);
    logger.info(`Total Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`Total Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`Total Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info('');

    // Index usage analysis
    logger.info('📊 Index Usage Analysis:');
    logger.info('========================');
    
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        logger.info(`${collectionName} (${indexes.length} indexes):`);
        
        for (const index of indexes) {
          const indexName = index.name;
          const indexSize = index.size ? (index.size / 1024).toFixed(2) + ' KB' : 'Unknown';
          logger.info(`  - ${indexName}: ${indexSize}`);
        }
        logger.info('');
      } catch (error) {
        logger.warn(`⚠️ Could not analyze indexes for ${collectionName}: ${error.message}`);
      }
    }

    // Query performance analysis
    logger.info('⚡ Query Performance Analysis:');
    logger.info('==============================');
    
    // Test common queries
    const testQueries = [
      {
        name: 'News by Status and Date',
        query: { status: 'published' },
        sort: { publishedAt: -1 },
        limit: 10
      },
      {
        name: 'Users by Role',
        query: { role: 'admin' },
        sort: { createdAt: -1 }
      },
      {
        name: 'Comments by News',
        query: { status: 'approved' },
        sort: { createdAt: -1 },
        limit: 20
      }
    ];

    for (const testQuery of testQueries) {
      try {
        const startTime = Date.now();
        const collection = db.collection(testQuery.name.toLowerCase().split(' ')[0] + 's');
        await collection.find(testQuery.query).sort(testQuery.sort || {}).limit(testQuery.limit || 0).toArray();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.info(`${testQuery.name}: ${duration}ms`);
      } catch (error) {
        logger.warn(`⚠️ Query test failed for ${testQuery.name}: ${error.message}`);
      }
    }

    // Memory usage
    logger.info('💾 Memory Usage:');
    logger.info('===============');
    const memUsage = process.memoryUsage();
    logger.info(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);
    logger.info('');

    // Performance recommendations
    logger.info('💡 Performance Recommendations:');
    logger.info('===============================');
    
    if (dbStats.indexSize > dbStats.dataSize * 0.5) {
      logger.warn('⚠️ Index size is large compared to data size. Consider reviewing indexes.');
    }
    
    if (dbStats.storageSize > dbStats.dataSize * 2) {
      logger.warn('⚠️ Storage size is large compared to data size. Consider running compact.');
    }
    
    const totalDocs = dbStats.objects;
    if (totalDocs > 100000) {
      logger.info('✅ Large dataset detected. Consider implementing pagination and caching.');
    }
    
    logger.info('✅ Performance monitoring completed successfully!');

  } catch (error) {
    logger.error('❌ Performance monitoring failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  }
}

// Run monitoring if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  monitorPerformance()
    .then(() => {
      logger.info('✅ Performance monitoring script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Performance monitoring script failed:', error);
      process.exit(1);
    });
}

export default monitorPerformance;
