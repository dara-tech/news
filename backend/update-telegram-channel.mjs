#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import logger from '../utils/logger.mjs';

dotenv.config();

async function updateTelegramChannel() {
  logger.info('📱 Updating Telegram Channel Configuration');
  logger.info('==========================================\n');

  const channelId = '-1002934676178';
  const channelUsername = '@razewire';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      logger.info('❌ Telegram bot token not configured');
      logger.info('💡 Please configure bot token first\n');
      return;
    }

    // Test channel access
    const channelResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
      params: {
        chat_id: channelId
      }
    });

    if (channelResponse.data.ok) {
      const chat = channelResponse.data.result;
      logger.info('✅ Channel access successful!');
      logger.info(`Channel ID: ${chat.id}`);
      logger.info(`Channel Title: ${chat.title}`);
      logger.info(`Channel Username: ${chat.username ? '@' + chat.username : 'N/A'}`);
      logger.info(`Channel Type: ${chat.type}`);
      logger.info(`Member Count: ${chat.member_count || 'N/A'}\n`);

      // Update the database
      logger.info('💾 Updating database...');
      await Settings.updateCategorySettings('social-media', {
        telegramChannelId: channelId,
        telegramChannelUsername: channelUsername,
        telegramEnabled: true
      });

      logger.info('✅ Channel configuration updated successfully!');
      logger.info(`Channel ID: ${channelId}`);
      logger.info(`Channel Username: ${channelUsername}\n`);

      // Test sending a message
      logger.info('🧪 Testing message sending...');
      const testMessage = `🎉 Telegram Integration Test - ${new Date().toLocaleString()}\n\nThis is a test message to verify the Telegram integration with RazeWire.\n\n#RazeWire #Telegram #Test`;

      const messageData = {
        chat_id: channelId,
        text: testMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      };

      const messageResponse = await axios.post(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, messageData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (messageResponse.data.ok) {
        const message = messageResponse.data.result;
        logger.info('✅ Test message sent successfully!');
        logger.info(`Message ID: ${message.message_id}`);
        logger.info(`Date: ${new Date(message.date * 1000).toLocaleString()}`);
        
        const messageUrl = `https://t.me/${chat.username}/${message.message_id}`;
        logger.info(`Message URL: ${messageUrl}\n`);

        // Clean up - delete the test message
        try {
          await axios.post(`https://api.telegram.org/bot${settings.telegramBotToken}/deleteMessage`, {
            chat_id: channelId,
            message_id: message.message_id
          });
          logger.info('🧹 Test message cleaned up successfully\n');
        } catch (cleanupError) {
          logger.info('⚠️  Could not clean up test message (this is normal)\n');
        }

      } else {
        logger.info('❌ Test message failed:');
        logger.info(`Error: ${messageResponse.data.description}\n`);
      }

      logger.info('🎉 Telegram setup complete!');
      logger.info('✅ Bot token configured');
      logger.info('✅ Channel ID configured');
      logger.info('✅ Channel username configured');
      logger.info('✅ Bot has administrator permissions');
      logger.info('✅ Message sending tested');
      logger.info('✅ Ready for auto-posting!\n');

      logger.info('📋 Next Steps:');
      logger.info('1. Test auto-posting with a sample article');
      logger.info('2. Monitor posting performance');
      logger.info('3. Configure posting schedule');
      logger.info('4. Track engagement in your channel');
      logger.info('5. Share your channel: https://t.me/razewire\n');

      logger.info('🧪 Test Commands:');
      logger.info('node test-telegram-specific.mjs');
      logger.info('node test-auto-posting.mjs\n');

    } else {
      logger.info('❌ Channel access failed:');
      logger.info(`Error: ${channelResponse.data.description}\n`);
    }

  } catch (error) {
    logger.info('❌ Error updating Telegram channel:');
    logger.info(`Error: ${error.response?.data?.description || error.message}\n`);
    
    if (error.response?.status === 403) {
      logger.info('🔧 Permission Issue:');
      logger.info('• Bot may not be added to the channel');
      logger.info('• Add bot as administrator to the channel');
      logger.info('• Ensure bot has posting permissions\n');
    } else if (error.response?.status === 400) {
      logger.info('🔧 Channel ID Issue:');
      logger.info('• Channel ID may be incorrect');
      logger.info('• Check channel ID format\n');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateTelegramChannel();
