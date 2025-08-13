# 🔧 CORS Troubleshooting Guide for Razewire

## 🚨 Current Issue

You're experiencing CORS (Cross-Origin Resource Sharing) errors when your frontend at `https://www.razewire.online` tries to access your backend at `https://news-vzdx.onrender.com`.

### **Error Details:**
```
Preflight response is not successful. Status code: 500
XMLHttpRequest cannot load https://news-vzdx.onrender.com/api/categories?lang=en due to access control checks.
```

## ✅ Fixes Applied

### 1. **Updated CORS Configuration** (`backend/server.mjs`)

#### **Added Your Domain:**
```javascript
const allowedOrigins = [
  // ... existing origins ...
  'https://www.razewire.online',    // Your new production domain
  /^https?:\/\/.*\.razewire\.online$/, // All Razewire subdomains
];
```

#### **Enhanced Logging:**
- Added detailed CORS logging for debugging
- Shows which origins are being checked
- Displays allowed origins when errors occur

### 2. **Environment Variables**

#### **Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://news-vzdx.onrender.com
NEXT_PUBLIC_SITE_URL=https://www.razewire.online
```

#### **Backend (.env):**
```bash
NODE_ENV=production
CORS_ORIGINS=https://www.razewire.online,http://localhost:3000
```

## 🔍 Troubleshooting Steps

### **Step 1: Verify Backend Deployment**
```bash
# Check if backend is running
curl https://news-vzdx.onrender.com/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"production"}
```

### **Step 2: Test CORS Preflight**
```bash
# Test OPTIONS request
curl -X OPTIONS https://news-vzdx.onrender.com/api/categories \
  -H "Origin: https://www.razewire.online" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

### **Step 3: Check Environment Variables**
```bash
# Frontend
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_SITE_URL

# Backend
echo $NODE_ENV
echo $CORS_ORIGINS
```

## 🛠️ Manual Fixes

### **If CORS Still Fails:**

#### **Option 1: Update Backend Environment Variables**
1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to Environment variables
4. Add/update:
   ```
   NODE_ENV=production
   CORS_ORIGINS=https://www.razewire.online,http://localhost:3000
   ```

#### **Option 2: Restart Backend Service**
1. Go to Render dashboard
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"

#### **Option 3: Check Backend Logs**
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for CORS-related errors

## 🔧 Advanced CORS Configuration

### **Current CORS Settings:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Enhanced logging for debugging
    console.log(`CORS: Checking origin: ${origin}`);
    
    // Check against allowed origins
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return pattern === origin;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    });

    if (!isAllowed) {
      console.error(`CORS: Origin ${origin} not allowed`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    }
    
    console.log(`CORS: Origin ${origin} allowed`);
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Cache-Control', 'Pragma'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400
};
```

### **Allowed Origins:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.razewire.online',    // Your new domain
  'https://news-eta-vert.vercel.app',
  'https://news-vzdx.onrender.com', 
  'https://newslys.netlify.app',
  /^http:\/\/localhost(:\d+)?$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/.*\.vercel\.app$/,
  /^https?:\/\/.*\.onrender\.com$/,
  /^https?:\/\/.*\.dara\.tech$/,
  /^https?:\/\/.*\.razewire\.online$/, // All Razewire subdomains
];
```

## 🧪 Testing Tools

### **CORS Test Script:**
```bash
# Run the CORS test
node test-cors-fix.mjs
```

### **Manual Browser Test:**
1. Open browser developer tools
2. Go to Network tab
3. Visit your frontend site
4. Look for failed requests (red)
5. Check the CORS headers in the response

## 🚀 Deployment Checklist

### **Before Deployment:**
- [ ] Update CORS configuration in backend
- [ ] Set environment variables
- [ ] Test CORS locally
- [ ] Verify backend health endpoint

### **After Deployment:**
- [ ] Restart backend service
- [ ] Test CORS from production domain
- [ ] Check backend logs for CORS errors
- [ ] Verify all API endpoints work

## 📊 Common CORS Issues

### **Issue 1: 500 Status on Preflight**
**Cause:** Backend error during CORS check
**Solution:** Check backend logs, restart service

### **Issue 2: Origin Not Allowed**
**Cause:** Domain not in allowed origins
**Solution:** Add domain to CORS configuration

### **Issue 3: Missing Headers**
**Cause:** CORS headers not being sent
**Solution:** Verify CORS middleware is applied

### **Issue 4: Credentials Issues**
**Cause:** `withCredentials` mismatch
**Solution:** Ensure both frontend and backend have `credentials: true`

## 🔍 Debugging Commands

### **Check Backend Status:**
```bash
curl -I https://news-vzdx.onrender.com/health
```

### **Test CORS Headers:**
```bash
curl -H "Origin: https://www.razewire.online" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://news-vzdx.onrender.com/api/categories
```

### **Check Environment:**
```bash
# Frontend
echo "API URL: $NEXT_PUBLIC_API_URL"
echo "Site URL: $NEXT_PUBLIC_SITE_URL"

# Backend
curl https://news-vzdx.onrender.com/health
```

## 🎯 Expected Results

### **After Fix:**
- ✅ No CORS errors in browser console
- ✅ API calls work from `https://www.razewire.online`
- ✅ Preflight requests return 200 status
- ✅ All API endpoints accessible

### **CORS Headers Expected:**
```
Access-Control-Allow-Origin: https://www.razewire.online
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Cache-Control, Pragma
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## 🆘 If Still Not Working

### **Emergency Fix:**
1. **Temporarily allow all origins** (for testing only):
```javascript
const corsOptions = {
  origin: true, // Allow all origins temporarily
  credentials: true,
  // ... other options
};
```

2. **Check if it's a backend issue:**
```bash
curl https://news-vzdx.onrender.com/api/categories?lang=en
```

3. **Verify frontend configuration:**
```javascript
// In frontend/src/lib/api.ts
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

## 📞 Support

If CORS issues persist:
1. Check backend logs in Render dashboard
2. Verify environment variables are set correctly
3. Test with the provided CORS test script
4. Check if backend is responding to health checks

The CORS configuration has been updated to include your new domain. Deploy the backend changes and the issue should be resolved! 🚀
