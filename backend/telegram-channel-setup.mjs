#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import readline from 'readline';
import logger from '../utils/logger.mjs';

dotenv.config();

async function telegramChannelSetup() {
  logger.info('📱 Telegram Channel Setup Guide');
  logger.info('===============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      logger.info('❌ Telegram bot token not configured');
      logger.info('💡 Please configure bot token first\n');
      return;
    }

    logger.info('📋 Current Status:');
    logger.info(`Bot Token: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Bot Username: @razewire_bot`);
    logger.info(`Channel ID: ${settings.telegramChannelId ? '✅ Set' : '❌ Not set'}`);
    logger.info(`Channel Username: ${settings.telegramChannelUsername || '❌ Not set'}\n`);

    logger.info('📋 Step-by-Step Channel Setup:');
    logger.info('==============================\n');

    logger.info('🔗 Step 1: Create Telegram Channel');
    logger.info('1. Open Telegram app');
    logger.info('2. Tap the menu (☰)');
    logger.info('3. Select "New Channel"');
    logger.info('4. Enter channel name: "RazeWire Daily News"');
    logger.info('5. Add description: "Latest news and updates from RazeWire"');
    logger.info('6. Set as Public');
    logger.info('7. Create username: @razewire_news (or your preferred name)');
    logger.info('8. Click "Create"\n');

    logger.info('🤖 Step 2: Add Bot as Administrator');
    logger.info('1. Go to your channel');
    logger.info('2. Tap the channel name at the top');
    logger.info('3. Tap "Administrators"');
    logger.info('4. Tap "Add Admin"');
    logger.info('5. Search for: @razewire_bot');
    logger.info('6. Grant these permissions:');
    logger.info('   ✅ Send Messages');
    logger.info('   ✅ Edit Messages');
    logger.info('   ✅ Delete Messages');
    logger.info('   ✅ Pin Messages\n');

    logger.info('1. Send any message to your channel (e.g., "Test message")');
    logger.info('2. Forward that message to @userinfobot');
    logger.info('3. Copy the "Chat ID" from the response');
    logger.info('   (It will look like: -1001234567890)\n');

    logger.info('💡 Channel ID Format Examples:');
    logger.info('   • Public channels: -1001234567890');
    logger.info('   • Private channels: -1001234567890');
    logger.info('   • Groups: -1234567890\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('🔗 Do you have the Channel ID now? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('📝 Enter the Channel ID (e.g., -1001234567890): ', async (channelId) => {
          if (channelId && channelId.trim() !== '') {
            rl.question('📝 Enter the Channel Username (e.g., @razewire_news): ', async (channelUsername) => {
              try {
                logger.info('\n💾 Updating database...');
                await Settings.updateCategorySettings('social-media', {
                  telegramChannelId: channelId.trim(),
                  telegramChannelUsername: channelUsername.trim() || ''
                });

                logger.info('✅ Channel ID updated successfully!');
                logger.info(`Channel ID: ${channelId.trim()}`);
                logger.info(`Channel Username: ${channelUsername.trim() || 'N/A'}\n`);

                logger.info('🧪 Testing Telegram integration...');
                const { default: axios } = await import('axios');
                
                try {
                  // Test bot access
                  const botResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);
                  if (botResponse.data.ok) {
                    logger.info('✅ Bot is working correctly');
                  }

                  // Test channel access
                  const channelResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
                    params: {
                      chat_id: channelId.trim()
                    }
                  });

                  if (channelResponse.data.ok) {
                    const chat = channelResponse.data.result;
                    logger.info('✅ Channel is accessible');
                    logger.info(`Channel Title: ${chat.title}`);
                    logger.info(`Channel Type: ${chat.type}`);
                    logger.info(`Member Count: ${chat.member_count || 'N/A'}\n`);
                    
                    logger.info('🎉 Telegram setup complete!');
                    logger.info('✅ Bot token configured');
                    logger.info('✅ Channel ID configured');
                    logger.info('✅ Ready for auto-posting!\n');

                    logger.info('📋 Next Steps:');
                    logger.info('1. Test auto-posting with a sample article');
                    logger.info('2. Monitor posting performance');
                    logger.info('3. Configure posting schedule');
                    logger.info('4. Track engagement in your channel\n');

                  } else {
                    logger.info('❌ Channel access failed');
                    logger.info('💡 Make sure bot is added as administrator to the channel\n');
                  }

                } catch (testError) {
                  logger.info('❌ Test failed:', testError.response?.data?.description || testError.message);
                  logger.info('💡 Check bot permissions in channel settings\n');
                }

              } catch (updateError) {
                logger.info('❌ Error updating database:', updateError.message);
              }
              rl.close();
            });
          } else {
            logger.info('❌ No channel ID provided');
            logger.info('💡 Please get the channel ID from @userinfobot and try again\n');
            rl.close();
          }
        });
      } else {
        logger.info('\n📋 Manual Setup Instructions:');
        logger.info('============================');
        logger.info('1. Follow the steps above to create your channel');
        logger.info('2. Add @razewire_bot as administrator');
        logger.info('3. Get channel ID from @userinfobot');
        logger.info('4. Run this script again or configure manually in admin panel\n');
        
        logger.info('💡 Alternative: Configure in Admin Panel');
        logger.info('1. Go to Admin → System → Auto-Posting → Telegram');
        logger.info('2. Enter Channel ID and Username');
        logger.info('3. Test the connection\n');
        
        rl.close();
      }
    });

  } catch (error) {
    logger.error('❌ Error:', error.message);
  }
}

telegramChannelSetup();
