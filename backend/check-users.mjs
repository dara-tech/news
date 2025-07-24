import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.mjs';

dotenv.config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });


    // Find all users
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      return;
    }

    users.forEach(user => {
    });

    // Check for admin user
    const adminUser = users.find(user => user.role === 'admin');
    if (!adminUser) {
    } else {
    }

  } catch (error) {
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

// Run the function
checkUsers();
