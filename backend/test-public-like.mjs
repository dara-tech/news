import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const testPublicEndpoint = async () => {
  const newsId = '6888ce4fa505394887a39417';
  
  try {
    const response = await fetch(`http://localhost:5000/api/likes/${newsId}/count`);
    const data = await response.json();
    
    logger.info('Response status:', response.status);
    logger.info('Response data:', data);
    
    if (response.ok) {
      logger.info('✅ Public count endpoint working correctly!');
      logger.info(`Like count: ${data.count}`);
    } else {
      logger.info('❌ Public count endpoint failed');
    }
  } catch (error) {
    logger.error('Error testing public endpoint:', error);
  }
  
  process.exit(0);
};

testPublicEndpoint(); 