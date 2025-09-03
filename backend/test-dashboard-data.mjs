import mongoose from 'mongoose';
import User from './models/User.mjs';
import News from './models/News.mjs';
import Category from './models/Category.mjs';
import Comment from './models/Comment.mjs';
import Like from './models/Like.mjs';
import logger from '../utils/logger.mjs';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testDashboardData = async () => {
  try {
    await connectDB();

    logger.info('\n=== DASHBOARD DATA TEST ===\n');

    // Test Users
    const totalUsers = await User.countDocuments();
    logger.info(`Total Users: ${totalUsers}`);

    const todayUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    logger.info(`Users created today: ${todayUsers}`);

    // Test News
    const totalNews = await News.countDocuments({ status: 'published' });
    logger.info(`Total Published News: ${totalNews}`);

    const todayNews = await News.countDocuments({
      status: 'published',
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    logger.info(`News published today: ${todayNews}`);

    // Test Comments
    const totalComments = await Comment.countDocuments();
    logger.info(`Total Comments: ${totalComments}`);

    const todayComments = await Comment.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    logger.info(`Comments created today: ${todayComments}`);

    // Test Likes
    const totalLikes = await Like.countDocuments();
    logger.info(`Total Likes: ${totalLikes}`);

    const todayLikes = await Like.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    logger.info(`Likes created today: ${todayLikes}`);

    // Test Views
    const totalViewsResult = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$views', 0] } } } }
    ]);
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
    logger.info(`Total Views: ${totalViews}`);

    // Test Categories
    const totalCategories = await Category.countDocuments();
    logger.info(`Total Categories: ${totalCategories}`);

    // Show some sample data
    logger.info('\n=== SAMPLE DATA ===\n');

    const sampleUsers = await User.find().limit(3).select('username email createdAt');
    logger.info('Sample Users:', sampleUsers);

    const sampleNews = await News.find({ status: 'published' }).limit(3).select('title views createdAt');
    logger.info('Sample News:', sampleNews);

    const sampleComments = await Comment.find().limit(3).select('content createdAt');
    logger.info('Sample Comments:', sampleComments);

    const sampleLikes = await Like.find().limit(3).select('createdAt');
    logger.info('Sample Likes:', sampleLikes);

    logger.info('\n=== DASHBOARD WOULD SHOW ===\n');
    logger.info(`Today's Stats:`);
    logger.info(`- Views: ${totalViews}`);
    logger.info(`- New Users: ${todayUsers}`);
    logger.info(`- New Articles: ${todayNews}`);
    logger.info(`- Comments: ${todayComments}`);
    logger.info(`- Likes: ${todayLikes}`);

    await mongoose.disconnect();
    logger.info('\nTest completed!');

  } catch (error) {
    logger.error('Error testing dashboard data:', error);
    await mongoose.disconnect();
  }
};

testDashboardData(); 