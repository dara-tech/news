import mongoose from 'mongoose';
import User from './models/User.mjs';
import News from './models/News.mjs';
import Category from './models/Category.mjs';
import Comment from './models/Comment.mjs';
import Like from './models/Like.mjs';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testDashboardData = async () => {
  try {
    await connectDB();

    console.log('\n=== DASHBOARD DATA TEST ===\n');

    // Test Users
    const totalUsers = await User.countDocuments();
    console.log(`Total Users: ${totalUsers}`);

    const todayUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`Users created today: ${todayUsers}`);

    // Test News
    const totalNews = await News.countDocuments({ status: 'published' });
    console.log(`Total Published News: ${totalNews}`);

    const todayNews = await News.countDocuments({
      status: 'published',
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`News published today: ${todayNews}`);

    // Test Comments
    const totalComments = await Comment.countDocuments();
    console.log(`Total Comments: ${totalComments}`);

    const todayComments = await Comment.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`Comments created today: ${todayComments}`);

    // Test Likes
    const totalLikes = await Like.countDocuments();
    console.log(`Total Likes: ${totalLikes}`);

    const todayLikes = await Like.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`Likes created today: ${todayLikes}`);

    // Test Views
    const totalViewsResult = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: { $ifNull: ['$views', 0] } } } }
    ]);
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
    console.log(`Total Views: ${totalViews}`);

    // Test Categories
    const totalCategories = await Category.countDocuments();
    console.log(`Total Categories: ${totalCategories}`);

    // Show some sample data
    console.log('\n=== SAMPLE DATA ===\n');

    const sampleUsers = await User.find().limit(3).select('username email createdAt');
    console.log('Sample Users:', sampleUsers);

    const sampleNews = await News.find({ status: 'published' }).limit(3).select('title views createdAt');
    console.log('Sample News:', sampleNews);

    const sampleComments = await Comment.find().limit(3).select('content createdAt');
    console.log('Sample Comments:', sampleComments);

    const sampleLikes = await Like.find().limit(3).select('createdAt');
    console.log('Sample Likes:', sampleLikes);

    console.log('\n=== DASHBOARD WOULD SHOW ===\n');
    console.log(`Today's Stats:`);
    console.log(`- Views: ${totalViews}`);
    console.log(`- New Users: ${todayUsers}`);
    console.log(`- New Articles: ${todayNews}`);
    console.log(`- Comments: ${todayComments}`);
    console.log(`- Likes: ${todayLikes}`);

    await mongoose.disconnect();
    console.log('\nTest completed!');

  } catch (error) {
    console.error('Error testing dashboard data:', error);
    await mongoose.disconnect();
  }
};

testDashboardData(); 