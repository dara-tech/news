# 🧪 Site Features Testing Guide

This guide explains how to test all the site features functionality that has been implemented.

## 🚀 Quick Start

### Prerequisites
1. **Backend Server Running**: Ensure your backend is running on `http://localhost:5001`
2. **Database Connected**: MongoDB should be connected and accessible
3. **Test Users**: Ensure you have test users in your database

### Test Users Setup
Make sure you have these test users in your database:
- **Admin**: `admin@test.com` / `admin123`
- **Regular User**: `user@test.com` / `user123`

## 📋 Test Scripts

### 1. Health Check
```bash
npm run test:health
```
**What it tests:**
- Backend server connectivity
- API endpoints accessibility
- Database connection

### 2. Manual Feature Tests
```bash
npm run test:manual
```
**What it tests:**
- Settings system functionality
- Registration control
- Comments control
- Comment moderation
- Maintenance mode
- Analytics system

### 3. Full Automated Tests
```bash
npm run test:full
```
**What it tests:**
- Complete automated test suite
- All features with detailed reporting
- Success/failure statistics

### 4. All Tests
```bash
npm run test:all
```
**What it tests:**
- Health check + manual tests
- Complete verification of all features

## 🔍 Manual Testing Steps

### 1. Test Settings System
1. **Login as Admin**
   - Go to `/admin/settings/general`
   - Verify you can view current settings

2. **Update Settings**
   - Change any setting value
   - Save and verify the change persists

### 2. Test Registration Control
1. **Disable Registration**
   - Set `allowRegistration: false`
   - Save settings

2. **Try to Register**
   - Go to registration page
   - Should see "Registration is currently disabled" message

3. **Re-enable Registration**
   - Set `allowRegistration: true`
   - Verify registration works again

### 3. Test Comments Control
1. **Disable Comments**
   - Set `commentsEnabled: false`
   - Save settings

2. **Try to Comment**
   - Go to any news article
   - Comment form should be hidden or show "Comments disabled"

3. **Re-enable Comments**
   - Set `commentsEnabled: true`
   - Verify comments work again

### 4. Test Comment Moderation
1. **Enable Moderation**
   - Set `moderationRequired: true`
   - Save settings

2. **Create Comment**
   - Login as regular user
   - Post a comment
   - Should see "Comment submitted for approval"

3. **Moderate Comment**
   - Login as admin
   - Go to `/admin/comments/pending`
   - Approve or reject the comment

### 5. Test Maintenance Mode
1. **Enable Maintenance**
   - Set `maintenanceMode: true`
   - Save settings

2. **Test User Access**
   - Login as regular user
   - Try to access any page
   - Should see maintenance page

3. **Test Admin Access**
   - Login as admin
   - Should still be able to access admin pages

4. **Disable Maintenance**
   - Set `maintenanceMode: false`
   - Verify normal access restored

### 6. Test Analytics
1. **Enable Analytics**
   - Set `analyticsEnabled: true`
   - Save settings

2. **Generate Activity**
   - Browse different pages
   - Create some comments
   - Login/logout

3. **Check Analytics**
   - Login as admin
   - Go to `/admin/analytics`
   - Verify data is being tracked

## 🛠️ API Endpoints to Test

### Settings Management
```bash
# Get settings
GET /api/admin/settings/general

# Update settings
PUT /api/admin/settings/general
{
  "settings": {
    "allowRegistration": false,
    "commentsEnabled": true,
    "moderationRequired": false,
    "analyticsEnabled": true,
    "maintenanceMode": false
  }
}
```

### Registration Control
```bash
# Try to register when disabled
POST /api/auth/register
# Should return 403 if registration is disabled
```

### Comments Control
```bash
# Try to comment when disabled
POST /api/comments/:newsId
# Should return 403 if comments are disabled
```

### Comment Moderation
```bash
# Get pending comments
GET /api/admin/comments/pending

# Approve comment
POST /api/admin/comments/:commentId/approve

# Reject comment
POST /api/admin/comments/:commentId/reject
{
  "reason": "Inappropriate content"
}
```

### Analytics
```bash
# Get analytics summary
GET /api/admin/analytics/summary

# Get full analytics data
GET /api/admin/analytics
```

## 🔧 Troubleshooting

### Common Issues

1. **Backend Not Running**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   ```

2. **Database Connection Issues**
   - Check MongoDB connection string
   - Ensure database is running
   - Verify network connectivity

3. **Authentication Issues**
   - Ensure test users exist in database
   - Check JWT token configuration
   - Verify admin role permissions

4. **Settings Not Persisting**
   - Check database connection
   - Verify settings model is working
   - Clear browser cache

### Debug Commands

```bash
# Check backend health
curl http://localhost:5001/health

# Test database connection
curl http://localhost:5001/api/admin/settings/general

# Check server logs
tail -f backend/logs/server.log
```

## 📊 Expected Test Results

### Successful Test Run
```
🚀 Starting Manual Site Features Tests
=====================================

=== Testing Settings System ===
✅ Admin login successful
✅ Current settings retrieved

=== Testing Registration Control ===
✅ Registration disabled
✅ Registration correctly blocked when disabled
✅ Registration re-enabled

=== Testing Comments Control ===
✅ User login successful
✅ Comments disabled
✅ Comments correctly blocked when disabled
✅ Comments re-enabled

=== Testing Comment Moderation ===
✅ Moderation enabled
✅ Comment submitted for moderation
✅ Found 1 pending comments

=== Testing Maintenance Mode ===
✅ Maintenance mode enabled
✅ User correctly blocked during maintenance
✅ Admin can access during maintenance
✅ Maintenance mode disabled

=== Testing Analytics ===
✅ Analytics data retrieved

🎉 Manual tests completed!
```

## 🎯 Feature Verification Checklist

- [ ] **Settings System**: Can view and update settings
- [ ] **Registration Control**: Can disable/enable user registration
- [ ] **Comments Control**: Can disable/enable comments
- [ ] **Comment Moderation**: Can require approval for comments
- [ ] **Maintenance Mode**: Can put site in maintenance mode
- [ ] **Analytics**: Can track and view site analytics
- [ ] **Admin Access**: Admins can access during maintenance
- [ ] **User Restrictions**: Users are blocked appropriately
- [ ] **Real-time Updates**: Changes take effect immediately
- [ ] **Error Handling**: Proper error messages displayed

## 🚨 Important Notes

1. **Test Users**: Always use dedicated test users, not production accounts
2. **Database**: Tests may create/modify data - use test database if possible
3. **Caching**: Settings are cached for 5 minutes - wait for cache to clear
4. **WebSocket**: Real-time features require WebSocket connection
5. **Security**: All admin endpoints require authentication and admin role

## 📝 Test Data Cleanup

After testing, you may want to clean up test data:

```bash
# Remove test comments
# Remove test users (if created)
# Reset settings to defaults
```

This ensures your test environment stays clean for future testing. 