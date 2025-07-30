import mongoose from 'mongoose';
import User from './backend/models/User.mjs';
import dotenv from 'dotenv';

dotenv.config();

async function testDirectUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Testing direct user query...');
    const user = await User.findById('687362dbfcd8692cef0917df');
    
    console.log('User found:');
    console.log('- ID:', user._id);
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- ProfileImage:', user.profileImage);
    console.log('- Has profileImage field?', 'profileImage' in user.toObject());
    
    console.log('\nUser.toObject():');
    console.log(JSON.stringify(user.toObject(), null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDirectUser();