# Follow System Implementation

This document describes the follow system implementation for the news platform.

## Overview

The follow system allows users to follow other users, creating a social network aspect to the platform. When a user follows another user, they can receive notifications about new content and stay updated with the followed user's activities.

## Backend Implementation

### Models

#### Follow Model (`backend/models/Follow.mjs`)
- **follower**: Reference to the user who is following (ObjectId)
- **following**: Reference to the user being followed (ObjectId)
- **createdAt**: Timestamp when the follow relationship was created
- **Indexes**: Compound index on (follower, following) to ensure uniqueness
- **Validation**: Prevents self-following

#### User Model Updates (`backend/models/User.mjs`)
Added virtual fields for follow relationships:
- **followersCount**: Virtual field for counting followers
- **followingCount**: Virtual field for counting following
- **followers**: Virtual field for getting followers list
- **following**: Virtual field for getting following list

### Controllers

#### Follow Controller (`backend/controllers/followController.mjs`)
Provides the following endpoints:

- `POST /api/follows/:userId` - Follow a user
- `DELETE /api/follows/:userId` - Unfollow a user
- `POST /api/follows/:userId/toggle` - Toggle follow status
- `GET /api/follows/:userId/check` - Check if current user is following
- `GET /api/follows/:userId/followers/count` - Get followers count (public)
- `GET /api/follows/:userId/following/count` - Get following count (public)
- `GET /api/follows/:userId/followers` - Get followers list (public)
- `GET /api/follows/:userId/following` - Get following list (public)

### Routes

#### Follow Routes (`backend/routes/follows.mjs`)
- Public endpoints: followers count, following count, followers list, following list
- Protected endpoints: follow, unfollow, toggle, check status

## Frontend Implementation

### API Utilities

#### Follow API (`frontend/src/lib/followApi.ts`)
Provides TypeScript interfaces and functions for all follow-related API calls:
- `followUser(userId)`
- `unfollowUser(userId)`
- `toggleFollow(userId)`
- `checkFollowStatus(userId)`
- `getFollowersCount(userId)`
- `getFollowingCount(userId)`
- `getFollowers(userId, page, limit)`
- `getFollowing(userId, page, limit)`

### Custom Hook

#### Use Follow Hook (`frontend/src/hooks/useFollow.ts`)
Provides a React hook for managing follow state:
- `isFollowing`: Boolean indicating if user is following
- `isLoading`: Boolean indicating if request is in progress
- `toggleFollowStatus()`: Function to toggle follow status
- `checkStatus()`: Function to check current follow status

### Components

#### Follow Button (`frontend/src/components/common/FollowButton.tsx`)
Reusable component for follow/unfollow functionality:
- Automatically handles authentication checks
- Prevents self-following
- Shows loading states
- Provides success/error feedback via toast notifications
- Supports customization via props

#### Follow Stats (`frontend/src/components/common/FollowStats.tsx`)
Component to display followers and following counts:
- Fetches and displays real-time follow statistics
- Shows loading states
- Handles errors gracefully

## Features

### Core Functionality
- ✅ Follow/unfollow users
- ✅ Toggle follow status
- ✅ Check follow status
- ✅ Get followers count
- ✅ Get following count
- ✅ Get followers list
- ✅ Get following list

### User Experience
- ✅ Real-time UI updates
- ✅ Loading states
- ✅ Success/error notifications
- ✅ Authentication checks
- ✅ Self-follow prevention
- ✅ Responsive design

### Notifications
- ✅ Automatic notification creation when following
- ✅ Notification includes follower details
- ✅ Notification type: 'follow'

### Security
- ✅ Authentication required for follow actions
- ✅ Public endpoints for read-only operations
- ✅ Input validation
- ✅ Error handling

## Usage Examples

### Basic Follow Button
```tsx
import FollowButton from '@/components/common/FollowButton';

<FollowButton userId="user123" />
```

### Follow Stats
```tsx
import FollowStats from '@/components/common/FollowStats';

<FollowStats userId="user123" />
```

### Custom Hook
```tsx
import { useFollow } from '@/hooks/useFollow';

const { isFollowing, isLoading, toggleFollowStatus } = useFollow({
  userId: 'user123',
  initialFollowing: false
});
```

## Testing

### Backend Testing
Run the backend server and test endpoints:
```bash
cd backend
npm run dev
```

### Frontend Testing
Visit the test page to test the follow functionality:
```
http://localhost:3000/en/test-follow
```

## Future Enhancements

- [ ] Follow suggestions
- [ ] Follow feed
- [ ] Follow notifications preferences
- [ ] Follow analytics
- [ ] Follow export/import
- [ ] Follow privacy settings 