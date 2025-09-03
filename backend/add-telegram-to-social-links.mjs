#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function addTelegramToSocialLinks() {
  logger.info('🔧 Adding Telegram to Social Links...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');
    
    // Get current social media settings
    const settings = await Settings.getCategorySettings('social-media');
    logger.info('📋 Current social links count:', settings.socialLinks?.length || 0);
    
    if (settings.socialLinks) {
      // Check if Telegram already exists
      const hasTelegram = settings.socialLinks.some(link => link.platform === 'telegram');
      
      if (hasTelegram) {
        logger.info('✅ Telegram already exists in social links');
        return;
      }
      
      // Add Telegram to social links
      settings.socialLinks.push({
        platform: 'telegram',
        url: '#',
        isActive: false,
        displayName: 'Telegram'
      });
      
             // Update the settings
       await Settings.updateCategorySettings('social-media', {
         socialLinks: settings.socialLinks
       }, new mongoose.Types.ObjectId());
      
      logger.info('✅ Added Telegram to social links');
      logger.info('📊 New social links count:', settings.socialLinks.length);
    } else {
      // Create new social links array with Telegram
      const newSocialLinks = [
        {
          platform: 'facebook',
          url: '#',
          isActive: false,
          displayName: 'Facebook'
        },
        {
          platform: 'twitter',
          url: '#',
          isActive: false,
          displayName: 'Twitter'
        },
        {
          platform: 'linkedin',
          url: '#',
          isActive: false,
          displayName: 'LinkedIn'
        },
        {
          platform: 'instagram',
          url: '#',
          isActive: false,
          displayName: 'Instagram'
        },
        {
          platform: 'telegram',
          url: '#',
          isActive: false,
          displayName: 'Telegram'
        },
        {
          platform: 'youtube',
          url: '#',
          isActive: false,
          displayName: 'YouTube'
        },
        {
          platform: 'github',
          url: '#',
          isActive: false,
          displayName: 'GitHub'
        }
      ];
      
             await Settings.updateCategorySettings('social-media', {
         socialLinks: newSocialLinks
       }, new mongoose.Types.ObjectId());
      
      logger.info('✅ Created new social links with Telegram');
      logger.info('📊 Social links count:', newSocialLinks.length);
    }
    
    // Verify the update
    const updatedSettings = await Settings.getCategorySettings('social-media');
    const telegramLink = updatedSettings.socialLinks?.find(link => link.platform === 'telegram');
    
    if (telegramLink) {
      logger.info('✅ Verification successful: Telegram found in social links');
      logger.info('📱 Telegram link:', telegramLink);
    } else {
      logger.info('❌ Verification failed: Telegram not found in social links');
    }
    
    logger.info('\n🎉 Telegram has been successfully added to social links!');
    logger.info('💡 Next steps:');
    logger.info('   1. Enable Telegram in the admin panel');
    logger.info('   2. Configure Telegram bot token and channel ID');
    logger.info('   3. Test auto-posting with real articles');
    
  } catch (error) {
    logger.error('❌ Error adding Telegram to social links:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addTelegramToSocialLinks();
