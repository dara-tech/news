#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

dotenv.config();

async function optimizeDatabase() {
  try {
    logger.info('🚀 Starting database optimization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Remove unused indexes
    logger.info('📊 Analyzing and removing unused indexes...');
    
    const collections = ['news', 'users', 'comments', 'likes', 'notifications', 'follows'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        
        logger.info(`\n🔍 Analyzing ${collectionName} (${indexes.length} indexes):`);
        
        // Remove compound indexes that might be redundant
        const indexesToRemove = [];
        
        for (const index of indexes) {
          const indexName = index.name;
          
          // Remove redundant compound indexes
          if (indexName.includes('_1_createdAt_-1') && indexName !== '_id_') {
            // Check if we have simpler indexes that cover this
            const hasSimpleCreatedAt = indexes.some(idx => 
              idx.name === 'createdAt_-1' || idx.name === 'createdAt_1'
            );
            if (hasSimpleCreatedAt) {
              indexesToRemove.push(indexName);
            }
          }
          
          // Remove indexes with too many fields (usually not efficient)
          if (index.key && Object.keys(index.key).length > 3) {
            indexesToRemove.push(indexName);
          }
        }
        
        // Remove identified indexes
        for (const indexName of indexesToRemove) {
          try {
            await collection.dropIndex(indexName);
            logger.info(`  ❌ Removed: ${indexName}`);
          } catch (error) {
            logger.warn(`  ⚠️ Could not remove ${indexName}: ${error.message}`);
          }
        }
        
        if (indexesToRemove.length === 0) {
          logger.info(`  ✅ No redundant indexes found`);
        }
        
      } catch (error) {
        logger.warn(`⚠️ Error analyzing ${collectionName}: ${error.message}`);
      }
    }

    // 2. Create optimized compound indexes
    logger.info('\n🔧 Creating optimized compound indexes...');
    
    // News collection - most important indexes
    const newsCollection = db.collection('news');
    try {
      // Primary query index
      await newsCollection.createIndex(
        { status: 1, publishedAt: -1, createdAt: -1 },
        { name: 'status_publishedAt_createdAt', background: true }
      );
      
      // Category query index
      await newsCollection.createIndex(
        { category: 1, status: 1, publishedAt: -1 },
        { name: 'category_status_publishedAt', background: true }
      );
      
      // Author query index
      await newsCollection.createIndex(
        { author: 1, status: 1, publishedAt: -1 },
        { name: 'author_status_publishedAt', background: true }
      );
      
      // Featured/Breaking index
      await newsCollection.createIndex(
        { isFeatured: 1, isBreaking: 1, publishedAt: -1 },
        { name: 'featured_breaking_publishedAt', background: true }
      );
      
      logger.info('  ✅ Created optimized news indexes');
    } catch (error) {
      logger.warn(`  ⚠️ Error creating news indexes: ${error.message}`);
    }

    // Comments collection
    const commentsCollection = db.collection('comments');
    try {
      await commentsCollection.createIndex(
        { news: 1, parentComment: 1, status: 1, createdAt: -1 },
        { name: 'news_parent_status_createdAt', background: true }
      );
      
      await commentsCollection.createIndex(
        { user: 1, createdAt: -1 },
        { name: 'user_createdAt', background: true }
      );
      
      logger.info('  ✅ Created optimized comment indexes');
    } catch (error) {
      logger.warn(`  ⚠️ Error creating comment indexes: ${error.message}`);
    }

    // Users collection
    const usersCollection = db.collection('users');
    try {
      await usersCollection.createIndex(
        { role: 1, status: 1, createdAt: -1 },
        { name: 'role_status_createdAt', background: true }
      );
      
      logger.info('  ✅ Created optimized user indexes');
    } catch (error) {
      logger.warn(`  ⚠️ Error creating user indexes: ${error.message}`);
    }

    // 3. Analyze final index usage
    logger.info('\n📈 Final index analysis:');
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const stats = await collection.stats();
        
        logger.info(`${collectionName}:`);
        logger.info(`  Indexes: ${indexes.length}`);
        logger.info(`  Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
        logger.info(`  Data Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        logger.info(`  Ratio: ${(stats.totalIndexSize / stats.size).toFixed(2)}x`);
      } catch (error) {
        logger.warn(`⚠️ Could not analyze ${collectionName}: ${error.message}`);
      }
    }

    // 4. Test query performance
    logger.info('\n⚡ Testing query performance...');
    
    const testQueries = [
      {
        name: 'News by Status and Date',
        collection: 'news',
        query: { status: 'published' },
        sort: { publishedAt: -1 },
        limit: 10
      },
      {
        name: 'Comments by News',
        collection: 'comments',
        query: { status: 'approved' },
        sort: { createdAt: -1 },
        limit: 20
      }
    ];

    for (const testQuery of testQueries) {
      try {
        const startTime = Date.now();
        const collection = db.collection(testQuery.collection);
        await collection.find(testQuery.query)
          .sort(testQuery.sort || {})
          .limit(testQuery.limit || 0)
          .toArray();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.info(`${testQuery.name}: ${duration}ms`);
      } catch (error) {
        logger.warn(`⚠️ Query test failed for ${testQuery.name}: ${error.message}`);
      }
    }

    logger.info('\n✅ Database optimization completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database optimization failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  }
}

// Run optimization
optimizeDatabase();