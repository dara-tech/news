# 📱 Telegram Auto-Posting Setup Guide

## 📋 Prerequisites

### **1. Telegram Bot**
- Create a Telegram bot via @BotFather
- Get Bot Token for API access
- Configure bot permissions

### **2. Telegram Channel/Group**
- Create a public channel or group
- Add your bot as an administrator
- Ensure bot has posting permissions

### **3. Bot Permissions Required**
- **Send Messages**: Post content to channel/group
- **Edit Messages**: Update posts if needed
- **Delete Messages**: Remove posts if required
- **Pin Messages**: Pin important posts

## 🔧 Step-by-Step Setup

### **Step 1: Create Telegram Bot**
1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send command**: `/newbot`
4. **Follow prompts**:
   - Enter bot name (e.g., "RazeWire News Bot")
   - Enter bot username (e.g., "razewire_news_bot")
5. **Save the Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### **Step 2: Create Telegram Channel**
1. **Open Telegram** and tap the menu (☰)
2. **Select "New Channel"**
3. **Enter channel name** (e.g., "RazeWire News")
4. **Add description** (optional)
5. **Set as Public** and create a username (e.g., "@razewire_news")
6. **Add your bot as administrator**:
   - Go to channel settings
   - Tap "Administrators"
   - Tap "Add Admin"
   - Search for your bot username
   - Grant posting permissions

### **Step 3: Get Channel ID**
1. **Send a message** to your channel
2. **Forward that message** to @userinfobot
3. **Copy the Channel ID** (looks like: `-1001234567890`)
4. **Note**: Channel IDs start with `-100` for public channels

### **Step 4: Configure in RazeWire**
1. Go to **Admin → System → Auto-Posting → Telegram**
2. Enter the following:
   - **Bot Token**: Your bot token from Step 1
   - **Channel ID**: Your channel ID from Step 3
   - **Channel Username**: Your channel username (e.g., "@razewire_news")
   - **Enable Telegram**: Check this box
3. **Test the connection**

## 📝 API Endpoints Used

### **Send Message to Channel**
```
POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
```

### **Send Photo with Caption**
```
POST https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto
```

### **Get Bot Information**
```
GET https://api.telegram.org/bot{BOT_TOKEN}/getMe
```

### **Get Channel Information**
```
GET https://api.telegram.org/bot{BOT_TOKEN}/getChat
```

## 🎯 Content Requirements

### **Message Format**
- **Text Length**: Up to 4096 characters
- **Markdown Support**: Bold, italic, links, code
- **HTML Support**: Rich formatting
- **Emojis**: Fully supported

### **Photo Posts**
- **Format**: JPEG, PNG, GIF
- **Maximum Size**: 10MB
- **Caption**: Up to 1024 characters
- **Aspect Ratio**: Flexible

### **Video Posts**
- **Format**: MP4, MOV
- **Maximum Size**: 50MB
- **Duration**: Up to 60 seconds
- **Caption**: Up to 1024 characters

## 🚨 Common Issues & Solutions

### **Issue 1: "Bot is not a member of the chat"**
**Solution**: Add bot as administrator to the channel

### **Issue 2: "Bot was blocked by the user"**
**Solution**: Unblock the bot in channel settings

### **Issue 3: "Chat not found"**
**Solution**: Verify channel ID is correct

### **Issue 4: "Forbidden: bot was kicked"**
**Solution**: Re-add bot to channel as administrator

## 📊 Telegram API Limits

### **Rate Limits**
- **Messages per second**: 30
- **Messages per minute**: 20
- **Messages per hour**: 3600
- **File uploads**: 20MB per file

### **Content Limits**
- **Text message**: 4096 characters
- **Photo caption**: 1024 characters
- **Channel username**: 32 characters
- **Bot username**: 64 characters

## 🔧 Testing Telegram Integration

### **Test Script**
```bash
node test-telegram-specific.mjs
```

### **Manual Test**
1. Create a test post with text
2. Verify post appears in channel
3. Check formatting and links
4. Monitor for errors

## 💡 Best Practices

### **Content Strategy**
- **Use clear headlines** for news posts
- **Include relevant hashtags** (#news, #breaking, etc.)
- **Add source links** for credibility
- **Use emojis** for visual appeal
- **Post at optimal times** (morning/evening)

### **Technical Tips**
- **Test bot permissions** regularly
- **Monitor rate limits** for high-volume posting
- **Use markdown formatting** for better readability
- **Include channel username** in posts for branding

### **Engagement Optimization**
- **Ask questions** to encourage discussion
- **Use call-to-action** phrases
- **Cross-promote** with other platforms
- **Respond to comments** in the channel

## 🎯 Next Steps

1. **Create Telegram bot** via @BotFather
2. **Set up channel** and add bot as admin
3. **Get bot token and channel ID**
4. **Configure in RazeWire admin**
5. **Test with sample content**
6. **Monitor performance**

## 📞 Support

### **If You Need Help**
1. Check Telegram Bot API documentation
2. Verify bot permissions in channel
3. Test with Telegram Bot API directly
4. Contact Telegram support for bot issues

### **Useful Commands**
- `/mybots` - List your bots
- `/setcommands` - Set bot commands
- `/setdescription` - Set bot description
- `/setabouttext` - Set bot about text

---

**🎉 Once configured, Telegram will be a powerful addition to your auto-posting strategy with excellent reach and engagement!**
