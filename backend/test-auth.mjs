import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Like from './models/Like.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';

dotenv.config();

const testAuthAndLikes = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const newsId = '6888ce4fa505394887a39417';
    
    // Get a test user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database');
      return;
    }
    
    console.log('Test user:', user.username, user._id);
    
    // Create a JWT token for the user
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Generated token:', token.substring(0, 20) + '...');
    
    // Test the like status endpoint manually
    const likeCount = await Like.countDocuments({ news: newsId });
    const userLike = await Like.findOne({ user: user._id, news: newsId });
    const hasLiked = !!userLike;
    
    console.log('Like count:', likeCount);
    console.log('User has liked:', hasLiked);
    console.log('User like document:', userLike);
    
    // Test the news article
    const news = await News.findById(newsId);
    console.log('News exists:', !!news);
    if (news) {
      console.log('News title:', news.title.en);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testAuthAndLikes();
