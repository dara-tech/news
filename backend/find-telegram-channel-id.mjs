#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';
import readline from 'readline';

dotenv.config();

async function findTelegramChannelId() {
  console.log('🔍 Finding Telegram Channel ID');
  console.log('==============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      console.log('❌ Telegram bot token not configured');
      console.log('💡 Please configure bot token first\n');
      return;
    }

    console.log('📋 Current Bot Information:');
    console.log(`Bot Token: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`Bot Username: @razewire_bot\n`);

    console.log('📋 Method 1: Using @userinfobot (Recommended)');
    console.log('=============================================');
    console.log('1. Create your Telegram channel');
    console.log('2. Add @razewire_bot as administrator');
    console.log('3. Send a message to your channel');
    console.log('4. Forward that message to @userinfobot');
    console.log('5. Copy the "Chat ID" from the response\n');

    console.log('📋 Method 2: Using Bot API (Alternative)');
    console.log('========================================');
    console.log('If you know your channel username, we can try to get the ID directly.\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('🔗 Do you have a channel username? (e.g., @razewire_news) or press Enter to skip: ', async (channelUsername) => {
      if (channelUsername && channelUsername.trim() !== '') {
        console.log(`\n🔍 Trying to get channel ID for: ${channelUsername}`);
        
        try {
          const response = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
            params: {
              chat_id: channelUsername.trim()
            }
          });

          if (response.data.ok) {
            const chat = response.data.result;
            console.log('✅ Channel found!');
            console.log(`Chat ID: ${chat.id}`);
            console.log(`Chat Type: ${chat.type}`);
            console.log(`Chat Title: ${chat.title}`);
            console.log(`Chat Username: ${chat.username ? '@' + chat.username : 'N/A'}`);
            console.log(`Member Count: ${chat.member_count || 'N/A'}\n`);

            console.log('💾 Would you like to update the database with this channel ID?');
            rl.question('Update database? (y/n): ', async (answer) => {
              if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                try {
                  await Settings.updateCategorySettings('social-media', {
                    telegramChannelId: chat.id.toString(),
                    telegramChannelUsername: chat.username ? '@' + chat.username : ''
                  });
                  console.log('✅ Channel ID updated in database!');
                  console.log('✅ Telegram configuration complete!\n');
                  
                  console.log('🧪 Testing Telegram integration...');
                  const testResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);
                  if (testResponse.data.ok) {
                    console.log('✅ Bot is working correctly');
                    console.log('✅ Channel is accessible');
                    console.log('✅ Ready for auto-posting!\n');
                  }
                } catch (updateError) {
                  console.log('❌ Error updating database:', updateError.message);
                }
              } else {
                console.log('📝 Channel ID not updated. You can configure it manually in the admin panel.\n');
              }
              rl.close();
            });
          } else {
            console.log('❌ Channel not found or bot cannot access it');
            console.log('💡 Make sure:');
            console.log('   • Channel exists and is public');
            console.log('   • Bot is added as administrator');
            console.log('   • Username is correct (including @ symbol)\n');
            rl.close();
          }
        } catch (error) {
          console.log('❌ Error accessing channel:');
          console.log(`Error: ${error.response?.data?.description || error.message}\n`);
          
          if (error.response?.status === 403) {
            console.log('🔧 Solution: Add @razewire_bot as administrator to your channel\n');
          } else if (error.response?.status === 400) {
            console.log('🔧 Solution: Check channel username format (should include @ symbol)\n');
          }
          rl.close();
        }
      } else {
        console.log('\n📋 Manual Channel ID Setup:');
        console.log('==========================');
        console.log('1. Create your Telegram channel');
        console.log('2. Add @razewire_bot as administrator');
        console.log('3. Send a message to your channel');
        console.log('4. Forward that message to @userinfobot');
        console.log('5. Copy the "Chat ID" (starts with -100)');
        console.log('6. Configure in admin panel or use update script\n');
        
        console.log('💡 Channel ID Format:');
        console.log('   • Public channels: -100xxxxxxxxxx');
        console.log('   • Private channels: -100xxxxxxxxxx');
        console.log('   • Groups: -xxxxxxxxxx\n');
        
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findTelegramChannelId();
