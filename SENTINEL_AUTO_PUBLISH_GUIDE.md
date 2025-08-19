# 🤖 Sentinel Auto-Publish System with Telegram Notifications

## 📋 **Overview**

The Sentinel Auto-Publish System automatically publishes high-quality Sentinel drafts and sends instant notifications to your Telegram bot for easy content management. This creates a seamless workflow from content ingestion to publication.

---

## 🎯 **How It Works**

### **1. Content Flow**
```
RSS Sources → Sentinel AI → Draft Articles → Auto-Publish → Telegram Notification
```

### **2. Auto-Publish Process**
1. **Scans for Sentinel drafts** in the database
2. **Quality checks** each article (content length, completeness)
3. **Adds missing elements** (thumbnails, tags, keywords)
4. **Publishes articles** automatically
5. **Sends Telegram notifications** for each published article

### **3. Telegram Notifications**
- **Instant alerts** when articles are published
- **Rich formatting** with article details
- **Direct links** to read the full article
- **Easy management** from your phone

---

## 🚀 **Quick Setup**

### **Step 1: Ensure Telegram is Configured**
1. Go to **Admin → Auto-Posting → Telegram**
2. Verify your bot token and channel ID are set
3. Enable Telegram auto-posting

### **Step 2: Test the System**
```bash
cd backend
node test-auto-publish.mjs
```

### **Step 3: Run Auto-Publish**
```bash
# Via API endpoint
POST /api/admin/auto-publish/sentinel

# Or via script
node test-auto-publish.mjs
```

---

## 📊 **API Endpoints**

### **Auto-Publish Sentinel Drafts**
```http
POST /api/admin/auto-publish/sentinel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-publish process completed successfully",
  "stats": {
    "totalDrafts": 5,
    "totalPublished": 150,
    "todayPublished": 12,
    "telegramEnabled": true
  }
}
```

### **Get Auto-Publish Statistics**
```http
GET /api/admin/auto-publish/stats
Authorization: Bearer <token>
```

### **Get Pending Drafts**
```http
GET /api/admin/auto-publish/pending?page=1&limit=10
Authorization: Bearer <token>
```

### **Test Telegram Notification**
```http
POST /api/admin/auto-publish/test-telegram
Authorization: Bearer <token>
Content-Type: application/json

{
  "articleId": "article_id_here"
}
```

---

## 🔧 **Configuration**

### **Quality Thresholds**
The system automatically publishes articles that meet these criteria:
- **Content length**: 100+ characters in both English and Khmer
- **Complete translations**: Both languages must be present
- **Valid structure**: Title, description, and content required

### **Auto-Enhancement Features**
- **Thumbnails**: Generated automatically if missing
- **Tags**: Extracted from content (max 7 tags)
- **Keywords**: Generated from content analysis (max 10 keywords)
- **SEO optimization**: Meta descriptions and keywords added

### **Rate Limiting**
- **Processing limit**: 10 articles per batch
- **Delay between articles**: 2 seconds
- **Telegram notifications**: Sent for each published article

---

## 📱 **Telegram Notification Format**

### **Message Structure**
```
📰 NEW ARTICLE PUBLISHED

[Article Title]

[Article Description]

📂 Category: [Category Name]
👤 Author: [Author Name]
📅 Published: [Date/Time]

📖 [Read Full Article](link)

#news #[category] #razewire
```

### **Features**
- **Markdown formatting** for rich text
- **Article preview** with description
- **Direct link** to read the full article
- **Category and author** information
- **Hashtags** for easy discovery
- **Timestamp** of publication

---

## 🎛️ **Admin Panel Integration**

### **Auto-Publish Dashboard**
- **Statistics overview**: Drafts, published, today's count
- **Quick actions**: Run auto-publish, view pending drafts
- **Telegram status**: Connection and notification status
- **Recent activity**: Last auto-publish run and results

### **Manual Controls**
- **Run auto-publish**: Trigger the process manually
- **View pending drafts**: See what's waiting to be published
- **Test notifications**: Send test Telegram messages
- **Configure settings**: Adjust quality thresholds

---

## 📈 **Monitoring & Analytics**

### **Statistics Tracking**
- **Total drafts**: Number of Sentinel drafts in queue
- **Total published**: All-time published articles
- **Today published**: Articles published today
- **Success rate**: Percentage of drafts successfully published

### **Performance Metrics**
- **Processing time**: How long each batch takes
- **Quality score**: Average content quality of published articles
- **Telegram delivery**: Success rate of notifications
- **Error tracking**: Failed publications and reasons

---

## 🔄 **Automation Options**

### **Scheduled Auto-Publish**
```javascript
// Run every hour
setInterval(async () => {
  await sentinelAutoPublishService.autoPublishSentinelDrafts();
}, 60 * 60 * 1000);
```

### **Trigger on New Drafts**
```javascript
// Run when new Sentinel drafts are created
sentinelService.on('draftCreated', async (draft) => {
  await sentinelAutoPublishService.autoPublishSentinelDrafts();
});
```

### **Webhook Integration**
```javascript
// Webhook endpoint for external triggers
app.post('/webhook/auto-publish', async (req, res) => {
  await sentinelAutoPublishService.autoPublishSentinelDrafts();
  res.json({ success: true });
});
```

---

## 🛠️ **Customization**

### **Quality Thresholds**
```javascript
// Customize quality requirements
const hasGoodContent = article.content?.en && 
                     article.content.en.length > 200 && // Increase minimum length
                     article.content?.kh && 
                     article.content.kh.length > 200;
```

### **Tag Extraction**
```javascript
// Add custom tags
const customTags = [
  'Your Custom Tag',
  'Another Tag',
  // ... more tags
];
```

### **Telegram Message Format**
```javascript
// Customize notification message
const message = `🚀 *NEW ARTICLE*\n\n` +
               `*${article.title?.en}*\n\n` +
               `${article.description?.en}\n\n` +
               `📖 [Read More](${articleUrl})`;
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **No Drafts Being Published**
- **Check content quality**: Ensure articles meet minimum length requirements
- **Verify Sentinel method**: Articles must have `ingestion.method: 'sentinel'`
- **Check author assignment**: Articles need valid authors

#### **Telegram Notifications Not Sending**
- **Verify bot token**: Check Telegram bot configuration
- **Check channel permissions**: Bot must be admin of the channel
- **Test connection**: Use the test endpoint to verify setup

#### **Performance Issues**
- **Reduce batch size**: Process fewer articles at once
- **Increase delays**: Add more time between processing
- **Check database**: Ensure proper indexing on draft queries

### **Error Handling**
- **Graceful failures**: System continues even if individual articles fail
- **Detailed logging**: All actions are logged for debugging
- **Partial success**: Some articles may publish even if others fail

---

## 📋 **Best Practices**

### **Content Management**
1. **Regular monitoring**: Check auto-publish statistics daily
2. **Quality review**: Periodically review published content
3. **Tag optimization**: Refine tag extraction for better SEO
4. **Performance tuning**: Adjust thresholds based on content quality

### **Telegram Management**
1. **Channel organization**: Use pinned messages for important updates
2. **Notification filtering**: Consider different channels for different content types
3. **Engagement tracking**: Monitor which notifications get the most engagement
4. **Backup notifications**: Consider email notifications as backup

### **System Maintenance**
1. **Regular testing**: Test the system weekly
2. **Statistics review**: Monitor performance metrics
3. **Configuration updates**: Adjust settings based on performance
4. **Backup procedures**: Ensure data is backed up regularly

---

## 🎉 **Success Indicators**

### **Healthy System**
- ✅ Articles publishing automatically
- ✅ Telegram notifications sending successfully
- ✅ Quality content being produced
- ✅ Regular content flow maintained

### **Performance Metrics**
- **Publish rate**: 80%+ of drafts successfully published
- **Notification delivery**: 95%+ Telegram notifications sent
- **Content quality**: Average article length > 300 words
- **Processing time**: < 30 seconds per batch

---

## 🚀 **Next Steps**

1. **Test the system** with existing Sentinel drafts
2. **Configure Telegram** notifications
3. **Set up automation** (scheduled runs)
4. **Monitor performance** and adjust settings
5. **Scale up** as content volume grows

**The Sentinel Auto-Publish System transforms your content workflow from manual to automated, ensuring consistent, high-quality content publication with instant notifications for easy management!** 🎊

