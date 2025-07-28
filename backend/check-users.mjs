import mongoose from "mongoose";
import User from "./models/User.mjs";
import News from "./models/News.mjs";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const checkAndFixUsers = async () => {
  try {
    await connectDB();
    
    console.log('Checking users for username issues...');
    
    // Find users without usernames or with empty usernames
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" },
        { username: { $regex: /^\s*$/ } } // Only whitespace
      ]
    });
    
    console.log(`Found ${usersWithoutUsername.length} users without proper usernames:`);
    
    for (const user of usersWithoutUsername) {
      console.log(`- User ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Current username: "${user.username}"`);
      
      // Generate username from email if possible
      if (user.email) {
        const emailUsername = user.email.split('@')[0];
        const newUsername = emailUsername + '_' + Date.now().toString().slice(-4);
        
        console.log(`  Generated username: ${newUsername}`);
        
        // Update the user
        await User.findByIdAndUpdate(user._id, {
          username: newUsername
        });
        
        console.log(`  ✅ Updated user ${user._id} with username: ${newUsername}`);
      } else {
        console.log(`  ❌ Cannot generate username for user ${user._id} - no email`);
      }
    }
    
    // Check all users to make sure they have usernames
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    const usersWithUsername = allUsers.filter(user => 
      user.username && user.username.trim() !== ''
    );
    console.log(`Users with proper usernames: ${usersWithUsername.length}`);
    
    if (usersWithUsername.length === allUsers.length) {
      console.log('✅ All users have proper usernames!');
    } else {
      console.log('❌ Some users still missing usernames');
    }
    
    // Test the news author population
    console.log('\nTesting news author population...');
    const testNews = await News.findOne({}).populate('author', 'username email');
    
    if (testNews && testNews.author) {
      console.log('Sample news article author data:');
      console.log(`  Author ID: ${testNews.author._id}`);
      console.log(`  Username: ${testNews.author.username}`);
      console.log(`  Email: ${testNews.author.email}`);
    } else {
      console.log('No news articles found for testing');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

checkAndFixUsers();
