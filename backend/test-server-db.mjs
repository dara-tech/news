import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Use the same connection string as the server
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp';
    logger.info('Connecting to:', mongoUri);
    
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testServerDatabase = async () => {
  try {
    await connectDB();

    logger.info('\n=== SERVER DATABASE TEST ===\n');

    // Test all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    logger.info('Collections in database:', collections.map(c => c.name));

    // Test Users
    const User = mongoose.model('User', new mongoose.Schema({}));
    const totalUsers = await User.countDocuments();
    logger.info(`Total Users: ${totalUsers}`);

    // Test News - check all statuses
    const News = mongoose.model('News', new mongoose.Schema({}));
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    logger.info(`Total News: ${totalNews}`);
    logger.info(`Published News: ${publishedNews}`);
    logger.info(`Draft News: ${draftNews}`);

    // Test Comments
    const Comment = mongoose.model('Comment', new mongoose.Schema({}));
    const totalComments = await Comment.countDocuments();
    logger.info(`Total Comments: ${totalComments}`);

    // Test Likes
    const Like = mongoose.model('Like', new mongoose.Schema({}));
    const totalLikes = await Like.countDocuments();
    logger.info(`Total Likes: ${totalLikes}`);

    // Test Categories
    const Category = mongoose.model('Category', new mongoose.Schema({}));
    const totalCategories = await Category.countDocuments();
    logger.info(`Total Categories: ${totalCategories}`);

    // Show all news articles with their status
    if (totalNews > 0) {
      const allNews = await News.find().select('title slug status views createdAt');
      logger.info('\nAll News Articles:');
      allNews.forEach((news, index) => {
        logger.info(`${index + 1}. ${news.title?.en || news.title} (${news.slug}) - Status: ${news.status} - Views: ${news.views || 0}`);
      });
    }

    // Show some sample users
    if (totalUsers > 0) {
      const sampleUsers = await User.find().limit(3).select('username email role createdAt');
      logger.info('\nSample Users:');
      sampleUsers.forEach((user, index) => {
        logger.info(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }

    await mongoose.disconnect();
    logger.info('\nTest completed!');

  } catch (error) {
    logger.error('Error testing server database:', error);
    await mongoose.disconnect();
  }
};

testServerDatabase(); 