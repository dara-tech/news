#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);} catch (error) {process.exit(1);
  }
};

// Safe index creation function
const createIndexIfNotExists = async (collection, indexSpec, options = {}) => {
  try {
    const indexes = await collection.indexes();
    const indexExists = indexes.some(index => 
      JSON.stringify(index.key) === JSON.stringify(indexSpec)
    );
    
    if (!indexExists) {
      await collection.createIndex(indexSpec, options);return true;
    } else {return false;
    }
  } catch (error) {return false;
  }
};

// Index optimization function
const optimizeIndexes = async () => {
  try {
    const db = mongoose.connection.db;// News collection indexesconst newsCollection = db.collection('news');
    
    await createIndexIfNotExists(newsCollection, { createdAt: -1 });
    await createIndexIfNotExists(newsCollection, { category: 1 });
    await createIndexIfNotExists(newsCollection, { status: 1 });
    await createIndexIfNotExists(newsCollection, { author: 1 });
    await createIndexIfNotExists(newsCollection, { publishedAt: -1 });
    await createIndexIfNotExists(newsCollection, { views: -1 });
    await createIndexIfNotExists(newsCollection, { likes: -1 });
    await createIndexIfNotExists(newsCollection, { slug: 1 }, { unique: true });
    await createIndexIfNotExists(newsCollection, { category: 1, status: 1, publishedAt: -1 });
    
    // Users collection indexesconst usersCollection = db.collection('users');
    
    await createIndexIfNotExists(usersCollection, { email: 1 }, { unique: true });
    await createIndexIfNotExists(usersCollection, { role: 1 });
    await createIndexIfNotExists(usersCollection, { createdAt: -1 });
    await createIndexIfNotExists(usersCollection, { lastLogin: -1 });
    await createIndexIfNotExists(usersCollection, { isActive: 1 });
    
    // Categories collection indexesconst categoriesCollection = db.collection('categories');
    
    await createIndexIfNotExists(categoriesCollection, { slug: 1 }, { unique: true });
    await createIndexIfNotExists(categoriesCollection, { name: 1 });
    await createIndexIfNotExists(categoriesCollection, { isActive: 1 });
    await createIndexIfNotExists(categoriesCollection, { createdAt: -1 });
    
    // Comments collection indexesconst commentsCollection = db.collection('comments');
    
    await createIndexIfNotExists(commentsCollection, { articleId: 1 });
    await createIndexIfNotExists(commentsCollection, { userId: 1 });
    await createIndexIfNotExists(commentsCollection, { createdAt: -1 });
    await createIndexIfNotExists(commentsCollection, { isApproved: 1 });
    await createIndexIfNotExists(commentsCollection, { articleId: 1, createdAt: -1 });
    
    // Likes collection indexesconst likesCollection = db.collection('likes');
    
    await createIndexIfNotExists(likesCollection, { articleId: 1, userId: 1 }, { unique: true });
    await createIndexIfNotExists(likesCollection, { articleId: 1 });
    await createIndexIfNotExists(likesCollection, { userId: 1 });
    await createIndexIfNotExists(likesCollection, { createdAt: -1 });
    
    // Follows collection indexesconst followsCollection = db.collection('follows');
    
    await createIndexIfNotExists(followsCollection, { followerId: 1, followingId: 1 }, { unique: true });
    await createIndexIfNotExists(followsCollection, { followerId: 1 });
    await createIndexIfNotExists(followsCollection, { followingId: 1 });
    await createIndexIfNotExists(followsCollection, { createdAt: -1 });
    
    // Analytics collection indexesconst analyticsCollection = db.collection('analytics');
    
    await createIndexIfNotExists(analyticsCollection, { date: -1 });
    await createIndexIfNotExists(analyticsCollection, { type: 1 });
    await createIndexIfNotExists(analyticsCollection, { articleId: 1 });
    await createIndexIfNotExists(analyticsCollection, { userId: 1 });
    await createIndexIfNotExists(analyticsCollection, { type: 1, date: -1 });
    
    // Sessions collection indexesconst sessionsCollection = db.collection('sessions');
    
    await createIndexIfNotExists(sessionsCollection, { expires: 1 }, { expireAfterSeconds: 0 });
    await createIndexIfNotExists(sessionsCollection, { sessionId: 1 });
    
    // Settings collection indexesconst settingsCollection = db.collection('settings');
    
    await createIndexIfNotExists(settingsCollection, { category: 1, key: 1 }, { unique: true });
    await createIndexIfNotExists(settingsCollection, { category: 1 });
    
    // Notifications collection indexesconst notificationsCollection = db.collection('notifications');
    
    await createIndexIfNotExists(notificationsCollection, { userId: 1 });
    await createIndexIfNotExists(notificationsCollection, { isRead: 1 });
    await createIndexIfNotExists(notificationsCollection, { createdAt: -1 });
    await createIndexIfNotExists(notificationsCollection, { userId: 1, isRead: 1, createdAt: -1 });// Show index statistics
    const collections = await db.listCollections().toArray();for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();}

  } catch (error) {}
};

// Main execution
const main = async () => {
  await connectDB();
  await optimizeIndexes();
  await mongoose.connection.close();};

main().catch(console.error);

