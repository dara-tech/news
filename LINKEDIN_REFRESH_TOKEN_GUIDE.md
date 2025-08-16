# 🔗 How to Find LinkedIn Refresh Token

## 🎯 **Step-by-Step Guide**

### **Step 1: Go to LinkedIn OAuth Playground**

1. **Open your browser** and go to:
   ```
   https://www.linkedin.com/developers/tools/oauth/playground
   ```

2. **Sign in** with your LinkedIn account

### **Step 2: Enter Your App Credentials**

In the OAuth Playground, enter these exact values:

- **Client ID**: `86fluuypixnml0`
- **Client Secret**: `WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==`
- **Redirect URI**: `https://www.linkedin.com/developers/tools/oauth/playground`

### **Step 3: Select Required Scopes**

Check these scopes (permissions):

- ✅ `r_liteprofile` (Read your profile)
- ✅ `w_member_social` (Write posts to your profile)
- ✅ `r_organization_social` (Read organization posts)
- ✅ `w_organization_social` (Write posts to organization)

### **Step 4: Generate Tokens**

1. **Click "Request Token"** button
2. **Authorize the app** when prompted
3. **Copy the tokens** from the response

### **Step 5: Copy Both Tokens**

The response will look like this:
```json
{
  "access_token": "AQWymdJmOcR1DvR9FBM326HtzlUXdb6SO4G8HCdHcT3b3ICsDSbd0CFG3v1YQ-njD7dAKPVd36RhzolLa7tlHh1raQsL4GzFViHotHUUOP0pPX6RVc1dX8R6uA3_bF2sPpfFhI1Q9xX2pkeIT13_dO_6SdmURBvbAZlo5HiUiKbX2RE0N3JfMneItMeKsgAVhHRdoj9khKsjOegHnWIzu2eXnCDdh29xxIUDZzdFWompxpugS6ss9cpx3yEZHLprLSLmqNZlzSKO2QrErJS94Z3rWytrw4nDa1RnLO5jiDL1rw4nPIbztp9udz-UBeTd1wiqqSA1Uw7lhIBBL8Q8uqoVBDAA_g",
  "refresh_token": "AQWymdJmOcR1DvR9FBM326HtzlUXdb6SO4G8HCdHcT3b3ICsDSbd0CFG3v1YQ-njD7dAKPVd36RhzolLa7tlHh1raQsL4GzFViHotHUUOP0pPX6RVc1dX8R6uA3_bF2sPpfFhI1Q9xX2pkeIT13_dO_6SdmURBvbAZlo5HiUiKbX2RE0N3JfMneItMeKsgAVhHRdoj9khKsjOegHnWIzu2eXnCDdh29xxIUDZzdFWompxpugS6ss9cpx3yEZHLprLSLmqNZlzSKO2QrErJS94Z3rWytrw4nDa1RnLO5jiDL1rw4nPIbztp9udz-UBeTd1wiqqSA1Uw7lhIBBL8Q8uqoVBDAA_g",
  "expires_in": 3600
}
```

**Copy both:**
- **Access Token**: The `access_token` value
- **Refresh Token**: The `refresh_token` value

---

## 🔧 **Alternative Method: Manual OAuth Flow**

If the OAuth Playground doesn't work, you can use the manual OAuth flow:

### **Step 1: Create Authorization URL**

Create this URL with your credentials:
```
https://www.linkedin.com/oauth/v2/authorization?
  response_type=code&
  client_id=86fluuypixnml0&
  redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground&
  scope=r_liteprofile%20w_member_social%20r_organization_social%20w_organization_social&
  state=razewire123
```

### **Step 2: Get Authorization Code**

1. **Visit the URL** in your browser
2. **Authorize the app**
3. **Copy the authorization code** from the redirect URL

### **Step 3: Exchange Code for Tokens**

Use this curl command:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE_FROM_STEP_2" \
  -d "client_id=86fluuypixnml0" \
  -d "client_secret=WPL_AP1.FHVFlYybLhz2S5lM.GYNYdA==" \
  -d "redirect_uri=https://www.linkedin.com/developers/tools/oauth/playground"
```

---

## 📱 **Update Your Settings**

Once you have both tokens:

### **Step 1: Go to Admin Panel**
1. **Navigate to**: `Admin → System → Auto-Posting`
2. **Click**: "LinkedIn" tab

### **Step 2: Update Credentials**
- **Access Token**: Paste the new access token
- **Refresh Token**: Paste the new refresh token
- **Organization ID**: Verify it's `108162812`

### **Step 3: Test Connection**
1. **Click**: "Test Connection"
2. **Verify**: Status shows "Connected"

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "No refresh token in response"**
**Solution**: Make sure you selected the correct scopes, especially `w_member_social`

### **Issue 2: "Invalid client credentials"**
**Solution**: Double-check your Client ID and Client Secret

### **Issue 3: "Redirect URI mismatch"**
**Solution**: Use exactly `https://www.linkedin.com/developers/tools/oauth/playground`

### **Issue 4: "Insufficient permissions"**
**Solution**: Ensure you selected all required scopes

---

## 🔍 **Token Types Explained**

| Token Type | Lifespan | Purpose |
|------------|----------|---------|
| **Access Token** | 1 hour | Used for API calls |
| **Refresh Token** | 60 days | Used to get new access tokens |

---

## ✅ **Verification Checklist**

- [ ] OAuth Playground accessed successfully
- [ ] Client ID and Secret entered correctly
- [ ] All required scopes selected
- [ ] Authorization completed
- [ ] Both access token and refresh token copied
- [ ] Tokens updated in admin panel
- [ ] Connection test successful

---

## 🎯 **Expected Results**

After following these steps, you should have:
- ✅ **Valid access token** with correct permissions
- ✅ **Refresh token** for automatic renewal
- ✅ **LinkedIn auto-posting** working correctly
- ✅ **Organization posting** to ID `108162812`

---

## 📞 **Need Help?**

If you're still having trouble:
1. **Check LinkedIn Developer Console** for app settings
2. **Verify app permissions** are correctly configured
3. **Contact LinkedIn support** if app issues persist

**Your LinkedIn auto-posting will work once you have the correct refresh token!** 🚀
