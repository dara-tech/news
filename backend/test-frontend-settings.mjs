#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import logger from '../utils/logger.mjs';

dotenv.config();

async function testFrontendSettings() {
  logger.info('================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    logger.info('📋 Telegram Settings from Database:');
    logger.info('====================================');
    logger.info(`telegramEnabled: ${settings.telegramEnabled}`);
    logger.info(`telegramBotToken: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    logger.info(`telegramChannelId: ${settings.telegramChannelId}`);
    logger.info(`telegramChannelUsername: ${settings.telegramChannelUsername || 'N/A'}\n`);

    logger.info('📋 All Social Media Settings:');
    logger.info('=============================');
    Object.keys(settings).forEach(key => {
      if (key.startsWith('telegram')) {
        const value = settings[key];
        if (typeof value === 'string' && value.length > 20) {
          logger.info(`${key}: ${value.substring(0, 20)}...`);
        } else {
          logger.info(`${key}: ${value}`);
        }
      }
    });

    logger.info('\n🎯 Frontend should receive:');
    logger.info('==========================');
    logger.info(`telegramEnabled: ${settings.telegramEnabled || false}`);
    logger.info(`telegramBotToken: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    logger.info(`telegramChannelId: ${settings.telegramChannelId || ''}`);
    logger.info(`telegramChannelUsername: ${settings.telegramChannelUsername || ''}`);

  } catch (error) {
    logger.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFrontendSettings();
