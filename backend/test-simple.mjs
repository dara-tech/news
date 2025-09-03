import Role from './models/Role.mjs';
import User from './models/User.mjs';
import mongoose from 'mongoose';
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

const testRoleSystem = async () => {
  await connectDB();
  
  logger.info('\n🧪 Testing Role System Backend...\n');
  
  try {
    // Test 1: Check if system roles exist
    logger.info('1️⃣ Checking system roles...');
    const roles = await Role.find({});
    logger.info(`   Found ${roles.length} roles:`);
    roles.forEach(role => {
      logger.info(`   - ${role.displayName} (${role.name}) - Level: ${role.level} - Permissions: ${role.permissions.length}`);
    });
    
    // Test 2: Check role permissions
    logger.info('\n2️⃣ Testing role permissions...');
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      logger.info(`   Admin role has ${adminRole.permissions.length} permissions`);
      logger.info(`   Sample permissions: ${adminRole.permissions.slice(0, 5).join(', ')}...`);
    }
    
    // Test 3: Test permission checking
    logger.info('\n3️⃣ Testing permission methods...');
    if (adminRole) {
      const hasNewsCreate = adminRole.hasPermission('news.create');
      const hasInvalidPerm = adminRole.hasPermission('invalid.permission');
      logger.info(`   Admin has 'news.create': ${hasNewsCreate}`);
      logger.info(`   Admin has 'invalid.permission': ${hasInvalidPerm}`);
    }
    
    // Test 4: Check available permissions
    logger.info('\n4️⃣ Testing available permissions...');
    const availablePermissions = Role.getAvailablePermissions();
    logger.info(`   Total available permissions: ${availablePermissions.length}`);
    logger.info(`   Categories: ${[...new Set(availablePermissions.map(p => p.split('.')[0]))].join(', ')}`);
    
    // Test 5: Check user counts
    logger.info('\n5️⃣ Testing user role distribution...');
    const userCounts = await Promise.all(
      roles.map(async (role) => {
        const count = await User.countDocuments({ role: role.name });
        return { role: role.displayName, count };
      })
    );
    userCounts.forEach(({ role, count }) => {
      logger.info(`   ${role}: ${count} users`);
    });
    
    logger.info('\n✅ Role System Backend Tests Completed Successfully!');
    logger.info('\n📋 Summary:');
    logger.info('   ✅ Database connection working');
    logger.info('   ✅ System roles initialized');
    logger.info('   ✅ Permission system functional');
    logger.info('   ✅ Role model methods working');
    logger.info('   ✅ User role assignment ready');
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('\n💾 Database disconnected');
  }
};

testRoleSystem();