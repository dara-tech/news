import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.mjs';

dotenv.config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('No users found in the database');
      return;
    }

    console.log('\n📋 Found users:');
    users.forEach(user => {
      console.log('\n👤 User:');
      console.log(`ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
    });

    // Check for admin user
    const adminUser = users.find(user => user.role === 'admin');
    if (!adminUser) {
      console.log('\n⚠️ No admin user found in the database');
    } else {
      console.log('\n✅ Admin user found:');
      console.log(`Email: ${adminUser.email}`);
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkUsers();
