# 🔗 LinkedIn Auto-Posting Setup Guide

## 📋 **Prerequisites**

Before setting up LinkedIn auto-posting, you need:

1. **LinkedIn Account**: A personal or business LinkedIn account
2. **LinkedIn Developer Account**: Access to LinkedIn's developer platform
3. **Organization Access**: If posting to a company page, you need admin access
4. **Marketing Developer Platform Access**: Special permission required for posting

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create LinkedIn App**

1. **Go to LinkedIn Developers**
   - Visit: https://www.linkedin.com/developers/
   - Sign in with your LinkedIn account

2. **Create New App**
   - Click "Create App"
   - Fill in the required information:
     - **App Name**: `RazeWire Auto-Posting`
     - **LinkedIn Page**: Your company page URL
     - **App Logo**: Upload your logo
     - **Legal Agreement**: Accept terms

3. **Get App Credentials**
   - Note down your **Client ID** and **Client Secret**
   - These will be used in your auto-posting configuration

### **Step 2: Configure OAuth 2.0 Settings**

1. **Add Redirect URLs**
   - Go to "Auth" tab in your app
   - Add redirect URL: `https://yourdomain.com/admin/auto-posting`
   - For development: `http://localhost:3000/admin/auto-posting`

2. **Request Permissions**
   - Request access to "Marketing Developer Platform"
   - This is required for posting content
   - LinkedIn will review your request (can take 1-2 weeks)

### **Step 3: Get Access Token**

1. **Generate Access Token**
   - Use LinkedIn's OAuth 2.0 flow
   - Required scopes:
     - `r_liteprofile` (read profile)
     - `w_member_social` (write posts)
     - `r_organization_social` (read company posts)
     - `w_organization_social` (write company posts)

2. **Token Types**
   - **Access Token**: Short-lived (1 hour)
   - **Refresh Token**: Long-lived (60 days)
   - Store both tokens securely

### **Step 4: Get Organization ID**

1. **For Company Pages**
   - Go to your company page on LinkedIn
   - The Organization ID is in the URL: `linkedin.com/company/[organization-id]`
   - Or use LinkedIn API to get it programmatically

2. **For Personal Profile**
   - Use your LinkedIn profile ID
   - Can be found in your profile URL

---

## ⚙️ **Configuration in RazeWire**

### **1. Access Auto-Posting Settings**
- Go to: `Admin → System → Auto-Posting`
- Click on the "LinkedIn" tab

### **2. Enter Credentials**
- **Client ID**: Your LinkedIn app client ID
- **Client Secret**: Your LinkedIn app client secret
- **Access Token**: Your LinkedIn access token
- **Refresh Token**: Your LinkedIn refresh token
- **Organization ID**: Your company page ID (if posting to company page)

### **3. Test Connection**
- Click "Test Connection" to verify your credentials
- If successful, status will show "Connected"

### **4. Enable Auto-Posting**
- Toggle "Enable LinkedIn Auto-Posting" to ON
- Save your settings

---

## 🔧 **API Endpoints Used**

LinkedIn uses these endpoints for auto-posting:

### **Personal Profile Posts**
```
POST https://api.linkedin.com/v2/ugcPosts
```

### **Company Page Posts**
```
POST https://api.linkedin.com/v2/organizations/{organizationId}/ugcPosts
```

### **Content Format**
```json
{
  "author": "urn:li:person:{personId}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Your post content here"
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

---

## 🚨 **Important Notes**

### **Rate Limits**
- **Personal Profile**: 25 posts per day
- **Company Page**: 50 posts per day
- **API Calls**: 100 requests per day per app

### **Content Restrictions**
- **Text Length**: 3,000 characters maximum
- **Media**: Images, videos, articles supported
- **Links**: Must be whitelisted domains
- **Hashtags**: Up to 30 hashtags per post

### **Token Management**
- **Access Tokens**: Expire after 1 hour
- **Refresh Tokens**: Expire after 60 days
- **Auto-Refresh**: Implement token refresh logic
- **Security**: Store tokens securely, never expose in client-side code

---

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Invalid Access Token"**
   - Token has expired
   - Refresh your access token
   - Check token permissions

2. **"Insufficient Permissions"**
   - Request Marketing Developer Platform access
   - Ensure correct OAuth scopes
   - Contact LinkedIn support

3. **"Organization Not Found"**
   - Verify Organization ID is correct
   - Ensure you have admin access to the page
   - Check if page is public

4. **"Rate Limit Exceeded"**
   - Reduce posting frequency
   - Implement rate limiting
   - Monitor API usage

### **Error Codes**
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error (LinkedIn issue)

---

## 📞 **Support Resources**

### **LinkedIn Developer Documentation**
- **API Reference**: https://developer.linkedin.com/docs
- **OAuth 2.0 Guide**: https://developer.linkedin.com/docs/oauth2
- **Marketing API**: https://developer.linkedin.com/docs/marketing-api

### **Community Support**
- **LinkedIn Developer Forum**: https://developer.linkedin.com/community
- **Stack Overflow**: Tagged with `linkedin-api`
- **GitHub**: LinkedIn API libraries and examples

### **Contact LinkedIn**
- **Developer Support**: https://developer.linkedin.com/support
- **Marketing API Support**: For business-specific issues

---

## ✅ **Success Checklist**

- [ ] LinkedIn Developer account created
- [ ] App created with correct permissions
- [ ] OAuth 2.0 redirect URLs configured
- [ ] Marketing Developer Platform access granted
- [ ] Access token and refresh token obtained
- [ ] Organization ID identified (if posting to company page)
- [ ] Credentials entered in RazeWire admin panel
- [ ] Connection test successful
- [ ] Auto-posting enabled
- [ ] Test post sent successfully

---

## 🎯 **Best Practices**

1. **Content Strategy**
   - Post during peak engagement hours (9 AM - 5 PM)
   - Use relevant hashtags (up to 30)
   - Include call-to-action in posts
   - Mix content types (text, images, articles)

2. **Technical Implementation**
   - Implement token refresh logic
   - Handle rate limits gracefully
   - Monitor API usage and errors
   - Store credentials securely

3. **Compliance**
   - Follow LinkedIn's content policies
   - Respect user privacy and data protection
   - Comply with GDPR and other regulations
   - Monitor for policy violations

---

**🎉 Once completed, your RazeWire platform will automatically post to LinkedIn!**



