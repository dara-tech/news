import mongoose from 'mongoose';
import User from './models/User.mjs';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/news-website');

async function listUsers() {
  try {
    console.log('Connecting to database...');
    
    const users = await User.find({}).select('_id username email profileImage');
    
    console.log('Found users:');
    users.forEach(user => {
      console.log({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      });
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();