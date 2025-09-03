import mongoose from 'mongoose';
import User from './models/User.mjs';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/news-website');

async function updateUserProfileImage() {
  try {
    console.log('Connecting to database...');
    
    // Find the user
    const userId = '687362dbfcd8692cef0917df';
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Current user data:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Current profileImage:', user.profileImage);
    
    // Update the profileImage
    const updateResult = await User.findByIdAndUpdate(
      userId,
      { profileImage: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { new: true }
    );
    
    console.log('\nUpdated user profileImage to:', updateResult.profileImage);
    console.log('Update successful!');
    
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateUserProfileImage();