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

const testDashboardAPI = async () => {
  try {
    await connectDB();

    logger.info('\n=== DASHBOARD API TEST ===\n');

    // Import the dashboard controller functions
    const { getStats, getAdvancedStats } = await import('./controllers/dashboardController.mjs');

    // Create mock request and response objects
    const mockReq = {
      user: { _id: 'test-user-id', role: 'admin' }
    };

    const mockRes = {
      json: (data) => {
        logger.info('Dashboard Stats Response:');
        logger.info(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          logger.info(`Error ${code}:`);
          logger.info(JSON.stringify(data, null, 2));
        }
      })
    };

    // Test basic stats
    logger.info('Testing basic stats...');
    await getStats(mockReq, mockRes);

    logger.info('\n' + '='.repeat(50) + '\n');

    // Test advanced stats
    logger.info('Testing advanced stats...');
    await getAdvancedStats(mockReq, mockRes);

    await mongoose.disconnect();
    logger.info('\nTest completed!');

  } catch (error) {
    logger.error('Error testing dashboard API:', error);
    await mongoose.disconnect();
  }
};

testDashboardAPI(); 