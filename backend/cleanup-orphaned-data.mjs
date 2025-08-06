import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Like from './models/Like.mjs';
import Comment from './models/Comment.mjs';
import News from './models/News.mjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const cleanupOrphanedData = async () => {
  try {
    console.log('🔍 Starting cleanup of orphaned likes and comments...');
    
    // Get all news IDs that exist
    const existingNewsIds = await News.find({}, '_id');
    const existingNewsIdSet = new Set(existingNewsIds.map(news => news._id.toString()));
    
    console.log(`📰 Found ${existingNewsIdSet.size} existing news articles`);
    
    // Find orphaned likes (likes that reference non-existent news)
    const orphanedLikes = await Like.find({
      news: { $nin: Array.from(existingNewsIdSet) }
    });
    
    console.log(`💔 Found ${orphanedLikes.length} orphaned likes`);
    
    // Find orphaned comments (comments that reference non-existent news)
    const orphanedComments = await Comment.find({
      news: { $nin: Array.from(existingNewsIdSet) }
    });
    
    console.log(`💬 Found ${orphanedComments.length} orphaned comments`);
    
    // Delete orphaned likes
    if (orphanedLikes.length > 0) {
      const likeIds = orphanedLikes.map(like => like._id);
      await Like.deleteMany({ _id: { $in: likeIds } });
      console.log(`✅ Deleted ${orphanedLikes.length} orphaned likes`);
    }
    
    // Delete orphaned comments
    if (orphanedComments.length > 0) {
      const commentIds = orphanedComments.map(comment => comment._id);
      await Comment.deleteMany({ _id: { $in: commentIds } });
      console.log(`✅ Deleted ${orphanedComments.length} orphaned comments`);
    }
    
    if (orphanedLikes.length === 0 && orphanedComments.length === 0) {
      console.log('🎉 No orphaned data found! Database is clean.');
    } else {
      console.log('🎉 Cleanup completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the cleanup
connectDB().then(() => {
  cleanupOrphanedData();
}); 