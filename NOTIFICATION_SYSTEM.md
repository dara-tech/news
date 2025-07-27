# Notification System for Newsly

A comprehensive notification system that automatically creates notifications when news articles are published, with support for different notification types, real-time updates, and user management.

## Features

### Backend Features
- **Automatic Notification Creation**: Notifications are automatically created when news articles are published
- **Multiple Notification Types**: 
  - `breaking_news`: For breaking news articles
  - `news_published`: For regular published articles
  - `news_updated`: For updated articles
  - `system`: For system notifications
- **Multilingual Support**: Notifications support both English and Khmer languages
- **User Management**: Notifications are sent to all users except the author
- **Expiration Support**: Breaking news notifications can expire after 24 hours
- **Real-time Updates**: Polling system for checking new notifications

### Frontend Features
- **Notification Dropdown**: Desktop dropdown with notification list
- **Mobile Notifications**: Mobile-friendly sheet interface
- **Notification Badge**: Real-time unread count display
- **Notification Page**: Full notification management page
- **Bulk Actions**: Select and manage multiple notifications
- **Search & Filter**: Search notifications and filter by read status
- **Real-time Updates**: Automatic polling for new notifications

## Architecture

### Backend Components

#### Models
- `Notification.mjs`: MongoDB schema for notifications
- Indexes for performance optimization
- Virtual fields for formatted dates and time ago

#### Controllers
- `notificationController.mjs`: Handles all notification CRUD operations
- Automatic notification creation in `newsController.mjs`
- Support for different notification types and user targeting

#### Routes
- `notifications.mjs`: API routes for notification management
- Protected routes with authentication
- Admin routes for creating notifications

### Frontend Components

#### Context
- `NotificationContext.tsx`: Global notification state management
- Real-time polling for new notifications
- Optimistic updates for better UX

#### Components
- `NotificationDropdown.tsx`: Desktop notification dropdown
- `MobileNotificationDropdown.tsx`: Mobile notification interface
- `NotificationsPageClient.tsx`: Full notification management page

#### Types
- `notification.ts`: TypeScript interfaces for notifications
- Support for all notification types and data structures

## API Endpoints

### User Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin Endpoints
- `POST /api/notifications/create` - Create custom notification
- `POST /api/notifications/news` - Create news notification

## Usage

### Automatic Notifications
When a news article is published, the system automatically:
1. Checks if the article is being published for the first time
2. Gets all users except the author
3. Creates notifications based on article type (breaking news vs regular)
4. Includes article data and action URLs

### Manual Notification Creation
```javascript
// Create a breaking news notification
await api.post('/api/notifications/news', {
  newsId: 'news_id',
  type: 'breaking_news'
});
```

### Frontend Integration
```javascript
// Use notification context
const { notifications, unreadCount, markAsRead } = useNotifications();

// Mark notification as read
await markAsRead(notificationId);

// Get unread count
console.log(`You have ${unreadCount} unread notifications`);
```

## Testing

### Create Test Notifications
```bash
cd backend
node test-notifications.mjs
```

This will create sample notifications for testing the system.

### Test Scenarios
1. **Publish News**: Create a news article and publish it to trigger notifications
2. **Breaking News**: Mark an article as breaking news for special notifications
3. **User Interaction**: Test marking notifications as read, deleting, etc.
4. **Mobile Testing**: Test notifications on mobile devices

## Configuration

### Environment Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: For authentication
- `NODE_ENV`: Environment configuration

### Polling Configuration
- Default polling interval: 30 seconds
- Configurable in `NotificationContext.tsx`

## Performance Considerations

### Backend
- Database indexes for fast queries
- Efficient notification creation with bulk operations
- Expiration support for old notifications

### Frontend
- Optimistic updates for better UX
- Efficient polling with cleanup
- Lazy loading for notification lists

## Security

- All notification routes are protected with authentication
- Users can only access their own notifications
- Admin routes require admin privileges
- Input validation and sanitization

## Future Enhancements

### Planned Features
- **Push Notifications**: Browser push notifications
- **Email Notifications**: Email integration
- **Notification Preferences**: User notification settings
- **Real-time WebSockets**: WebSocket support for instant updates
- **Notification Templates**: Customizable notification templates
- **Analytics**: Notification engagement tracking

### Technical Improvements
- **Caching**: Redis caching for better performance
- **Queue System**: Background job processing
- **Rate Limiting**: Prevent notification spam
- **Advanced Filtering**: More sophisticated notification filtering

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check if user is authenticated
   - Verify notification context is properly wrapped
   - Check browser console for errors

2. **Real-time updates not working**
   - Verify polling is enabled
   - Check network connectivity
   - Review notification context setup

3. **Performance issues**
   - Check database indexes
   - Review polling frequency
   - Monitor notification count

### Debug Commands
```bash
# Check notification count
curl -H "Authorization: Bearer TOKEN" http://localhost:5001/api/notifications/count

# Get user notifications
curl -H "Authorization: Bearer TOKEN" http://localhost:5001/api/notifications

# Create test notifications
node backend/test-notifications.mjs
```

## Contributing

When adding new notification features:
1. Update the notification model if needed
2. Add new notification types to the enum
3. Update frontend components for new types
4. Add appropriate tests
5. Update documentation

## License

This notification system is part of the Newsly project and follows the same license terms. 