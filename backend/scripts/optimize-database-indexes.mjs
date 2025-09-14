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

// Index optimization function
const optimizeIndexes = async () => {
  try {
    const db = mongoose.connection.db;// News collection indexesawait db.collection('news').createIndex({ createdAt: -1 });
    await db.collection('news').createIndex({ category: 1 });
    await db.collection('news').createIndex({ status: 1 });
    await db.collection('news').createIndex({ author: 1 });
    await db.collection('news').createIndex({ publishedAt: -1 });
    await db.collection('news').createIndex({ views: -1 });
    await db.collection('news').createIndex({ likes: -1 });
    await db.collection('news').createIndex({ slug: 1 }, { unique: true });
    await db.collection('news').createIndex({ title: 'text', content: 'text' });
    await db.collection('news').createIndex({ category: 1, status: 1, publishedAt: -1 });// Users collection indexesawait db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ lastLogin: -1 });
    await db.collection('users').createIndex({ isActive: 1 });// Categories collection indexesawait db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ name: 1 });
    await db.collection('categories').createIndex({ isActive: 1 });
    await db.collection('categories').createIndex({ createdAt: -1 });// Comments collection indexesawait db.collection('comments').createIndex({ articleId: 1 });
    await db.collection('comments').createIndex({ userId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    await db.collection('comments').createIndex({ isApproved: 1 });
    await db.collection('comments').createIndex({ articleId: 1, createdAt: -1 });// Likes collection indexesawait db.collection('likes').createIndex({ articleId: 1, userId: 1 }, { unique: true });
    await db.collection('likes').createIndex({ articleId: 1 });
    await db.collection('likes').createIndex({ userId: 1 });
    await db.collection('likes').createIndex({ createdAt: -1 });// Follows collection indexesawait db.collection('follows').createIndex({ followerId: 1, followingId: 1 }, { unique: true });
    await db.collection('follows').createIndex({ followerId: 1 });
    await db.collection('follows').createIndex({ followingId: 1 });
    await db.collection('follows').createIndex({ createdAt: -1 });// Analytics collection indexesawait db.collection('analytics').createIndex({ date: -1 });
    await db.collection('analytics').createIndex({ type: 1 });
    await db.collection('analytics').createIndex({ articleId: 1 });
    await db.collection('analytics').createIndex({ userId: 1 });
    await db.collection('analytics').createIndex({ type: 1, date: -1 });// Sessions collection indexesawait db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
    await db.collection('sessions').createIndex({ sessionId: 1 });// Settings collection indexesawait db.collection('settings').createIndex({ category: 1, key: 1 }, { unique: true });
    await db.collection('settings').createIndex({ category: 1 });// Notifications collection indexesawait db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ isRead: 1 });
    await db.collection('notifications').createIndex({ createdAt: -1 });
    await db.collection('notifications').createIndex({ userId: 1, isRead: 1, createdAt: -1 });// Show index statistics
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();}

  } catch (error) {}
};

// Main execution
const main = async () => {
  await connectDB();
  await optimizeIndexes();
  await mongoose.connection.close();};

main().catch(console.error);

