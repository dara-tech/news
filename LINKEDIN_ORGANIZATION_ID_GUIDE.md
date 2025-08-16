# 🔍 How to Find Your LinkedIn Organization ID

## 📋 **What is Organization ID?**

The LinkedIn Organization ID is a unique numeric identifier for your company page. It's required when you want to post content to your company page instead of your personal profile.

---

## 🎯 **Method 1: From Company Page URL (Easiest)**

### **Step-by-Step Instructions:**

1. **Go to your company page on LinkedIn**
   - Log into LinkedIn
   - Search for your company name
   - Click on your company page

2. **Look at the URL in your browser**
   - The URL will look like: `https://www.linkedin.com/company/company-name-123456789/`
   - Or: `https://www.linkedin.com/company/123456789/`

3. **Find the Organization ID**
   - **If URL has numbers**: `linkedin.com/company/123456789/` → Organization ID is `123456789`
   - **If URL has name + numbers**: `linkedin.com/company/company-name-123456789/` → Organization ID is `123456789`

### **Examples:**
```
✅ Correct URLs:
- https://www.linkedin.com/company/microsoft/ → Look for numbers in the page
- https://www.linkedin.com/company/1035/ → Organization ID: 1035
- https://www.linkedin.com/company/razewire-123456789/ → Organization ID: 123456789

❌ Don't use:
- https://www.linkedin.com/company/razewire/ (no numbers)
- https://www.linkedin.com/in/username/ (personal profile)
```

---

## 🔧 **Method 2: Using LinkedIn API (Advanced)**

If you can't find the ID in the URL, you can use the LinkedIn API:

### **Step 1: Get Access Token**
1. Go to: https://www.linkedin.com/developers/
2. Select your app
3. Go to "Auth" tab
4. Generate an access token with `r_organization_social` scope

### **Step 2: Make API Call**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR"
```

### **Step 3: Parse Response**
The response will contain your organization IDs:
```json
{
  "elements": [
    {
      "organizationalTarget": "urn:li:organization:123456789",
      "role": "ADMINISTRATOR"
    }
  ]
}
```
Organization ID: `123456789`

---

## 🏢 **Method 3: From Company Page Admin Panel**

### **Step-by-Step Instructions:**

1. **Go to your company page**
2. **Click "Admin tools"** (if you're an admin)
3. **Look for "Company page" or "Page info"**
4. **Find the page ID or organization ID**

---

## 🧑‍💼 **Method 4: For Personal Profile Only**

If you want to post to your **personal profile** instead of a company page:

1. **Leave Organization ID empty** in the admin panel
2. **Or use your personal profile ID**:
   - Go to your profile: `linkedin.com/in/your-username/`
   - Your profile ID is usually in the page source or API responses

---

## ✅ **How to Use in RazeWire Admin Panel**

### **Step 1: Access LinkedIn Settings**
1. Go to: **Admin → Auto-Posting → LinkedIn tab**
2. You'll see the Organization ID field

### **Step 2: Enter the ID**
- **For Company Page**: Enter the numeric ID (e.g., `123456789`)
- **For Personal Profile**: Leave empty or enter your profile ID

### **Step 3: Test Connection**
1. Click **"Test Connection"**
2. If successful, you'll see "Connected" status

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Organization not found"**
- **Solution**: Make sure you're an admin of the company page
- **Check**: Go to company page → Admin tools → Verify admin access

### **Issue 2: "No numbers in URL"**
- **Solution**: The company page might use a custom URL
- **Alternative**: Use Method 2 (API) or Method 3 (Admin panel)

### **Issue 3: "Multiple organizations"**
- **Solution**: If you're admin of multiple pages, choose the one you want to post to
- **Note**: You can only post to one organization at a time

### **Issue 4: "Personal profile posting"**
- **Solution**: Leave Organization ID empty for personal profile posting
- **Note**: Personal profiles have different rate limits (25 posts/day vs 50 for company pages)

---

## 📊 **Organization ID Examples**

| Company | URL Example | Organization ID |
|---------|-------------|-----------------|
| Microsoft | `linkedin.com/company/microsoft/` | `1035` |
| Apple | `linkedin.com/company/apple/` | `162479` |
| Google | `linkedin.com/company/google/` | `1441` |
| Your Company | `linkedin.com/company/your-company-123456789/` | `123456789` |

---

## 🔍 **Quick Checklist**

- [ ] I found my company page on LinkedIn
- [ ] I can see numbers in the URL or page info
- [ ] I'm an admin of the company page
- [ ] I have the correct numeric Organization ID
- [ ] I've entered it in the RazeWire admin panel
- [ ] I've tested the connection successfully

---

## 💡 **Pro Tips**

1. **Bookmark your company page URL** for easy access
2. **Save the Organization ID** in a secure note
3. **Test with a small post first** before enabling auto-posting
4. **Check admin permissions** if you get access errors
5. **Use personal profile** if you don't have company page admin access

---

## 🆘 **Still Can't Find It?**

If you're still having trouble finding your Organization ID:

1. **Check if you're an admin** of the company page
2. **Ask your company's LinkedIn admin** for the Organization ID
3. **Use the LinkedIn API method** (Method 2) with your access token
4. **Contact LinkedIn support** if you're the page owner but can't find the ID

**Remember**: You need admin access to the company page to post content via API!
