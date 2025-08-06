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

const testDashboardAPI = async () => {
  try {
    await connectDB();

    console.log('\n=== DASHBOARD API TEST ===\n');

    // Import the dashboard controller functions
    const { getStats, getAdvancedStats } = await import('./controllers/dashboardController.mjs');

    // Create mock request and response objects
    const mockReq = {
      user: { _id: 'test-user-id', role: 'admin' }
    };

    const mockRes = {
      json: (data) => {
        console.log('Dashboard Stats Response:');
        console.log(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`Error ${code}:`);
          console.log(JSON.stringify(data, null, 2));
        }
      })
    };

    // Test basic stats
    console.log('Testing basic stats...');
    await getStats(mockReq, mockRes);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test advanced stats
    console.log('Testing advanced stats...');
    await getAdvancedStats(mockReq, mockRes);

    await mongoose.disconnect();
    console.log('\nTest completed!');

  } catch (error) {
    console.error('Error testing dashboard API:', error);
    await mongoose.disconnect();
  }
};

testDashboardAPI(); 