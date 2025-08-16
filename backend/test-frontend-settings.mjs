#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';

dotenv.config();

async function testFrontendSettings() {
  console.log('🔍 Testing Frontend Settings API');
  console.log('================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    console.log('📋 Telegram Settings from Database:');
    console.log('====================================');
    console.log(`telegramEnabled: ${settings.telegramEnabled}`);
    console.log(`telegramBotToken: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`telegramChannelId: ${settings.telegramChannelId}`);
    console.log(`telegramChannelUsername: ${settings.telegramChannelUsername || 'N/A'}\n`);

    console.log('📋 All Social Media Settings:');
    console.log('=============================');
    Object.keys(settings).forEach(key => {
      if (key.startsWith('telegram')) {
        const value = settings[key];
        if (typeof value === 'string' && value.length > 20) {
          console.log(`${key}: ${value.substring(0, 20)}...`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    });

    console.log('\n🎯 Frontend should receive:');
    console.log('==========================');
    console.log(`telegramEnabled: ${settings.telegramEnabled || false}`);
    console.log(`telegramBotToken: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`telegramChannelId: ${settings.telegramChannelId || ''}`);
    console.log(`telegramChannelUsername: ${settings.telegramChannelUsername || ''}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFrontendSettings();
