#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.mjs';
import axios from 'axios';

dotenv.config();

async function updateTelegramToken() {
  console.log('📱 Updating Telegram Bot Token');
  console.log('==============================\n');

  const botToken = '8207949077:AAGsEbw0md9vikM0zY7nOgDw52YR7Akg_Yw';

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Testing bot token...');
    
    // Test the bot token
    const botResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    
    if (botResponse.data.ok) {
      const bot = botResponse.data.result;
      console.log('✅ Bot token is valid!');
      console.log(`Bot ID: ${bot.id}`);
      console.log(`Bot Name: ${bot.first_name}`);
      console.log(`Bot Username: @${bot.username}`);
      console.log(`Can Join Groups: ${bot.can_join_groups ? '✅ Yes' : '❌ No'}`);
      console.log(`Can Read All Group Messages: ${bot.can_read_all_group_messages ? '✅ Yes' : '❌ No'}`);
      console.log(`Supports Inline Queries: ${bot.supports_inline_queries ? '✅ Yes' : '❌ No'}\n`);

      // Update the database
      console.log('💾 Updating database...');
      await Settings.updateCategorySettings('social-media', {
        telegramBotToken: botToken,
        telegramEnabled: true
      });

      console.log('✅ Telegram bot token updated successfully!');
      console.log('✅ Telegram auto-posting enabled\n');

      console.log('📋 Next Steps:');
      console.log('1. ✅ Bot token is configured');
      console.log('2. 🔗 Create a Telegram channel');
      console.log('3. 📝 Add bot as administrator to channel');
      console.log('4. 🔍 Get channel ID from @userinfobot');
      console.log('5. ⚙️  Configure channel ID in admin panel');
      console.log('6. 🧪 Test the integration\n');

      console.log('📖 See telegram-setup-guide.md for detailed channel setup instructions\n');

    } else {
      console.log('❌ Bot token validation failed:');
      console.log(`Error: ${botResponse.data.description}\n`);
    }

  } catch (error) {
    console.log('❌ Error updating Telegram token:');
    console.log(`Error: ${error.response?.data?.description || error.message}\n`);
    
    if (error.response?.status === 401) {
      console.log('🔧 Token Issue:');
      console.log('• Bot token may be invalid');
      console.log('• Check token from @BotFather');
      console.log('• Ensure token is copied correctly\n');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateTelegramToken();
