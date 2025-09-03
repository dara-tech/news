#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import readline from 'readline';
import logger from '../utils/logger.mjs';

dotenv.config();

async function findTelegramChannelId() {
  logger.info('==============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      logger.info('❌ Telegram bot token not configured');
      logger.info('💡 Please configure bot token first\n');
      return;
    }

    logger.info('📋 Current Bot Information:');
    logger.info(`Bot Token: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Bot Username: @razewire_bot\n`);

    logger.info('📋 Method 1: Using @userinfobot (Recommended)');
    logger.info('=============================================');
    logger.info('1. Create your Telegram channel');
    logger.info('2. Add @razewire_bot as administrator');
    logger.info('3. Send a message to your channel');
    logger.info('4. Forward that message to @userinfobot');
    logger.info('5. Copy the "Chat ID" from the response\n');

    logger.info('📋 Method 2: Using Bot API (Alternative)');
    logger.info('========================================');
    logger.info('If you know your channel username, we can try to get the ID directly.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('🔗 Do you have a channel username? (e.g., @razewire_news) or press Enter to skip: ', async (channelUsername) => {
      if (channelUsername && channelUsername.trim() !== '') {
        try {
          const response = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
            params: {
              chat_id: channelUsername.trim()
            }
          });

          if (response.data.ok) {
            const chat = response.data.result;
            logger.info('✅ Channel found!');
            logger.info(`Chat ID: ${chat.id}`);
            logger.info(`Chat Type: ${chat.type}`);
            logger.info(`Chat Title: ${chat.title}`);
            logger.info(`Chat Username: ${chat.username ? '@' + chat.username : 'N/A'}`);
            logger.info(`Member Count: ${chat.member_count || 'N/A'}\n`);

            logger.info('💾 Would you like to update the database with this channel ID?');
            rl.question('Update database? (y/n): ', async (answer) => {
              if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                try {
                  await Settings.updateCategorySettings('social-media', {
                    telegramChannelId: chat.id.toString(),
                    telegramChannelUsername: chat.username ? '@' + chat.username : ''
                  });
                  logger.info('✅ Channel ID updated in database!');
                  logger.info('✅ Telegram configuration complete!\n');
                  
                  logger.info('🧪 Testing Telegram integration...');
                  const testResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);
                  if (testResponse.data.ok) {
                    logger.info('✅ Bot is working correctly');
                    logger.info('✅ Channel is accessible');
                    logger.info('✅ Ready for auto-posting!\n');
                  }
                } catch (updateError) {
                  logger.info('❌ Error updating database:', updateError.message);
                }
              } else {
                logger.info('📝 Channel ID not updated. You can configure it manually in the admin panel.\n');
              }
              rl.close();
            });
          } else {
            logger.info('❌ Channel not found or bot cannot access it');
            logger.info('💡 Make sure:');
            logger.info('   • Channel exists and is public');
            logger.info('   • Bot is added as administrator');
            logger.info('   • Username is correct (including @ symbol)\n');
            rl.close();
          }
        } catch (error) {
          logger.info('❌ Error accessing channel:');
          logger.info(`Error: ${error.response?.data?.description || error.message}\n`);
          
          if (error.response?.status === 403) {
            logger.info('🔧 Solution: Add @razewire_bot as administrator to your channel\n');
          } else if (error.response?.status === 400) {
            logger.info('🔧 Solution: Check channel username format (should include @ symbol)\n');
          }
          rl.close();
        }
      } else {
        logger.info('\n📋 Manual Channel ID Setup:');
        logger.info('==========================');
        logger.info('1. Create your Telegram channel');
        logger.info('2. Add @razewire_bot as administrator');
        logger.info('3. Send a message to your channel');
        logger.info('4. Forward that message to @userinfobot');
        logger.info('5. Copy the "Chat ID" (starts with -100)');
        logger.info('6. Configure in admin panel or use update script\n');
        
        logger.info('💡 Channel ID Format:');
        logger.info('   • Public channels: -100xxxxxxxxxx');
        logger.info('   • Private channels: -100xxxxxxxxxx');
        logger.info('   • Groups: -xxxxxxxxxx\n');
        
        rl.close();
      }
    });

  } catch (error) {
    logger.error('❌ Error:', error.message);
  }
}

findTelegramChannelId();
