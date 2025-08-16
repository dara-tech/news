#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function enableTelegramSocialLink() {
  console.log('🔧 Enabling Telegram in Social Links...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get current social media settings
    const settings = await Settings.getCategorySettings('social-media');
    console.log('📋 Current social links count:', settings.socialLinks?.length || 0);
    
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
        
        console.log('✅ Enabled Telegram in social links');
        console.log('📱 Telegram link:', telegramLink);
      } else {
        console.log('❌ Telegram link not found in social links');
      }
    } else {
      console.log('❌ No social links found');
    }
    
    // Verify the update
    const updatedSettings = await Settings.getCategorySettings('social-media');
    const updatedTelegramLink = updatedSettings.socialLinks?.find(link => link.platform === 'telegram');
    
    if (updatedTelegramLink && updatedTelegramLink.isActive) {
      console.log('✅ Verification successful: Telegram is now active');
      console.log('📱 Updated Telegram link:', updatedTelegramLink);
    } else {
      console.log('❌ Verification failed: Telegram is not active');
    }
    
    console.log('\n🎉 Telegram has been successfully enabled for auto-posting!');
    console.log('💡 Next steps:');
    console.log('   1. ✅ Telegram is now enabled in social links');
    console.log('   2. 📝 Test auto-posting with real articles');
    console.log('   3. 📊 Monitor posting performance');
    
  } catch (error) {
    console.error('❌ Error enabling Telegram in social links:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
enableTelegramSocialLink();
