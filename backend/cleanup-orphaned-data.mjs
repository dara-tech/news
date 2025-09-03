import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Like from './models/Like.mjs';
import Comment from './models/Comment.mjs';
import News from './models/News.mjs';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const cleanupOrphanedData = async () => {
  try {
    // Get all news IDs that exist
    const existingNewsIds = await News.find({}, '_id');
    const existingNewsIdSet = new Set(existingNewsIds.map(news => news._id.toString()));
    
    logger.info(`📰 Found ${existingNewsIdSet.size} existing news articles`);
    
    // Find orphaned likes (likes that reference non-existent news)
    const orphanedLikes = await Like.find({
      news: { $nin: Array.from(existingNewsIdSet) }
    });
    
    logger.info(`💔 Found ${orphanedLikes.length} orphaned likes`);
    
    // Find orphaned comments (comments that reference non-existent news)
    const orphanedComments = await Comment.find({
      news: { $nin: Array.from(existingNewsIdSet) }
    });
    
    logger.info(`💬 Found ${orphanedComments.length} orphaned comments`);
    
    // Delete orphaned likes
    if (orphanedLikes.length > 0) {
      const likeIds = orphanedLikes.map(like => like._id);
      await Like.deleteMany({ _id: { $in: likeIds } });
      logger.info(`✅ Deleted ${orphanedLikes.length} orphaned likes`);
    }
    
    // Delete orphaned comments
    if (orphanedComments.length > 0) {
      const commentIds = orphanedComments.map(comment => comment._id);
      await Comment.deleteMany({ _id: { $in: commentIds } });
      logger.info(`✅ Deleted ${orphanedComments.length} orphaned comments`);
    }
    
    if (orphanedLikes.length === 0 && orphanedComments.length === 0) {
      logger.info('🎉 No orphaned data found! Database is clean.');
    } else {
      logger.info('🎉 Cleanup completed successfully!');
    }
    
  } catch (error) {
    logger.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from database');
  }
};

// Run the cleanup
connectDB().then(() => {
  cleanupOrphanedData();
}); 