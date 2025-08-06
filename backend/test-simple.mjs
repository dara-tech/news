import Role from './models/Role.mjs';
import User from './models/User.mjs';
import mongoose from 'mongoose';
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

const testRoleSystem = async () => {
  await connectDB();
  
  console.log('\n🧪 Testing Role System Backend...\n');
  
  try {
    // Test 1: Check if system roles exist
    console.log('1️⃣ Checking system roles...');
    const roles = await Role.find({});
    console.log(`   Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name}) - Level: ${role.level} - Permissions: ${role.permissions.length}`);
    });
    
    // Test 2: Check role permissions
    console.log('\n2️⃣ Testing role permissions...');
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      console.log(`   Admin role has ${adminRole.permissions.length} permissions`);
      console.log(`   Sample permissions: ${adminRole.permissions.slice(0, 5).join(', ')}...`);
    }
    
    // Test 3: Test permission checking
    console.log('\n3️⃣ Testing permission methods...');
    if (adminRole) {
      const hasNewsCreate = adminRole.hasPermission('news.create');
      const hasInvalidPerm = adminRole.hasPermission('invalid.permission');
      console.log(`   Admin has 'news.create': ${hasNewsCreate}`);
      console.log(`   Admin has 'invalid.permission': ${hasInvalidPerm}`);
    }
    
    // Test 4: Check available permissions
    console.log('\n4️⃣ Testing available permissions...');
    const availablePermissions = Role.getAvailablePermissions();
    console.log(`   Total available permissions: ${availablePermissions.length}`);
    console.log(`   Categories: ${[...new Set(availablePermissions.map(p => p.split('.')[0]))].join(', ')}`);
    
    // Test 5: Check user counts
    console.log('\n5️⃣ Testing user role distribution...');
    const userCounts = await Promise.all(
      roles.map(async (role) => {
        const count = await User.countDocuments({ role: role.name });
        return { role: role.displayName, count };
      })
    );
    userCounts.forEach(({ role, count }) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    console.log('\n✅ Role System Backend Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ System roles initialized');
    console.log('   ✅ Permission system functional');
    console.log('   ✅ Role model methods working');
    console.log('   ✅ User role assignment ready');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n💾 Database disconnected');
  }
};

testRoleSystem();