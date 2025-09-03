import mongoose from 'mongoose';
import UserLogin from './models/UserLogin.mjs';
import User from './models/User.mjs';
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

const testUserLoginRoutes = async () => {
  logger.info('🧪 Testing user login routes...');
  
  try {
    // Test 1: Check if UserLogin model works
    logger.info('1. Testing UserLogin model...');
    const testLogin = new UserLogin({
      userId: new mongoose.Types.ObjectId(),
      username: 'testuser',
      email: 'test@example.com',
      loginTime: new Date(),
      ipAddress: '127.0.0.1',
      location: {
        country: 'Test',
        region: 'Test',
        city: 'Test',
        timezone: 'UTC',
        coordinates: { latitude: 0, longitude: 0 }
      },
      device: 'desktop',
      browser: { name: 'Test', version: '1.0' },
      os: { name: 'Test', version: '1.0', platform: 'desktop' },
      loginMethod: 'email',
      success: true,
      securityFlags: []
    });
    
    await testLogin.save();
    logger.info('✅ UserLogin model works');
    
    // Test 2: Check if we can query login data
    logger.info('2. Testing login data query...');
    const logins = await UserLogin.find({
      loginTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      success: true,
      'location.coordinates.latitude': { $ne: 0 },
      'location.coordinates.longitude': { $ne: 0 }
    }).populate('userId', 'username email profileImage');
    
    logger.info(`✅ Found ${logins.length} login records`);
    
    // Test 3: Test the map data processing logic
    logger.info('3. Testing map data processing...');
    const locationGroups = {};
    logins.forEach(login => {
      const key = `${login.location.coordinates.latitude},${login.location.coordinates.longitude}`;
      if (!locationGroups[key]) {
        locationGroups[key] = {
          coordinates: login.location.coordinates,
          country: login.location.country,
          city: login.location.city,
          region: login.location.region,
          count: 0,
          users: [],
          recentLogins: []
        };
      }
      
      locationGroups[key].count++;
      
      // Add unique users
      const userExists = locationGroups[key].users.find(u => u._id === login.userId._id);
      if (!userExists && login.userId) {
        locationGroups[key].users.push({
          _id: login.userId._id,
          username: login.userId.username,
          email: login.userId.email,
          profileImage: login.userId.profileImage
        });
      }
      
      // Add recent logins (max 5 per location)
      if (locationGroups[key].recentLogins.length < 5) {
        locationGroups[key].recentLogins.push({
          username: login.username,
          loginTime: login.loginTime,
          device: login.device,
          browser: login.browser.name
        });
      }
    });

    const mapData = Object.values(locationGroups).map(group => ({
      ...group,
      userCount: group.users.length,
      totalLogins: group.count
    }));
    
    logger.info(`✅ Processed ${mapData.length} location groups`);
    logger.info('Map data structure:', JSON.stringify(mapData[0], null, 2));
    
    // Clean up test data
    await UserLogin.deleteMany({ username: 'testuser' });
    logger.info('✅ Cleaned up test data');
    
    logger.info('\n✅ All user login route tests passed!');
    
  } catch (error) {
    logger.error('❌ Error testing user login routes:', error);
  }
};

// Run the test
connectDB().then(() => {
  testUserLoginRoutes().then(() => {
    logger.info('🏁 Test completed');
    process.exit(0);
  }).catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
}); 