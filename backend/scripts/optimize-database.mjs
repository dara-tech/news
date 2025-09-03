#!/usr/bin/env node

/**
 * Database Optimization Script
 * Creates indexes and optimizes database performance
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

dotenv.config();

/**
 * Helper function to create index only if it doesn't exist
 */
async function createIndexIfNotExists(collection, indexSpec, options = {}) {
  try {
    const indexes = await collection.indexes();
    const indexExists = indexes.some(index => 
      JSON.stringify(index.key) === JSON.stringify(indexSpec)
    );
    
    if (!indexExists) {
      await collection.createIndex(indexSpec, options);
      logger.debug(`Created index: ${JSON.stringify(indexSpec)}`);
    } else {
      logger.debug(`Index already exists: ${JSON.stringify(indexSpec)}`);
    }
  } catch (error) {
    if (error.code === 85) {
      // Index already exists with different options
      logger.debug(`Index already exists with different options: ${JSON.stringify(indexSpec)}`);
    } else {
      throw error;
    }
  }
}

async function optimizeDatabase() {
  try {
    logger.info('🔧 Starting database optimization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // News collection indexes
    logger.info('📰 Optimizing News collection...');
    await createIndexIfNotExists(db.collection('news'), { slug: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('news'), { status: 1, publishedAt: -1 });
    await createIndexIfNotExists(db.collection('news'), { category: 1, publishedAt: -1 });
    await createIndexIfNotExists(db.collection('news'), { author: 1, publishedAt: -1 });
    await createIndexIfNotExists(db.collection('news'), { tags: 1 });
    await createIndexIfNotExists(db.collection('news'), { isFeatured: 1, publishedAt: -1 });
    await createIndexIfNotExists(db.collection('news'), { isBreaking: 1, publishedAt: -1 });
    await createIndexIfNotExists(db.collection('news'), { views: -1 });
    await createIndexIfNotExists(db.collection('news'), { 'source.guid': 1 });
    logger.info('✅ News indexes created');

    // Users collection indexes
    logger.info('👥 Optimizing Users collection...');
    await createIndexIfNotExists(db.collection('users'), { email: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('users'), { role: 1 });
    await createIndexIfNotExists(db.collection('users'), { createdAt: -1 });
    await createIndexIfNotExists(db.collection('users'), { lastLoginAt: -1 });
    logger.info('✅ Users indexes created');

    // Categories collection indexes
    logger.info('📂 Optimizing Categories collection...');
    await createIndexIfNotExists(db.collection('categories'), { slug: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('categories'), { 'name.en': 1 });
    logger.info('✅ Categories indexes created');

    // Comments collection indexes
    logger.info('💬 Optimizing Comments collection...');
    await createIndexIfNotExists(db.collection('comments'), { news: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('comments'), { author: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('comments'), { status: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('comments'), { parentComment: 1 });
    logger.info('✅ Comments indexes created');

    // Likes collection indexes
    logger.info('❤️ Optimizing Likes collection...');
    await createIndexIfNotExists(db.collection('likes'), { news: 1, user: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('likes'), { user: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('likes'), { news: 1, createdAt: -1 });
    logger.info('✅ Likes indexes created');

    // Notifications collection indexes
    logger.info('🔔 Optimizing Notifications collection...');
    await createIndexIfNotExists(db.collection('notifications'), { user: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('notifications'), { type: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('notifications'), { isRead: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('notifications'), { expiresAt: 1 }, { expireAfterSeconds: 0 });
    logger.info('✅ Notifications indexes created');

    // Follows collection indexes
    logger.info('👥 Optimizing Follows collection...');
    await createIndexIfNotExists(db.collection('follows'), { follower: 1, following: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('follows'), { follower: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('follows'), { following: 1, createdAt: -1 });
    logger.info('✅ Follows indexes created');

    // Settings collection indexes
    logger.info('⚙️ Optimizing Settings collection...');
    await createIndexIfNotExists(db.collection('settings'), { category: 1, key: 1 }, { unique: true });
    await createIndexIfNotExists(db.collection('settings'), { category: 1 });
    logger.info('✅ Settings indexes created');

    // Activity logs collection indexes
    logger.info('📊 Optimizing ActivityLogs collection...');
    await createIndexIfNotExists(db.collection('activitylogs'), { user: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('activitylogs'), { action: 1, createdAt: -1 });
    await createIndexIfNotExists(db.collection('activitylogs'), { createdAt: -1 });
    // TTL index for automatic cleanup (keep logs for 90 days)
    await createIndexIfNotExists(db.collection('activitylogs'), { createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
    logger.info('✅ ActivityLogs indexes created');

    // User logins collection indexes
    logger.info('🔐 Optimizing UserLogins collection...');
    await createIndexIfNotExists(db.collection('userlogins'), { user: 1, loginAt: -1 });
    await createIndexIfNotExists(db.collection('userlogins'), { ipAddress: 1, loginAt: -1 });
    await createIndexIfNotExists(db.collection('userlogins'), { userAgent: 1, loginAt: -1 });
    await createIndexIfNotExists(db.collection('userlogins'), { loginAt: -1 });
    // TTL index for automatic cleanup (keep login logs for 30 days)
    await createIndexIfNotExists(db.collection('userlogins'), { loginAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
    logger.info('✅ UserLogins indexes created');

    // Sessions collection indexes
    logger.info('🔑 Optimizing Sessions collection...');
    await createIndexIfNotExists(db.collection('sessions'), { expires: 1 }, { expireAfterSeconds: 0 });
    await createIndexIfNotExists(db.collection('sessions'), { 'session.user': 1 });
    logger.info('✅ Sessions indexes created');

    logger.info('🎉 Database optimization completed successfully!');
    
    // Display index statistics
    const collections = ['news', 'users', 'categories', 'comments', 'likes', 'notifications', 'follows', 'settings', 'activitylogs', 'userlogins', 'sessions'];
    
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        logger.info(`📊 ${collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        logger.warn(`⚠️ Could not get indexes for ${collectionName}: ${error.message}`);
      }
    }

  } catch (error) {
    logger.error('❌ Database optimization failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  }
}

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeDatabase()
    .then(() => {
      logger.info('✅ Database optimization script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Database optimization script failed:', error);
      process.exit(1);
    });
}

export default optimizeDatabase;
