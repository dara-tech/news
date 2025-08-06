import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Use the same connection string as the server
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp';
    console.log('Connecting to:', mongoUri);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testServerDatabase = async () => {
  try {
    await connectDB();

    console.log('\n=== SERVER DATABASE TEST ===\n');

    // Test all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // Test Users
    const User = mongoose.model('User', new mongoose.Schema({}));
    const totalUsers = await User.countDocuments();
    console.log(`Total Users: ${totalUsers}`);

    // Test News - check all statuses
    const News = mongoose.model('News', new mongoose.Schema({}));
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    console.log(`Total News: ${totalNews}`);
    console.log(`Published News: ${publishedNews}`);
    console.log(`Draft News: ${draftNews}`);

    // Test Comments
    const Comment = mongoose.model('Comment', new mongoose.Schema({}));
    const totalComments = await Comment.countDocuments();
    console.log(`Total Comments: ${totalComments}`);

    // Test Likes
    const Like = mongoose.model('Like', new mongoose.Schema({}));
    const totalLikes = await Like.countDocuments();
    console.log(`Total Likes: ${totalLikes}`);

    // Test Categories
    const Category = mongoose.model('Category', new mongoose.Schema({}));
    const totalCategories = await Category.countDocuments();
    console.log(`Total Categories: ${totalCategories}`);

    // Show all news articles with their status
    if (totalNews > 0) {
      const allNews = await News.find().select('title slug status views createdAt');
      console.log('\nAll News Articles:');
      allNews.forEach((news, index) => {
        console.log(`${index + 1}. ${news.title?.en || news.title} (${news.slug}) - Status: ${news.status} - Views: ${news.views || 0}`);
      });
    }

    // Show some sample users
    if (totalUsers > 0) {
      const sampleUsers = await User.find().limit(3).select('username email role createdAt');
      console.log('\nSample Users:');
      sampleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
      });
    }

    await mongoose.disconnect();
    console.log('\nTest completed!');

  } catch (error) {
    console.error('Error testing server database:', error);
    await mongoose.disconnect();
  }
};

testServerDatabase(); 