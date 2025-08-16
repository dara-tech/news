#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import readline from 'readline';

dotenv.config();

async function telegramChannelSetup() {
  console.log('📱 Telegram Channel Setup Guide');
  console.log('===============================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      console.log('❌ Telegram bot token not configured');
      console.log('💡 Please configure bot token first\n');
      return;
    }

    console.log('📋 Current Status:');
    console.log(`Bot Token: ${settings.telegramBotToken ? '✅ Set' : '❌ Not set'}`);
    console.log(`Bot Username: @razewire_bot`);
    console.log(`Channel ID: ${settings.telegramChannelId ? '✅ Set' : '❌ Not set'}`);
    console.log(`Channel Username: ${settings.telegramChannelUsername || '❌ Not set'}\n`);

    console.log('📋 Step-by-Step Channel Setup:');
    console.log('==============================\n');

    console.log('🔗 Step 1: Create Telegram Channel');
    console.log('1. Open Telegram app');
    console.log('2. Tap the menu (☰)');
    console.log('3. Select "New Channel"');
    console.log('4. Enter channel name: "RazeWire Daily News"');
    console.log('5. Add description: "Latest news and updates from RazeWire"');
    console.log('6. Set as Public');
    console.log('7. Create username: @razewire_news (or your preferred name)');
    console.log('8. Click "Create"\n');

    console.log('🤖 Step 2: Add Bot as Administrator');
    console.log('1. Go to your channel');
    console.log('2. Tap the channel name at the top');
    console.log('3. Tap "Administrators"');
    console.log('4. Tap "Add Admin"');
    console.log('5. Search for: @razewire_bot');
    console.log('6. Grant these permissions:');
    console.log('   ✅ Send Messages');
    console.log('   ✅ Edit Messages');
    console.log('   ✅ Delete Messages');
    console.log('   ✅ Pin Messages\n');

    console.log('🔍 Step 3: Get Channel ID');
    console.log('1. Send any message to your channel (e.g., "Test message")');
    console.log('2. Forward that message to @userinfobot');
    console.log('3. Copy the "Chat ID" from the response');
    console.log('   (It will look like: -1001234567890)\n');

    console.log('💡 Channel ID Format Examples:');
    console.log('   • Public channels: -1001234567890');
    console.log('   • Private channels: -1001234567890');
    console.log('   • Groups: -1234567890\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question('🔗 Do you have the Channel ID now? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.question('📝 Enter the Channel ID (e.g., -1001234567890): ', async (channelId) => {
          if (channelId && channelId.trim() !== '') {
            rl.question('📝 Enter the Channel Username (e.g., @razewire_news): ', async (channelUsername) => {
              try {
                console.log('\n💾 Updating database...');
                await Settings.updateCategorySettings('social-media', {
                  telegramChannelId: channelId.trim(),
                  telegramChannelUsername: channelUsername.trim() || ''
                });

                console.log('✅ Channel ID updated successfully!');
                console.log(`Channel ID: ${channelId.trim()}`);
                console.log(`Channel Username: ${channelUsername.trim() || 'N/A'}\n`);

                console.log('🧪 Testing Telegram integration...');
                const { default: axios } = await import('axios');
                
                try {
                  // Test bot access
                  const botResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getMe`);
                  if (botResponse.data.ok) {
                    console.log('✅ Bot is working correctly');
                  }

                  // Test channel access
                  const channelResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
                    params: {
                      chat_id: channelId.trim()
                    }
                  });

                  if (channelResponse.data.ok) {
                    const chat = channelResponse.data.result;
                    console.log('✅ Channel is accessible');
                    console.log(`Channel Title: ${chat.title}`);
                    console.log(`Channel Type: ${chat.type}`);
                    console.log(`Member Count: ${chat.member_count || 'N/A'}\n`);
                    
                    console.log('🎉 Telegram setup complete!');
                    console.log('✅ Bot token configured');
                    console.log('✅ Channel ID configured');
                    console.log('✅ Ready for auto-posting!\n');

                    console.log('📋 Next Steps:');
                    console.log('1. Test auto-posting with a sample article');
                    console.log('2. Monitor posting performance');
                    console.log('3. Configure posting schedule');
                    console.log('4. Track engagement in your channel\n');

                  } else {
                    console.log('❌ Channel access failed');
                    console.log('💡 Make sure bot is added as administrator to the channel\n');
                  }

                } catch (testError) {
                  console.log('❌ Test failed:', testError.response?.data?.description || testError.message);
                  console.log('💡 Check bot permissions in channel settings\n');
                }

              } catch (updateError) {
                console.log('❌ Error updating database:', updateError.message);
              }
              rl.close();
            });
          } else {
            console.log('❌ No channel ID provided');
            console.log('💡 Please get the channel ID from @userinfobot and try again\n');
            rl.close();
          }
        });
      } else {
        console.log('\n📋 Manual Setup Instructions:');
        console.log('============================');
        console.log('1. Follow the steps above to create your channel');
        console.log('2. Add @razewire_bot as administrator');
        console.log('3. Get channel ID from @userinfobot');
        console.log('4. Run this script again or configure manually in admin panel\n');
        
        console.log('💡 Alternative: Configure in Admin Panel');
        console.log('1. Go to Admin → System → Auto-Posting → Telegram');
        console.log('2. Enter Channel ID and Username');
        console.log('3. Test the connection\n');
        
        rl.close();
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

telegramChannelSetup();
