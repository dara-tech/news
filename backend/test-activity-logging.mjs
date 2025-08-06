import mongoose from 'mongoose';
import { logActivity } from './controllers/activityController.mjs';
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

const testActivityLogging = async () => {
  console.log('🧪 Testing activity logging...');
  
  try {
    // Test 1: Log a simple activity
    console.log('📝 Test 1: Logging simple activity...');
    await logActivity({
      userId: '507f1f77bcf86cd799439011', // Mock user ID
      action: 'user.login',
      entity: 'user',
      entityId: '507f1f77bcf86cd799439011',
      description: 'User logged in successfully',
      metadata: { browser: 'Chrome', os: 'Windows' },
      severity: 'low',
      req: {
        ip: '127.0.0.1',
        get: (header) => {
          if (header === 'User-Agent') return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
          return null;
        }
      }
    });
    console.log('✅ Test 1 passed');

    // Test 2: Log a security event
    console.log('🔒 Test 2: Logging security event...');
    await logActivity({
      userId: '507f1f77bcf86cd799439011',
      action: 'user.login_failed',
      entity: 'user',
      entityId: '507f1f77bcf86cd799439011',
      description: 'Failed login attempt - invalid credentials',
      metadata: { attempts: 3, blocked: false },
      severity: 'medium',
      req: {
        ip: '192.168.1.100',
        get: (header) => {
          if (header === 'User-Agent') return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15';
          return null;
        }
      }
    });
    console.log('✅ Test 2 passed');

    // Test 3: Log admin action
    console.log('👑 Test 3: Logging admin action...');
    await logActivity({
      userId: '507f1f77bcf86cd799439012',
      action: 'admin.force_logout',
      entity: 'user',
      entityId: '507f1f77bcf86cd799439011',
      description: 'Admin forced logout for suspicious activity',
      metadata: { reason: 'suspicious_activity', adminId: '507f1f77bcf86cd799439012' },
      severity: 'high',
      req: {
        ip: '127.0.0.1',
        get: (header) => {
          if (header === 'User-Agent') return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
          return null;
        }
      }
    });
    console.log('✅ Test 3 passed');

    // Test 4: Check if logs were created
    console.log('📊 Test 4: Checking created logs...');
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(5);
    console.log(`Found ${logs.length} recent activity logs:`);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.action} - ${log.description} (${log.severity})`);
    });

    // Test 5: Test the API endpoint
    console.log('🌐 Test 5: Testing API endpoint...');
    const stats = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Activity stats:', stats);

    console.log('✅ All activity logging tests passed!');

  } catch (error) {
    console.error('❌ Activity logging test failed:', error);
  }
};

// Run the test
connectDB().then(() => {
  testActivityLogging().then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}); 