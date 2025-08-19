# 🔧 Telegram Webhook Setup Guide

## 🚨 **Why Like, Comment, Share Buttons Aren't Working**

The **navigation buttons** (Read Full Article, Visit Website, All News) work immediately because they're just URL links. However, the **interactive buttons** (Like, Comment, Share) need a **webhook** to handle the button clicks.

### **Current Status:**
- ✅ **Navigation Buttons**: Working (direct URLs)
- ❌ **Interactive Buttons**: Need webhook setup

---

## 🎯 **What You Need to Fix**

### **Problem 1: Domain Not Accessible**
The domain `razewire.com` is not resolving, which means:
- Your server might not be deployed yet
- The domain might not be configured correctly
- The webhook endpoint is not accessible

### **Problem 2: Webhook Not Set**
Telegram needs to know where to send button click events.

---

## 🚀 **Solution Options**

### **Option 1: Deploy Your Server First**

If you haven't deployed your backend yet:

1. **Deploy your backend** to a hosting service (Vercel, Railway, Heroku, etc.)
2. **Get your public URL** (e.g., `https://your-app.vercel.app`)
3. **Set the webhook** using the public URL

### **Option 2: Use a Temporary Domain**

For testing purposes, you can use services like:

- **ngrok** (for local development)
- **localtunnel** (for local development)
- **Your actual deployed domain**

### **Option 3: Manual Webhook Setup**

Once you have a public URL, set up the webhook manually.

---

## 🔧 **Step-by-Step Setup**

### **Step 1: Get Your Public URL**

#### **If using ngrok (for local testing):**
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, create tunnel
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
```

#### **If using Vercel:**
```bash
# Deploy to Vercel
vercel --prod

# You'll get a URL like: https://your-app.vercel.app
```

#### **If using Railway:**
```bash
# Deploy to Railway
railway up

# You'll get a URL like: https://your-app.railway.app
```

### **Step 2: Set the Webhook**

Once you have your public URL, set the webhook:

```bash
# Replace with your actual URL and bot token
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["callback_query", "message"],
    "max_connections": 40
  }'
```

### **Step 3: Verify Webhook Setup**

```bash
# Check webhook status
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

---

## 🛠️ **Manual Setup Script**

Create this script and run it with your actual domain:

```javascript
// setup-webhook-manual.js
const axios = require('axios');

const BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Replace with your bot token
const WEBHOOK_URL = 'https://your-domain.com/api/telegram/webhook'; // Replace with your domain

async function setWebhook() {
  try {
    console.log('🔧 Setting up Telegram webhook...');
    console.log(`URL: ${WEBHOOK_URL}`);
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        url: WEBHOOK_URL,
        allowed_updates: ['callback_query', 'message'],
        max_connections: 40
      }
    );
    
    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('🎯 Interactive buttons should now work!');
    } else {
      console.log('❌ Failed to set webhook:', response.data.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setWebhook();
```

---

## 🧪 **Testing the Setup**

### **Test 1: Check Webhook Status**
```bash
curl -X GET "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": null,
    "last_error_message": null,
    "max_connections": 40,
    "allowed_updates": ["callback_query", "message"]
  }
}
```

### **Test 2: Test Button Clicks**
1. Go to your Telegram channel
2. Find an article notification with buttons
3. Click **Like**, **Comment**, or **Share**
4. You should see popup responses

### **Test 3: Check Server Logs**
When buttons are clicked, you should see logs like:
```
📱 Telegram webhook received: { update_id: 123, has_callback_query: true }
📱 Callback query handled: { action: 'like', articleId: '...', userId: 123456789 }
```

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. "Webhook URL is not accessible"**
- **Solution**: Ensure your server is running and accessible
- **Check**: Try visiting the webhook URL in browser
- **Fix**: Deploy server or use ngrok for testing

#### **2. "SSL certificate error"**
- **Solution**: Use HTTPS URL
- **Check**: Ensure your domain has valid SSL
- **Fix**: Use services like Vercel/Railway that provide SSL

#### **3. "Bot token invalid"**
- **Solution**: Check your bot token
- **Check**: Verify token in @BotFather
- **Fix**: Regenerate token if needed

#### **4. "Webhook already set"**
- **Solution**: Delete existing webhook first
- **Command**: 
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook"
```

---

## 📱 **What Happens After Setup**

### **Before Setup:**
- ✅ Navigation buttons work (URLs)
- ❌ Interactive buttons show "loading" but no response

### **After Setup:**
- ✅ Navigation buttons work (URLs)
- ✅ Like button → Shows "👍 Thanks for liking!"
- ✅ Comment button → Shows comment instructions
- ✅ Share button → Shows share link

### **Button Responses:**
```javascript
// Like button
"👍 Thanks for liking \"Article Title\"!"

// Comment button  
"💬 To comment on \"Article Title\", visit: https://yourdomain.com/news/article-slug"

// Share button
"📤 Share \"Article Title\": https://yourdomain.com/news/article-slug"
```

---

## 🎯 **Quick Fix for Testing**

If you want to test immediately without deploying:

### **Option A: Use ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# Create tunnel (in another terminal)
ngrok http 5000

# Use the ngrok URL for webhook
# Example: https://abc123.ngrok.io/api/telegram/webhook
```

### **Option B: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Use the Vercel URL for webhook
# Example: https://your-app.vercel.app/api/telegram/webhook
```

---

## 🎉 **Success Checklist**

- [ ] Server is deployed and accessible
- [ ] Webhook URL is set correctly
- [ ] SSL certificate is valid
- [ ] Bot token is correct
- [ ] Webhook endpoint responds to POST requests
- [ ] Button clicks show popup responses
- [ ] Server logs show callback processing

---

## 📞 **Need Help?**

1. **Check server logs** for error messages
2. **Verify webhook status** using the API
3. **Test endpoint accessibility** manually
4. **Ensure SSL certificate** is valid
5. **Contact support** if issues persist

**Once the webhook is set up, your interactive buttons will work perfectly!** 🚀

