# 🔍 Token Monitoring System Guide

## 🎯 **Overview**

The Token Monitoring System provides comprehensive monitoring and management of social media platform tokens across your RazeWire application. It helps prevent auto-posting failures by monitoring token health, expiration dates, and providing automatic refresh capabilities.

## 📱 **Frontend Features**

### **Token Monitoring Dashboard**
- **Location**: `Admin → System → Auto-Posting → Monitoring`
- **Features**:
  - Real-time token health status for all platforms
  - Visual progress bars showing token lifetime
  - Automatic hourly monitoring
  - One-click token refresh
  - Detailed platform-specific information
  - Toast notifications for critical issues

### **Platform Support**
- ✅ **Facebook**: Page Access Token monitoring with expiration tracking
- ✅ **Twitter/X**: OAuth 1.0a User Context token validation
- ✅ **LinkedIn**: Access Token and Refresh Token monitoring
- ✅ **Instagram**: Access Token validation (when configured)

### **Status Indicators**
- 🟢 **Healthy**: Token is valid and has more than 7 days remaining
- 🟡 **Expiring Soon**: Token expires in 7 days or less
- 🔴 **Invalid/Expired**: Token is invalid or has expired

## 🔧 **Backend API Endpoints**

### **Check Token Health**
```http
POST /api/admin/settings/social-media/check-token
Content-Type: application/json

{
  "platform": "facebook|twitter|linkedin|instagram"
}
```

**Response:**
```json
{
  "success": true,
  "tokenHealth": {
    "isValid": true,
    "platform": "facebook",
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "daysLeft": 45,
    "details": {
      "name": "Your Page Name",
      "id": "123456789",
      "type": "Facebook Page"
    }
  }
}
```

### **Refresh Token**
```http
POST /api/admin/settings/social-media/refresh-token
Content-Type: application/json

{
  "platform": "facebook|twitter|linkedin|instagram"
}
```

**Response:**
```json
{
  "success": true,
  "newToken": "new_access_token_here",
  "expiresIn": 5184000
}
```

## 🚀 **Usage Instructions**

### **1. Access Token Monitoring**
1. Navigate to `Admin → System → Auto-Posting`
2. Click on the **"Monitoring"** tab
3. View the overview of all platform token health
4. Use the **"Check All"** button to refresh all token statuses

### **2. Enable Auto-Monitoring**
1. In the Monitoring tab, click **"Start Auto"**
2. The system will check token health every hour
3. You'll receive toast notifications for any issues
4. Click **"Stop Auto"** to disable automatic monitoring

### **3. Refresh Expired Tokens**
1. For any platform showing 🔴 status, click **"Refresh"**
2. The system will attempt to automatically refresh the token
3. If automatic refresh fails, follow the manual refresh guide

### **4. Detailed View**
1. Click on **"Detailed View"** tab for comprehensive information
2. See account details, token expiration dates, and error messages
3. Access platform-specific settings directly from the monitoring panel

## 🔍 **Platform-Specific Monitoring**

### **Facebook Token Monitoring**
- **Checks**: Page Access Token validity and expiration
- **API**: Facebook Graph API `/me` endpoint
- **Refresh**: Automatic using `fb_exchange_token` grant type
- **Expiration**: Long-lived tokens (60 days)

### **Twitter/X Token Monitoring**
- **Checks**: OAuth 1.0a User Context authentication
- **API**: Twitter API v2 `/users/me` endpoint
- **Refresh**: Manual process (tokens don't expire automatically)
- **Authentication**: HMAC-SHA1 signature verification

### **LinkedIn Token Monitoring**
- **Checks**: Access Token validity and permissions
- **API**: LinkedIn API v2 `/me` endpoint
- **Refresh**: Using Refresh Token (60-day lifespan)
- **Permissions**: Validates required scopes

### **Instagram Token Monitoring**
- **Checks**: Access Token validity
- **API**: Instagram Graph API `/me` endpoint
- **Refresh**: Manual process
- **Requirements**: Instagram Basic Display API setup

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Token Expired**
- **Symptom**: 🔴 status with "Token expired" error
- **Solution**: Click **"Refresh"** button or follow manual refresh guide
- **Prevention**: Enable auto-monitoring to catch issues early

#### **Invalid Permissions**
- **Symptom**: 🔴 status with "Insufficient permissions" error
- **Solution**: Regenerate tokens with correct scopes
- **Platform**: Usually LinkedIn or Facebook

#### **API Rate Limits**
- **Symptom**: Temporary failures during monitoring
- **Solution**: Wait and retry, or reduce monitoring frequency
- **Prevention**: Respect platform rate limits

#### **Network Issues**
- **Symptom**: "Failed to check token health" error
- **Solution**: Check internet connection and retry
- **Prevention**: Implement retry logic with exponential backoff

### **Manual Token Refresh Guides**

#### **Facebook Token Refresh**
```bash
# Run the Facebook token manager
node facebook-token-manager.mjs

# Or manually update token
node update-facebook-token.mjs
```

#### **LinkedIn Token Refresh**
```bash
# Get new tokens from OAuth Playground
node manual-linkedin-oauth.mjs

# Or follow the LinkedIn setup guide
node get-linkedin-refresh-token.mjs
```

#### **Twitter Token Refresh**
```bash
# Check current credentials
node check-twitter-credentials.mjs

# Test Twitter functionality
node test-twitter-specific.mjs
```

## 📊 **Monitoring Best Practices**

### **1. Regular Checks**
- Enable auto-monitoring for continuous oversight
- Check token health before major posting campaigns
- Monitor after any credential changes

### **2. Proactive Management**
- Refresh tokens before they expire (7+ days remaining)
- Keep backup tokens for critical platforms
- Document token generation processes

### **3. Error Handling**
- Set up alerts for token failures
- Have fallback posting strategies
- Maintain platform-specific troubleshooting guides

### **4. Security**
- Never expose tokens in logs or error messages
- Use environment variables for sensitive data
- Regularly rotate tokens for security

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Twitter
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Instagram
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
```

### **Database Settings**
The system stores token information in the `settings` collection:
```javascript
{
  category: 'social-media',
  facebookPageAccessToken: 'token_here',
  twitterAccessToken: 'token_here',
  linkedinAccessToken: 'token_here',
  instagramAccessToken: 'token_here'
}
```

## 📈 **Analytics and Reporting**

### **Token Health Metrics**
- Token validity rates by platform
- Average time to token expiration
- Refresh success rates
- Platform-specific error frequencies

### **Monitoring Dashboard**
- Real-time status overview
- Historical token health trends
- Automated alert system
- Performance metrics

## 🎯 **Success Indicators**

### **Healthy System**
- ✅ All configured platforms show 🟢 status
- ✅ Auto-monitoring is enabled and running
- ✅ No critical token errors in logs
- ✅ Successful auto-posting to all platforms

### **Warning Signs**
- 🟡 Any platform showing expiring soon status
- 🟡 High refresh failure rates
- 🟡 Frequent API rate limit errors
- 🟡 Manual intervention required

### **Critical Issues**
- 🔴 Any platform showing invalid/expired status
- 🔴 Auto-posting failures
- 🔴 Token refresh failures
- 🔴 API authentication errors

## 🚀 **Next Steps**

1. **Enable Auto-Monitoring**: Start the automatic token health checking
2. **Configure All Platforms**: Set up remaining platforms (Instagram)
3. **Test Auto-Posting**: Verify all platforms work with unique content
4. **Set Up Alerts**: Configure notifications for token issues
5. **Document Procedures**: Create runbooks for token management

**The Token Monitoring System ensures your social media auto-posting runs smoothly and prevents unexpected failures!** 🎉
