import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.mjs';
import ActivityLog from './models/ActivityLog.mjs';
import logger from '../utils/logger.mjs';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testAuthAndAudit = async () => {
  logger.info('🧪 Testing authentication and audit endpoint...');
  
  try {
    // Test 1: Check if we have any users
    logger.info('👥 Test 1: Checking for users...');
    const users = await User.find().limit(5);
    logger.info(`Found ${users.length} users in database`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        logger.info(`${index + 1}. ${user.username || user.email} (${user.role})`);
      });
    }

    // Test 2: Create a test admin user if none exist
    let testUser = users.find(u => u.role === 'admin');
    if (!testUser) {
      logger.info('👑 Test 2: Creating test admin user...');
      testUser = await User.create({
        username: 'testadmin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        profileImage: null
      });
      logger.info('✅ Test admin user created');
    } else {
      logger.info('✅ Found existing admin user');
    }

    // Test 3: Generate a JWT token for the test user
    logger.info('🔑 Test 3: Generating JWT token...');
    const token = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    logger.info('✅ JWT token generated');

    // Test 4: Test the audit endpoint with authentication
    logger.info('🌐 Test 4: Testing audit endpoint with auth...');
    const axios = (await import('axios')).default;
    
    try {
      const response = await axios.get('http://localhost:5001/api/admin/settings/audit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info('✅ Audit endpoint response:', response.status);
      logger.info('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      logger.error('❌ Audit endpoint test failed:', error.response?.data || error.message);
    }

    // Test 5: Create some test audit logs
    logger.info('📝 Test 5: Creating test audit logs...');
    await ActivityLog.create({
      userId: testUser._id,
      action: 'settings.update',
      entity: 'settings',
      entityId: 'general',
      description: 'Updated general settings',
      metadata: {
        section: 'general',
        changes: { siteName: 'Test Site' },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip: '127.0.0.1'
      },
      severity: 'medium',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date()
    });
    logger.info('✅ Test audit log created');

    // Test 6: Test the endpoint again to see the logs
    try {
      const response2 = await axios.get('http://localhost:5001/api/admin/settings/audit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info('✅ Second audit endpoint response:', response2.status);
      logger.info('Logs found:', response2.data.logs?.length || 0);
    } catch (error) {
      logger.error('❌ Second audit endpoint test failed:', error.response?.data || error.message);
    }

    logger.info('✅ All authentication and audit tests completed!');

  } catch (error) {
    logger.error('❌ Test failed:', error);
    logger.error('Error details:', error.message);
  }
};

// Run the test
connectDB().then(() => {
  testAuthAndAudit().then(() => {
    logger.info('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
}); 