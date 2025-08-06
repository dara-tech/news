import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.mjs';
import ActivityLog from './models/ActivityLog.mjs';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/news-app');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const testAuthAndAudit = async () => {
  console.log('🧪 Testing authentication and audit endpoint...');
  
  try {
    // Test 1: Check if we have any users
    console.log('👥 Test 1: Checking for users...');
    const users = await User.find().limit(5);
    console.log(`Found ${users.length} users in database`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username || user.email} (${user.role})`);
      });
    }

    // Test 2: Create a test admin user if none exist
    let testUser = users.find(u => u.role === 'admin');
    if (!testUser) {
      console.log('👑 Test 2: Creating test admin user...');
      testUser = await User.create({
        username: 'testadmin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        profileImage: null
      });
      console.log('✅ Test admin user created');
    } else {
      console.log('✅ Found existing admin user');
    }

    // Test 3: Generate a JWT token for the test user
    console.log('🔑 Test 3: Generating JWT token...');
    const token = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    console.log('✅ JWT token generated');

    // Test 4: Test the audit endpoint with authentication
    console.log('🌐 Test 4: Testing audit endpoint with auth...');
    const axios = (await import('axios')).default;
    
    try {
      const response = await axios.get('http://localhost:5001/api/admin/settings/audit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Audit endpoint response:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Audit endpoint test failed:', error.response?.data || error.message);
    }

    // Test 5: Create some test audit logs
    console.log('📝 Test 5: Creating test audit logs...');
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
    console.log('✅ Test audit log created');

    // Test 6: Test the endpoint again to see the logs
    console.log('🔍 Test 6: Testing audit endpoint again...');
    try {
      const response2 = await axios.get('http://localhost:5001/api/admin/settings/audit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Second audit endpoint response:', response2.status);
      console.log('Logs found:', response2.data.logs?.length || 0);
    } catch (error) {
      console.error('❌ Second audit endpoint test failed:', error.response?.data || error.message);
    }

    console.log('✅ All authentication and audit tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  }
};

// Run the test
connectDB().then(() => {
  testAuthAndAudit().then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}); 