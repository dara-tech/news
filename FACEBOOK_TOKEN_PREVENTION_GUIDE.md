# 🔑 Facebook Token Management - Prevention Guide

## 🚨 **Current Issue: Expired Token**

Your Facebook access token expired on **August 14, 2025**. Here's how to fix it and prevent it from happening again.

## 🔧 **Immediate Fix: Get New Token**

### **Step 1: Generate New Token**
1. **Go to Facebook Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. **Select your app**: `2017594075645280`
3. **Add these permissions**:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
4. **Click "Generate Access Token"**
5. **Copy the token**

### **Step 2: Get Page Access Token**
1. **Change endpoint to**: `https://graph.facebook.com/v18.0/775481852311918?fields=access_token`
2. **Use the token from Step 1** as access token
3. **Click "Submit"**
4. **Copy the page access token**

### **Step 3: Update Your System**
```bash
cd backend
node update-facebook-token.mjs
```

## 🛡️ **Prevention Strategy: Never Expire Again**

### **1. Automatic Token Manager**

Your system includes a **Facebook Token Manager** that prevents expiration:

```bash
# Start the token manager
cd backend
node facebook-token-manager.mjs
```

**What it does:**
- ✅ Checks token every 24 hours
- ✅ Auto-refreshes when ≤10 days left
- ✅ Updates database automatically
- ✅ Runs continuously in background

### **2. Token Types & Lifespans**

| Token Type | Lifespan | Refresh Method |
|------------|----------|----------------|
| **Short-lived** | 1-2 hours | Manual refresh |
| **Long-lived User** | 60 days | Auto-refresh |
| **Long-lived Page** | 60 days | Auto-refresh |

### **3. Best Practices**

#### **A. Use Long-lived Page Tokens**
- ✅ Generate page access tokens (not user tokens)
- ✅ These last 60 days instead of 1-2 hours
- ✅ Can be refreshed automatically

#### **B. Set Up Monitoring**
```bash
# Run this in production
nohup node facebook-token-manager.mjs > facebook-token.log 2>&1 &
```

#### **C. Regular Health Checks**
- Check token status weekly
- Monitor auto-posting success
- Set up alerts for failures

### **4. Production Deployment**

#### **Option A: Background Process**
```bash
# Start token manager as background process
nohup node facebook-token-manager.mjs > /var/log/facebook-token.log 2>&1 &

# Check if running
ps aux | grep facebook-token-manager
```

#### **Option B: Systemd Service**
Create `/etc/systemd/system/facebook-token-manager.service`:
```ini
[Unit]
Description=Facebook Token Manager
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app/backend
ExecStart=/usr/bin/node facebook-token-manager.mjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable facebook-token-manager
sudo systemctl start facebook-token-manager
sudo systemctl status facebook-token-manager
```

#### **Option C: Docker Container**
```dockerfile
# Add to your Dockerfile
COPY facebook-token-manager.mjs /app/
CMD ["node", "facebook-token-manager.mjs"]
```

## 🔍 **Monitoring & Alerts**

### **1. Token Status Monitoring**
```javascript
// Check token status programmatically
const tokenStatus = await facebookTokenManager.checkTokenStatus();
if (!tokenStatus.valid) {
  // Send alert
  console.log('🚨 Facebook token is invalid!');
}
```

### **2. Auto-Posting Health Checks**
```javascript
// Monitor auto-posting success rate
const stats = await socialMediaService.getPostingStats();
if (stats.facebook.successRate < 0.8) {
  // Investigate issues
  console.log('⚠️ Facebook posting success rate is low');
}
```

### **3. Log Monitoring**
```bash
# Monitor token manager logs
tail -f /var/log/facebook-token.log | grep -E "(ERROR|WARN|expired|refresh)"
```

## 🚨 **Emergency Procedures**

### **If Token Expires Again:**

1. **Immediate Action**:
   ```bash
   # Stop auto-posting temporarily
   curl -X PUT http://localhost:5001/api/admin/settings/social-media \
     -H "Content-Type: application/json" \
     -d '{"settings": {"facebookEnabled": false}}'
   ```

2. **Get New Token**:
   - Follow the token generation steps above
   - Use the update script: `node update-facebook-token.mjs`

3. **Restart Auto-Posting**:
   ```bash
   curl -X PUT http://localhost:5001/api/admin/settings/social-media \
     -H "Content-Type: application/json" \
     -d '{"settings": {"facebookEnabled": true}}'
   ```

4. **Start Token Manager**:
   ```bash
   node facebook-token-manager.mjs
   ```

## 📊 **Token Health Dashboard**

### **Check Current Status**
```bash
# Run token health check
node facebook-token-manager.mjs --check-only
```

### **Expected Output**
```
🔍 [8/15/2025, 11:02:22 PM] Checking Facebook token...
✅ Token is valid
📅 Token expires in 45 days (9/29/2025)
✅ Token is good for a while!
```

## 🎯 **Success Metrics**

### **Token Management**
- ✅ Token never expires
- ✅ Auto-refresh works automatically
- ✅ No manual intervention needed
- ✅ Continuous auto-posting

### **Auto-Posting Performance**
- ✅ 100% uptime for Facebook posting
- ✅ No failed posts due to token issues
- ✅ Automatic recovery from token problems

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Token expired"**
   - Run: `node update-facebook-token.mjs`
   - Get new token from Facebook Developer Console

2. **"Insufficient permissions"**
   - Add required permissions: `pages_manage_posts`, `pages_read_engagement`
   - Re-generate token with correct permissions

3. **"Page not found"**
   - Verify Page ID: `775481852311918`
   - Ensure you're admin of the page

4. **"Auto-refresh failed"**
   - Check App ID and App Secret
   - Verify token has correct permissions
   - Manually refresh if needed

## 📞 **Support Resources**

- **Facebook Developer Docs**: https://developers.facebook.com/docs/pages-api
- **Token Debugger**: https://developers.facebook.com/tools/debug/accesstoken/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/

---

## ✅ **Action Items**

1. **Immediate**: Get new Facebook token
2. **Short-term**: Set up token manager
3. **Long-term**: Monitor and maintain

**Your auto-posting will never expire again!** 🚀
