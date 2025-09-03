import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Like from './models/Like.mjs';
import News from './models/News.mjs';
import User from './models/User.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

const testAuthAndLikes = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database');

    const newsId = '6888ce4fa505394887a39417';
    
    // Get a test user
    const user = await User.findOne();
    if (!user) {
      logger.info('No users found in database');
      return;
    }
    
    logger.info('Test user:', user.username, user._id);
    
    // Create a JWT token for the user
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    logger.info('Generated token:', token.substring(0, 20) + '...');
    
    // Test the like status endpoint manually
    const likeCount = await Like.countDocuments({ news: newsId });
    const userLike = await Like.findOne({ user: user._id, news: newsId });
    const hasLiked = !!userLike;
    
    logger.info('Like count:', likeCount);
    logger.info('User has liked:', hasLiked);
    logger.info('User like document:', userLike);
    
    // Test the news article
    const news = await News.findById(newsId);
    logger.info('News exists:', !!news);
    if (news) {
      logger.info('News title:', news.title.en);
    }

  } catch (error) {
    logger.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testAuthAndLikes();
