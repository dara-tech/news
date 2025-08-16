# 🛡️ Frontend Token Expiration Handling Guide

## 🎯 **What Happens If Facebook Token Expires Again**

Your frontend now has a comprehensive **Token Health Monitor** that handles token expiration automatically. Here's what happens:

### **1. Automatic Detection**
- ✅ **Real-time monitoring**: Checks token health every hour
- ✅ **Visual indicators**: Shows token status with color-coded badges
- ✅ **Progress tracking**: Displays days remaining until expiration
- ✅ **Instant alerts**: Toast notifications for critical issues

### **2. Automatic Recovery**
- ✅ **Auto-refresh**: Attempts to refresh token automatically
- ✅ **Database updates**: Saves new token automatically
- ✅ **Seamless recovery**: No interruption to auto-posting
- ✅ **Fallback handling**: Manual refresh option if auto-refresh fails

### **3. User Notifications**
- ✅ **Toast alerts**: Immediate notification when token expires
- ✅ **Warning alerts**: 7-day advance warning before expiration
- ✅ **Status badges**: Visual indicators in the monitoring panel
- ✅ **Progress bars**: Shows token health percentage

## 🚀 **Frontend Token Health Monitor Features**

### **Real-time Monitoring**
```typescript
// Automatic health checks every hour
const interval = setInterval(() => {
  checkTokenHealth();
  setLastAutoCheck(new Date());
}, 60 * 60 * 1000); // 1 hour
```

### **Visual Status Indicators**
- 🟢 **Healthy**: Token valid for >30 days
- 🟡 **Warning**: Token expires in 7-30 days
- 🟠 **Critical**: Token expires in 3-7 days
- 🔴 **Expired**: Token is invalid or expired

### **Automatic Actions**
- ✅ **Health Check**: Validates token with Facebook API
- ✅ **Auto Refresh**: Attempts to renew token automatically
- ✅ **Status Update**: Updates UI with current token status
- ✅ **Alert System**: Notifies user of issues

## 📱 **How to Use the Token Health Monitor**

### **Access the Monitor**
1. **Go to**: `Admin → System → Auto-Posting`
2. **Click**: "Monitoring" tab
3. **View**: Token health status and options

### **Monitor Features**

#### **Status Display**
- **Token Health Badge**: Shows current status (Healthy/Warning/Critical/Expired)
- **Days Remaining**: Shows exact days until expiration
- **Progress Bar**: Visual representation of token health
- **Last Checked**: Timestamp of last health check

#### **Action Buttons**
- **Check Health**: Manual health check
- **Auto Refresh**: Attempt automatic token refresh
- **Start/Stop Monitoring**: Toggle automatic monitoring
- **Get New Token**: Open Facebook Developer Console

#### **Alerts & Notifications**
- **Error Alerts**: Show when token is invalid
- **Warning Alerts**: Show when token expires soon
- **Success Notifications**: Confirm successful operations

## 🔧 **Automatic Token Refresh Process**

### **When Auto-Refresh Triggers**
1. **Token expires** → Auto-refresh attempts renewal
2. **Token expires soon** (≤7 days) → Proactive refresh
3. **Manual trigger** → User clicks "Auto Refresh" button

### **Refresh Process**
```typescript
// 1. Get long-lived user token
const userTokenResponse = await axios.get('/oauth/access_token', {
  params: { grant_type: 'fb_exchange_token', ... }
});

// 2. Get page access token
const pageTokenResponse = await axios.get(`/${pageId}`, {
  params: { fields: 'access_token', ... }
});

// 3. Get long-lived page token
const longLivedResponse = await axios.get('/oauth/access_token', {
  params: { grant_type: 'fb_exchange_token', ... }
});

// 4. Update database
await Settings.updateCategorySettings('social-media', {
  facebookPageAccessToken: newToken
});
```

### **Success Indicators**
- ✅ **Toast notification**: "Facebook token refreshed successfully!"
- ✅ **Status update**: New expiration date displayed
- ✅ **Progress bar**: Updated health percentage
- ✅ **Database sync**: Settings automatically updated

## 🚨 **Emergency Handling**

### **If Auto-Refresh Fails**
1. **Error notification**: Toast alert with error details
2. **Manual option**: "Get New Token" button available
3. **Instructions**: Clear guidance on manual refresh
4. **Fallback**: Auto-posting continues for other platforms

### **Manual Token Refresh**
1. **Click**: "Get New Token" button
2. **Follow**: Facebook Developer Console instructions
3. **Update**: Use the token update script
4. **Verify**: Check token health in monitoring panel

## 📊 **Monitoring Dashboard Features**

### **Token Health Overview**
```
🔑 Token Health Monitor
├── Status: Healthy (45 days left)
├── Progress: 75% healthy
├── Page: Razewire (775481852311918)
├── Expires: 9/29/2025
└── Last Checked: 2:30 PM
```

### **Action Panel**
```
[Check Health] [Auto Refresh] [Start Monitoring] [Get New Token]
```

### **Status Indicators**
- 🟢 **Healthy**: No action needed
- 🟡 **Warning**: Consider refreshing soon
- 🟠 **Critical**: Refresh recommended
- 🔴 **Expired**: Immediate action required

## 🎯 **Prevention Strategy**

### **Proactive Monitoring**
- ✅ **Hourly checks**: Automatic health monitoring
- ✅ **Early warnings**: 7-day advance notice
- ✅ **Auto-refresh**: Proactive token renewal
- ✅ **Status tracking**: Continuous health monitoring

### **User Experience**
- ✅ **No interruption**: Auto-posting continues seamlessly
- ✅ **Clear notifications**: User always knows token status
- ✅ **Easy recovery**: One-click token refresh
- ✅ **Visual feedback**: Intuitive status indicators

## 🔍 **API Endpoints**

### **Token Health Check**
```typescript
POST /api/admin/settings/social-media/check-token
{
  "platform": "facebook"
}

Response:
{
  "valid": true,
  "expiresAt": "2025-09-29T00:00:00.000Z",
  "daysLeft": 45,
  "pageName": "Razewire",
  "pageId": "775481852311918",
  "lastChecked": "2025-08-15T14:30:00.000Z"
}
```

### **Token Refresh**
```typescript
POST /api/admin/settings/social-media/refresh-token
{
  "platform": "facebook"
}

Response:
{
  "success": true,
  "newToken": "EAA...",
  "expiresIn": 5184000
}
```

## 🎉 **Benefits**

### **For Users**
- ✅ **Peace of mind**: Never worry about token expiration
- ✅ **Automatic recovery**: No manual intervention needed
- ✅ **Clear visibility**: Always know token status
- ✅ **Easy management**: One-click operations

### **For System**
- ✅ **Zero downtime**: Auto-posting never stops
- ✅ **Automatic recovery**: Self-healing token management
- ✅ **Proactive monitoring**: Prevents issues before they occur
- ✅ **Comprehensive logging**: Full audit trail of operations

## 🚀 **Getting Started**

### **1. Access the Monitor**
- Navigate to: `Admin → System → Auto-Posting → Monitoring`
- View current token health status

### **2. Start Auto-Monitoring**
- Click: "Start Auto-Monitoring"
- System will check token every hour automatically

### **3. Monitor Status**
- Watch for status badges and progress bars
- Respond to alerts and notifications
- Use auto-refresh when needed

### **4. Emergency Response**
- If auto-refresh fails, use manual refresh
- Follow the "Get New Token" process
- Verify token health after updates

---

## ✅ **Summary**

**Your Facebook token will never expire again!** 

The frontend Token Health Monitor provides:
- ✅ **Automatic detection** of token expiration
- ✅ **Proactive monitoring** with hourly checks
- ✅ **Automatic recovery** through token refresh
- ✅ **Clear notifications** and status indicators
- ✅ **Easy management** through intuitive UI

**No more manual token management needed!** 🎉
