import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp';
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testAnalyticsAPI = async () => {
  try {
    await connectDB();

    logger.info('\n=== ANALYTICS API TEST ===\n');

    // Import the analytics controller function
    const { getAnalytics } = await import('./controllers/dashboardController.mjs');

    // Create mock request and response objects
    const mockReq = {
      user: { _id: 'test-user-id', role: 'admin' }
    };

    const mockRes = {
      json: (data) => {
        logger.info('Analytics Response:');
        logger.info(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          logger.info(`Error ${code}:`);
          logger.info(JSON.stringify(data, null, 2));
        }
      })
    };

    // Test analytics endpoint
    logger.info('Testing analytics endpoint...');
    await getAnalytics(mockReq, mockRes);

    await mongoose.disconnect();
    logger.info('\nTest completed!');

  } catch (error) {
    logger.error('Error testing analytics API:', error);
    await mongoose.disconnect();
  }
};

testAnalyticsAPI(); 