import mongoose from "mongoose";
import User from "./models/User.mjs";
import News from "./models/News.mjs";
import dotenv from "dotenv";
import logger from '../utils/logger.mjs';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  }
};

const checkAndFixUsers = async () => {
  try {
    await connectDB();
    
    logger.info('Checking users for username issues...');
    
    // Find users without usernames or with empty usernames
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" },
        { username: { $regex: /^\s*$/ } } // Only whitespace
      ]
    });
    
    logger.info(`Found ${usersWithoutUsername.length} users without proper usernames:`);
    
    for (const user of usersWithoutUsername) {
      logger.info(`- User ID: ${user._id}`);
      logger.info(`  Email: ${user.email}`);
      logger.info(`  Current username: "${user.username}"`);
      
      // Generate username from email if possible
      if (user.email) {
        const emailUsername = user.email.split('@')[0];
        const newUsername = emailUsername + '_' + Date.now().toString().slice(-4);
        
        logger.info(`  Generated username: ${newUsername}`);
        
        // Update the user
        await User.findByIdAndUpdate(user._id, {
          username: newUsername
        });
        
        logger.info(`  ✅ Updated user ${user._id} with username: ${newUsername}`);
      } else {
        logger.info(`  ❌ Cannot generate username for user ${user._id} - no email`);
      }
    }
    
    // Check all users to make sure they have usernames
    const allUsers = await User.find({});
    logger.info(`\nTotal users in database: ${allUsers.length}`);
    
    const usersWithUsername = allUsers.filter(user => 
      user.username && user.username.trim() !== ''
    );
    logger.info(`Users with proper usernames: ${usersWithUsername.length}`);
    
    if (usersWithUsername.length === allUsers.length) {
      logger.info('✅ All users have proper usernames!');
    } else {
      logger.info('❌ Some users still missing usernames');
    }
    
    // Test the news author population
    logger.info('\nTesting news author population...');
    const testNews = await News.findOne({}).populate('author', 'username email');
    
    if (testNews && testNews.author) {
      logger.info('Sample news article author data:');
      logger.info(`  Author ID: ${testNews.author._id}`);
      logger.info(`  Username: ${testNews.author.username}`);
      logger.info(`  Email: ${testNews.author.email}`);
    } else {
      logger.info('No news articles found for testing');
    }
    
  } catch (error) {
    logger.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed');
  }
};

checkAndFixUsers();
