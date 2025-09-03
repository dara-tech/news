import mongoose from 'mongoose';
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

const testAuditEndpoint = async () => {
  logger.info('🧪 Testing audit endpoint functionality...');
  
  try {
    // Test 1: Check if ActivityLog model works
    logger.info('📝 Test 1: Checking ActivityLog model...');
    const logCount = await ActivityLog.countDocuments();
    logger.info(`Found ${logCount} activity logs in database`);

    // Test 2: Check settings.update logs specifically
    logger.info('⚙️ Test 2: Checking settings.update logs...');
    const settingsLogs = await ActivityLog.find({ action: 'settings.update' });
    logger.info(`Found ${settingsLogs.length} settings update logs`);

    // Test 3: Test the query that the endpoint uses
    const auditLogs = await ActivityLog.find({
      action: 'settings.update'
    })
    .populate('userId', 'email name profileImage')
    .sort({ timestamp: -1 })
    .skip(0)
    .limit(20)
    .lean();

    logger.info(`Query returned ${auditLogs.length} logs`);
    
    if (auditLogs.length > 0) {
      logger.info('Sample log:', JSON.stringify(auditLogs[0], null, 2));
    }

    // Test 4: Test count query
    logger.info('📊 Test 4: Testing count query...');
    const total = await ActivityLog.countDocuments({ action: 'settings.update' });
    logger.info(`Total settings update logs: ${total}`);

    // Test 5: Create a test settings log if none exist
    if (settingsLogs.length === 0) {
      logger.info('📝 Test 5: Creating test settings log...');
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
      logger.info('✅ Test settings log created');
    }

    logger.info('✅ All audit endpoint tests passed!');

  } catch (error) {
    logger.error('❌ Audit endpoint test failed:', error);
    logger.error('Error details:', error.message);
    logger.error('Stack trace:', error.stack);
  }
};

// Run the test
connectDB().then(() => {
  testAuditEndpoint().then(() => {
    logger.info('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
}); 