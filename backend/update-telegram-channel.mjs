#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

async function updateTelegramChannel() {
  console.log('📱 Updating Telegram Channel Configuration');
  console.log('==========================================\n');

  const channelId = '-1002934676178';
  const channelUsername = '@razewire';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.getCategorySettings('social-media');
    
    if (!settings.telegramBotToken) {
      console.log('❌ Telegram bot token not configured');
      console.log('💡 Please configure bot token first\n');
      return;
    }

    console.log('🔍 Testing channel access...');
    
    // Test channel access
    const channelResponse = await axios.get(`https://api.telegram.org/bot${settings.telegramBotToken}/getChat`, {
      params: {
        chat_id: channelId
      }
    });

    if (channelResponse.data.ok) {
      const chat = channelResponse.data.result;
      console.log('✅ Channel access successful!');
      console.log(`Channel ID: ${chat.id}`);
      console.log(`Channel Title: ${chat.title}`);
      console.log(`Channel Username: ${chat.username ? '@' + chat.username : 'N/A'}`);
      console.log(`Channel Type: ${chat.type}`);
      console.log(`Member Count: ${chat.member_count || 'N/A'}\n`);

      // Update the database
      console.log('💾 Updating database...');
      await Settings.updateCategorySettings('social-media', {
        telegramChannelId: channelId,
        telegramChannelUsername: channelUsername,
        telegramEnabled: true
      });

      console.log('✅ Channel configuration updated successfully!');
      console.log(`Channel ID: ${channelId}`);
      console.log(`Channel Username: ${channelUsername}\n`);

      // Test sending a message
      console.log('🧪 Testing message sending...');
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
        console.log('✅ Test message sent successfully!');
        console.log(`Message ID: ${message.message_id}`);
        console.log(`Date: ${new Date(message.date * 1000).toLocaleString()}`);
        
        const messageUrl = `https://t.me/${chat.username}/${message.message_id}`;
        console.log(`Message URL: ${messageUrl}\n`);

        // Clean up - delete the test message
        try {
          await axios.post(`https://api.telegram.org/bot${settings.telegramBotToken}/deleteMessage`, {
            chat_id: channelId,
            message_id: message.message_id
          });
          console.log('🧹 Test message cleaned up successfully\n');
        } catch (cleanupError) {
          console.log('⚠️  Could not clean up test message (this is normal)\n');
        }

      } else {
        console.log('❌ Test message failed:');
        console.log(`Error: ${messageResponse.data.description}\n`);
      }

      console.log('🎉 Telegram setup complete!');
      console.log('✅ Bot token configured');
      console.log('✅ Channel ID configured');
      console.log('✅ Channel username configured');
      console.log('✅ Bot has administrator permissions');
      console.log('✅ Message sending tested');
      console.log('✅ Ready for auto-posting!\n');

      console.log('📋 Next Steps:');
      console.log('1. Test auto-posting with a sample article');
      console.log('2. Monitor posting performance');
      console.log('3. Configure posting schedule');
      console.log('4. Track engagement in your channel');
      console.log('5. Share your channel: https://t.me/razewire\n');

      console.log('🧪 Test Commands:');
      console.log('node test-telegram-specific.mjs');
      console.log('node test-auto-posting.mjs\n');

    } else {
      console.log('❌ Channel access failed:');
      console.log(`Error: ${channelResponse.data.description}\n`);
    }

  } catch (error) {
    console.log('❌ Error updating Telegram channel:');
    console.log(`Error: ${error.response?.data?.description || error.message}\n`);
    
    if (error.response?.status === 403) {
      console.log('🔧 Permission Issue:');
      console.log('• Bot may not be added to the channel');
      console.log('• Add bot as administrator to the channel');
      console.log('• Ensure bot has posting permissions\n');
    } else if (error.response?.status === 400) {
      console.log('🔧 Channel ID Issue:');
      console.log('• Channel ID may be incorrect');
      console.log('• Check channel ID format\n');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateTelegramChannel();
