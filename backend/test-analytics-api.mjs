import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newsapp';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testAnalyticsAPI = async () => {
  try {
    await connectDB();

    console.log('\n=== ANALYTICS API TEST ===\n');

    // Import the analytics controller function
    const { getAnalytics } = await import('./controllers/dashboardController.mjs');

    // Create mock request and response objects
    const mockReq = {
      user: { _id: 'test-user-id', role: 'admin' }
    };

    const mockRes = {
      json: (data) => {
        console.log('Analytics Response:');
        console.log(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`Error ${code}:`);
          console.log(JSON.stringify(data, null, 2));
        }
      })
    };

    // Test analytics endpoint
    console.log('Testing analytics endpoint...');
    await getAnalytics(mockReq, mockRes);

    await mongoose.disconnect();
    console.log('\nTest completed!');

  } catch (error) {
    console.error('Error testing analytics API:', error);
    await mongoose.disconnect();
  }
};

testAnalyticsAPI(); 