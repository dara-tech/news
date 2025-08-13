# 📱 Telegram Open Graph Fix Guide

## 🚨 Current Issue

Telegram's Open Graph preview is not working properly when sharing `https://www.razewire.online/` links.

## ✅ Fixes Applied

### **1. Updated Open Graph Configuration** (`frontend/src/app/layout.tsx`)

#### **Fixed Issues:**
- ✅ **Absolute URLs**: Changed from relative to absolute image URLs
- ✅ **Proper Image Format**: Using SVG for better compatibility
- ✅ **Complete Meta Tags**: Added all required Open Graph properties
- ✅ **Telegram-Specific**: Optimized for Telegram's requirements

#### **Updated Configuration:**
```typescript
openGraph: {
  title: 'Razewire - Your Daily Source of News',
  description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
  url: 'https://www.razewire.online',
  siteName: 'Razewire',
  images: [
    {
      url: 'https://www.razewire.online/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Razewire - Your Daily Source of News',
      type: 'image/svg+xml',
    },
  ],
  locale: 'en_US',
  type: 'website',
  countryName: 'Cambodia',
},
```

### **2. Created Open Graph Image** (`frontend/public/og-image.svg`)

#### **Features:**
- ✅ **Optimal Dimensions**: 1200x630 (perfect for social media)
- ✅ **Professional Design**: Clean, modern layout
- ✅ **Brand Consistency**: Matches Razewire branding
- ✅ **Scalable**: SVG format works on all devices
- ✅ **Fast Loading**: Lightweight and efficient

### **3. Updated Twitter Cards**

#### **Consistent Configuration:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Razewire - Your Daily Source of News',
  description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
  images: ['https://www.razewire.online/og-image.svg'],
  site: '@razewire',
  creator: '@razewire',
},
```

## 🔍 Telegram Open Graph Requirements

### **Essential Meta Tags:**
```html
<meta property="og:title" content="Razewire - Your Daily Source of News" />
<meta property="og:description" content="Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead." />
<meta property="og:image" content="https://www.razewire.online/og-image.svg" />
<meta property="og:url" content="https://www.razewire.online" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Razewire" />
```

### **Image Requirements:**
- ✅ **Absolute URL**: Must be full URL, not relative
- ✅ **Optimal Size**: 1200x630 pixels
- ✅ **Fast Loading**: Under 1MB recommended
- ✅ **Accessible**: No authentication required
- ✅ **Proper Format**: SVG, PNG, or JPEG

## 🧪 Testing the Fix

### **Test Script:**
```bash
# Run Open Graph test
node test-opengraph.mjs
```

### **Manual Testing:**
```bash
# Check Open Graph tags
curl https://www.razewire.online/ | grep -i "og:"

# Test image accessibility
curl -I https://www.razewire.online/og-image.svg
```

### **Social Media Testing:**
1. **Telegram**: Share `https://www.razewire.online/` in a chat
2. **Facebook**: Share the URL on Facebook
3. **Twitter**: Share the URL on Twitter
4. **LinkedIn**: Share the URL on LinkedIn

## 🚀 Deployment Steps

### **1. Deploy Changes**
```bash
git add .
git commit -m "Fix Telegram Open Graph preview"
git push
```

### **2. Wait for Deployment**
- Wait for your hosting platform to deploy
- Verify the new image is accessible
- Check that meta tags are updated

### **3. Test in Telegram**
1. Open Telegram
2. Share `https://www.razewire.online/` in any chat
3. Verify the preview shows correctly

## 🔧 Troubleshooting

### **Issue 1: No Preview Shows**
**Causes:**
- Image URL is relative instead of absolute
- Image is not accessible (404 error)
- Meta tags are missing or incorrect

**Solutions:**
1. Check image URL is absolute: `https://www.razewire.online/og-image.svg`
2. Verify image is accessible: `curl -I https://www.razewire.online/og-image.svg`
3. Check meta tags are present in HTML

### **Issue 2: Wrong Preview Content**
**Causes:**
- Meta tags have wrong content
- Cached preview from previous version

**Solutions:**
1. Verify meta tag content is correct
2. Clear Telegram's cache by sharing a different URL first
3. Use Facebook Debugger to refresh cache

### **Issue 3: Image Not Loading**
**Causes:**
- Image file doesn't exist
- Wrong file path
- Server error

**Solutions:**
1. Check file exists: `frontend/public/og-image.svg`
2. Verify deployment completed
3. Test image URL directly in browser

## 📊 Expected Results

### **Successful Telegram Preview:**
- ✅ **Title**: "Razewire - Your Daily Source of News"
- ✅ **Description**: "Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead."
- ✅ **Image**: Professional Razewire branding image
- ✅ **URL**: `https://www.razewire.online`
- ✅ **Site Name**: "Razewire"

### **Preview Layout:**
```
┌─────────────────────────────────────┐
│ [Razewire Logo Image]               │
│                                     │
│ Razewire - Your Daily Source of News│
│ Your daily source for the latest... │
│                                     │
│ www.razewire.online                 │
└─────────────────────────────────────┘
```

## 🎯 Additional Optimizations

### **For Better Performance:**
1. **Image Optimization**: SVG is already optimized
2. **Caching**: Set proper cache headers
3. **CDN**: Use CDN for faster image delivery

### **For Better SEO:**
1. **Structured Data**: Add JSON-LD schema
2. **Meta Tags**: Include additional meta tags
3. **Social Media**: Optimize for all platforms

## 🆘 Emergency Fixes

### **If Open Graph Still Doesn't Work:**

#### **Option 1: Use Facebook Debugger**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://www.razewire.online/`
3. Click "Debug"
4. Click "Scrape Again" to refresh cache

#### **Option 2: Force Cache Refresh**
1. Add a query parameter: `https://www.razewire.online/?v=2`
2. Share this URL in Telegram
3. This forces Telegram to fetch fresh preview

#### **Option 3: Check Server Logs**
1. Check hosting platform logs
2. Look for 404 errors on image requests
3. Verify server is serving files correctly

## 📞 Support Checklist

### **Before Reporting Issues:**
- [ ] Site is deployed and accessible
- [ ] Image file exists and is accessible
- [ ] Meta tags are present in HTML
- [ ] Tested with Facebook Debugger
- [ ] Cleared Telegram cache
- [ ] Checked server logs

### **Information to Provide:**
- URL being shared: `https://www.razewire.online/`
- Expected preview vs actual preview
- Error messages (if any)
- Steps to reproduce the issue

## 🎉 Success Verification

Once the fix is working:
1. **Test in Telegram**: Share URL in different chats
2. **Test in Other Platforms**: Facebook, Twitter, LinkedIn
3. **Monitor Performance**: Check image loading speed
4. **Update Documentation**: Note any platform-specific issues

The Open Graph configuration is now optimized for Telegram and should display beautiful previews when sharing your site! 🚀
