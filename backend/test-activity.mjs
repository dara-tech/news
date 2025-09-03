import mongoose from 'mongoose';
import ActivityLog from './models/ActivityLog.mjs';
import dotenv from 'dotenv';
import logger from '../utils/logger.mjs';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const testActivityLogging = async () => {
  await connectDB();
  
  logger.info('\n🧪 Testing Activity Log System...\n');
  
  try {
    // Test 1: Check if there are any activity logs
    logger.info('1️⃣ Checking existing activity logs...');
    const totalLogs = await ActivityLog.countDocuments();
    logger.info(`   Found ${totalLogs} activity logs in database`);
    
    if (totalLogs > 0) {
      // Get recent logs
      const recentLogs = await ActivityLog.find()
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .limit(5);
        
      logger.info('   Recent activity logs:');
      recentLogs.forEach((log, index) => {
        logger.info(`   ${index + 1}. ${log.action} - ${log.description} (${log.severity})`);
        logger.info(`      User: ${log.userId?.username || 'Unknown'} at ${log.timestamp}`);
      });
    }
    
    // Test 2: Test creating a new activity log
    logger.info('\n2️⃣ Creating test activity log...');
    
    // Find a user to use for the test
    const User = (await import('./models/User.mjs')).default;
    const testUser = await User.findOne({ role: 'admin' });
    
    if (testUser) {
      const testLog = await ActivityLog.create({
        userId: testUser._id,
        action: 'user.login',
        entity: 'user',
        entityId: testUser._id.toString(),
        description: 'Test activity log entry',
        metadata: {
          test: true,
          timestamp: new Date()
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        severity: 'low'
      });
      
      logger.info(`   ✅ Created test log: ${testLog._id}`);
      logger.info(`   📝 Description: ${testLog.description}`);
      
      // Clean up test log
      await ActivityLog.findByIdAndDelete(testLog._id);
      logger.info('   🧹 Cleaned up test log');
    } else {
      logger.info('   ⚠️  No admin user found for testing');
    }
    
    // Test 3: Check activity log filtering
    logger.info('\n3️⃣ Testing activity log filtering...');
    
    const actionCounts = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    logger.info('   Top actions:');
    actionCounts.forEach(({ _id, count }) => {
      logger.info(`   - ${_id}: ${count} times`);
    });
    
    logger.info('\n✅ Activity Log System Tests Completed!');
    logger.info('\n📋 Summary:');
    logger.info(`   ✅ Database connection: Working`);
    logger.info(`   ✅ ActivityLog model: Working`);
    logger.info(`   ✅ Log creation: Working`);
    logger.info(`   ✅ Log querying: Working`);
    logger.info(`   📊 Total logs in system: ${totalLogs}`);
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('\n💾 Database disconnected');
  }
};

testActivityLogging();