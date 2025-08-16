#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function addTelegramToSocialLinks() {
  console.log('🔧 Adding Telegram to Social Links...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current social media settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current social links count:', settings.socialLinks?.length || 0);
    
    if (settings.socialLinks) {
      // Check if Telegram already exists
      const hasTelegram = settings.socialLinks.some(link => link.platform === 'telegram');
      
      if (hasTelegram) {
        console.log('✅ Telegram already exists in social links');
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
      
      console.log('✅ Added Telegram to social links');
      console.log('📊 New social links count:', settings.socialLinks.length);
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
      
      console.log('✅ Created new social links with Telegram');
      console.log('📊 Social links count:', newSocialLinks.length);
    }
    
    // Verify the update
    const updatedSettings = await Settings.getCategorySettings('social-media');
    const telegramLink = updatedSettings.socialLinks?.find(link => link.platform === 'telegram');
    
    if (telegramLink) {
      console.log('✅ Verification successful: Telegram found in social links');
      console.log('📱 Telegram link:', telegramLink);
    } else {
      console.log('❌ Verification failed: Telegram not found in social links');
    }
    
    console.log('\n🎉 Telegram has been successfully added to social links!');
    console.log('💡 Next steps:');
    console.log('   1. Enable Telegram in the admin panel');
    console.log('   2. Configure Telegram bot token and channel ID');
    console.log('   3. Test auto-posting with real articles');
    
  } catch (error) {
    console.error('❌ Error adding Telegram to social links:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addTelegramToSocialLinks();
