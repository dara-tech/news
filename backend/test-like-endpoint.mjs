import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

const testLikeEndpoint = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database');

    // Get a test user
    const user = await User.findOne();
    if (!user) {
      logger.info('No users found');
      return;
    }

    logger.info('Test user:', user.username);

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('Generated token:', token.substring(0, 20) + '...');

    // Test the endpoint
    const API_URL = 'http://localhost:5001';
    const newsId = '6888ce4fa505394887a39417';

    logger.info('Testing endpoint:', `${API_URL}/api/likes/${newsId}/status`);

    const response = await axios.get(`${API_URL}/api/likes/${newsId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info('Response status:', response.status);
    logger.info('Response data:', response.data);

  } catch (error) {
    logger.error('Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
  } finally {
    await mongoose.disconnect();
  }
};

testLikeEndpoint(); 