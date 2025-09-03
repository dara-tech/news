#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import logger from '../utils/logger.mjs';

dotenv.config();

async function updateTelegramToken() {
  logger.info('📱 Updating Telegram Bot Token');
  logger.info('==============================\n');

  const botToken = '8207949077:AAGsEbw0md9vikM0zY7nOgDw52YR7Akg_Yw';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    // Test the bot token
    const botResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    
    if (botResponse.data.ok) {
      const bot = botResponse.data.result;
      logger.info('✅ Bot token is valid!');
      logger.info(`Bot ID: ${bot.id}`);
      logger.info(`Bot Name: ${bot.first_name}`);
      logger.info(`Bot Username: @${bot.username}`);
      logger.info(`Can Join Groups: ${bot.can_join_groups ? '✅ Yes' : '❌ No'}`);
      logger.info(`Can Read All Group Messages: ${bot.can_read_all_group_messages ? '✅ Yes' : '❌ No'}`);
      logger.info(`Supports Inline Queries: ${bot.supports_inline_queries ? '✅ Yes' : '❌ No'}\n`);

      // Update the database
      logger.info('💾 Updating database...');
      await Settings.updateCategorySettings('social-media', {
        telegramBotToken: botToken,
        telegramEnabled: true
      });

      logger.info('✅ Telegram bot token updated successfully!');
      logger.info('✅ Telegram auto-posting enabled\n');

      logger.info('📋 Next Steps:');
      logger.info('1. ✅ Bot token is configured');
      logger.info('2. 🔗 Create a Telegram channel');
      logger.info('3. 📝 Add bot as administrator to channel');
      logger.info('5. ⚙️  Configure channel ID in admin panel');
      logger.info('6. 🧪 Test the integration\n');

      logger.info('📖 See telegram-setup-guide.md for detailed channel setup instructions\n');

    } else {
      logger.info('❌ Bot token validation failed:');
      logger.info(`Error: ${botResponse.data.description}\n`);
    }

  } catch (error) {
    logger.info('❌ Error updating Telegram token:');
    logger.info(`Error: ${error.response?.data?.description || error.message}\n`);
    
    if (error.response?.status === 401) {
      logger.info('🔧 Token Issue:');
      logger.info('• Bot token may be invalid');
      logger.info('• Check token from @BotFather');
      logger.info('• Ensure token is copied correctly\n');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateTelegramToken();
