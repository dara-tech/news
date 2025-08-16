# 📷 Instagram Auto-Posting Setup Guide

## 📋 Prerequisites

### **1. Facebook Developer Account**
- Instagram uses Facebook's Graph API
- You need a Facebook App (same as Facebook setup)
- Instagram Business/Creator account required

### **2. Instagram Account Requirements**
- **Instagram Business Account** or **Creator Account**
- Account must be connected to a Facebook Page
- Account must have admin access to the Facebook Page

## 🔧 Step-by-Step Setup

### **Step 1: Create Facebook App (if not exists)**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add **Instagram Basic Display** product
4. Configure OAuth settings

### **Step 2: Connect Instagram Account**
1. In Facebook App, go to **Instagram Basic Display**
2. Add Instagram Test Users (your account)
3. Connect your Instagram account to Facebook Page
4. Get Instagram Business Account ID

### **Step 3: Get Required Tokens**
1. **Instagram Access Token**: Long-lived token for posting
2. **Instagram Business Account ID**: Your Instagram account ID
3. **Facebook Page Access Token**: For Instagram API access

### **Step 4: Configure in RazeWire**
1. Go to **Admin → System → Auto-Posting → Instagram**
2. Enter Instagram Business Account ID
3. Enter Instagram Access Token
4. Enable Instagram auto-posting
5. Test connection

## 🔑 Required Permissions

### **Instagram Basic Display Permissions**
- `instagram_basic` - Read profile info
- `instagram_content_publish` - Publish content
- `pages_show_list` - Access Facebook pages
- `pages_read_engagement` - Read page engagement

### **Facebook Page Permissions**
- `pages_manage_posts` - Manage page posts
- `pages_read_engagement` - Read engagement data

## 📝 API Endpoints Used

### **Post to Instagram**
```
POST https://graph.facebook.com/v20.0/{instagram-business-account-id}/media
```

### **Publish Instagram Post**
```
POST https://graph.facebook.com/v20.0/{instagram-business-account-id}/media_publish
```

### **Get Instagram Account Info**
```
GET https://graph.facebook.com/v20.0/{instagram-business-account-id}
```

## 🎯 Content Requirements

### **Image Posts**
- **Format**: JPEG, PNG
- **Aspect Ratio**: 1.91:1 to 4:5
- **Minimum Size**: 320x320 pixels
- **Maximum Size**: 1440x1800 pixels

### **Caption Requirements**
- **Maximum Length**: 2200 characters
- **Hashtags**: Up to 30 hashtags
- **Mentions**: @username format
- **Links**: Not clickable in captions

### **Video Posts**
- **Format**: MP4
- **Duration**: 3 seconds to 60 seconds
- **Aspect Ratio**: 1.91:1 to 4:5
- **File Size**: Up to 100MB

## 🚨 Common Issues & Solutions

### **Issue 1: "Instagram account not found"**
**Solution**: Ensure Instagram account is connected to Facebook Page

### **Issue 2: "Permission denied"**
**Solution**: Check Instagram account has proper permissions

### **Issue 3: "Invalid media format"**
**Solution**: Verify image/video meets Instagram requirements

### **Issue 4: "Rate limit exceeded"**
**Solution**: Implement delays between posts (25 posts per hour limit)

## 📊 Instagram API Limits

### **Rate Limits**
- **Posts per hour**: 25
- **Posts per day**: 100
- **API calls per hour**: 200

### **Content Limits**
- **Caption length**: 2200 characters
- **Hashtags**: 30 per post
- **Mentions**: Unlimited

## 🔧 Testing Instagram Integration

### **Test Script**
```bash
node test-instagram-specific.mjs
```

### **Manual Test**
1. Create a test post with image
2. Verify post appears on Instagram
3. Check engagement metrics
4. Monitor for errors

## 💡 Best Practices

### **Content Strategy**
- **Use high-quality images** (minimum 1080x1080)
- **Include relevant hashtags** (5-15 per post)
- **Post at optimal times** (2-4 PM, 8-9 PM)
- **Engage with comments** after posting

### **Technical Tips**
- **Pre-optimize images** for Instagram
- **Use consistent aspect ratios**
- **Test content before auto-posting**
- **Monitor rate limits**

### **Engagement Optimization**
- **Ask questions** in captions
- **Use call-to-action** phrases
- **Include location tags** when relevant
- **Cross-promote** with other platforms

## 🎯 Next Steps

1. **Set up Instagram Business Account**
2. **Connect to Facebook Page**
3. **Get Instagram Access Token**
4. **Configure in RazeWire admin**
5. **Test with sample content**
6. **Monitor performance**

## 📞 Support

### **If You Need Help**
1. Check Instagram Developer Documentation
2. Verify Facebook App permissions
3. Test with Instagram Graph API Explorer
4. Contact Instagram Business Support

---

**🎉 Once configured, Instagram will be a powerful addition to your auto-posting strategy!**
