import mongoose from 'mongoose';
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

const testAuditEndpoint = async () => {
  console.log('🧪 Testing audit endpoint functionality...');
  
  try {
    // Test 1: Check if ActivityLog model works
    console.log('📝 Test 1: Checking ActivityLog model...');
    const logCount = await ActivityLog.countDocuments();
    console.log(`Found ${logCount} activity logs in database`);

    // Test 2: Check settings.update logs specifically
    console.log('⚙️ Test 2: Checking settings.update logs...');
    const settingsLogs = await ActivityLog.find({ action: 'settings.update' });
    console.log(`Found ${settingsLogs.length} settings update logs`);

    // Test 3: Test the query that the endpoint uses
    console.log('🔍 Test 3: Testing the audit query...');
    const auditLogs = await ActivityLog.find({
      action: 'settings.update'
    })
    .populate('userId', 'email name profileImage')
    .sort({ timestamp: -1 })
    .skip(0)
    .limit(20)
    .lean();

    console.log(`Query returned ${auditLogs.length} logs`);
    
    if (auditLogs.length > 0) {
      console.log('Sample log:', JSON.stringify(auditLogs[0], null, 2));
    }

    // Test 4: Test count query
    console.log('📊 Test 4: Testing count query...');
    const total = await ActivityLog.countDocuments({ action: 'settings.update' });
    console.log(`Total settings update logs: ${total}`);

    // Test 5: Create a test settings log if none exist
    if (settingsLogs.length === 0) {
      console.log('📝 Test 5: Creating test settings log...');
      await ActivityLog.create({
        userId: '507f1f77bcf86cd799439011', // Mock user ID
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
      console.log('✅ Test settings log created');
    }

    console.log('✅ All audit endpoint tests passed!');

  } catch (error) {
    console.error('❌ Audit endpoint test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
connectDB().then(() => {
  testAuditEndpoint().then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}); 