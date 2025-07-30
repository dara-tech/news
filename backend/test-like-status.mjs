import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Like from './models/Like.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';

dotenv.config();

const testLikeStatus = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const newsId = '6888ce4fa505394887a39417';
    
    // Check if news exists
    const news = await News.findById(newsId);
    console.log('News found:', !!news);
    if (news) {
      console.log('News title:', news.title);
    }

    // Check if there are any likes for this news
    const likeCount = await Like.countDocuments({ news: newsId });
    console.log('Like count:', likeCount);

    // Get a sample user for testing
    const user = await User.findOne();
    if (user) {
      console.log('Test user found:', user.username);
      
      // Check if user has liked this news
      const userLike = await Like.findOne({ user: user._id, news: newsId });
      console.log('User has liked:', !!userLike);
    }

    // Test the aggregation
    const likes = await Like.find({ news: newsId });
    console.log('All likes for this news:', likes.length);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testLikeStatus(); 