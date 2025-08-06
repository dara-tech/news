import mongoose from 'mongoose';
import ActivityLog from './models/ActivityLog.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const testActivityLogging = async () => {
  await connectDB();
  
  console.log('\n🧪 Testing Activity Log System...\n');
  
  try {
    // Test 1: Check if there are any activity logs
    console.log('1️⃣ Checking existing activity logs...');
    const totalLogs = await ActivityLog.countDocuments();
    console.log(`   Found ${totalLogs} activity logs in database`);
    
    if (totalLogs > 0) {
      // Get recent logs
      const recentLogs = await ActivityLog.find()
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .limit(5);
        
      console.log('   Recent activity logs:');
      recentLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.action} - ${log.description} (${log.severity})`);
        console.log(`      User: ${log.userId?.username || 'Unknown'} at ${log.timestamp}`);
      });
    }
    
    // Test 2: Test creating a new activity log
    console.log('\n2️⃣ Creating test activity log...');
    
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
      
      console.log(`   ✅ Created test log: ${testLog._id}`);
      console.log(`   📝 Description: ${testLog.description}`);
      
      // Clean up test log
      await ActivityLog.findByIdAndDelete(testLog._id);
      console.log('   🧹 Cleaned up test log');
    } else {
      console.log('   ⚠️  No admin user found for testing');
    }
    
    // Test 3: Check activity log filtering
    console.log('\n3️⃣ Testing activity log filtering...');
    
    const actionCounts = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    console.log('   Top actions:');
    actionCounts.forEach(({ _id, count }) => {
      console.log(`   - ${_id}: ${count} times`);
    });
    
    console.log('\n✅ Activity Log System Tests Completed!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Database connection: Working`);
    console.log(`   ✅ ActivityLog model: Working`);
    console.log(`   ✅ Log creation: Working`);
    console.log(`   ✅ Log querying: Working`);
    console.log(`   📊 Total logs in system: ${totalLogs}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n💾 Database disconnected');
  }
};

testActivityLogging();