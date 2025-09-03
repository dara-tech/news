#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function enableTelegramSocialLink() {
  logger.info('🔧 Enabling Telegram in Social Links...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Get current social media settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current social links count:', settings.socialLinks?.length || 0);
    
    if (settings.socialLinks) {
      // Find Telegram link
      const telegramLink = settings.socialLinks.find(link => link.platform === 'telegram');
      
      if (telegramLink) {
        // Enable Telegram
        telegramLink.isActive = true;
        telegramLink.url = 'https://t.me/razewire';
        
        // Update the settings
        await Settings.updateCategorySettings('social-media', {
          socialLinks: settings.socialLinks
        }, new mongoose.Types.ObjectId());
        
        logger.info('✅ Enabled Telegram in social links');
        logger.info('📱 Telegram link:', telegramLink);
      } else {
        logger.info('❌ Telegram link not found in social links');
      }
    } else {
      logger.info('❌ No social links found');
    }
    
    // Verify the update
    const updatedSettings = await Settings.getCategorySettings('social-media');
    const updatedTelegramLink = updatedSettings.socialLinks?.find(link => link.platform === 'telegram');
    
    if (updatedTelegramLink && updatedTelegramLink.isActive) {
      logger.info('✅ Verification successful: Telegram is now active');
      logger.info('📱 Updated Telegram link:', updatedTelegramLink);
    } else {
      logger.info('❌ Verification failed: Telegram is not active');
    }
    
    logger.info('\n🎉 Telegram has been successfully enabled for auto-posting!');
    logger.info('💡 Next steps:');
    logger.info('   1. ✅ Telegram is now enabled in social links');
    logger.info('   2. 📝 Test auto-posting with real articles');
    logger.info('   3. 📊 Monitor posting performance');
    
  } catch (error) {
    logger.error('❌ Error enabling Telegram in social links:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  }
}

// Run the script
enableTelegramSocialLink();
