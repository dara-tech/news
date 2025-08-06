'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FollowButton from '@/components/common/FollowButton';
import FollowStats from '@/components/common/FollowStats';
import FollowList from '@/components/common/FollowList';
import { useAuth } from '@/context/AuthContext';

export default function TestFollowPage() {
  const { user } = useAuth();
  const [testUserId] = useState('507f1f77bcf86cd799439011'); // Mock user ID

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Follow Functionality Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the follow/unfollow functionality with the components below.
          </p>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {user._id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
            ) : (
              <p className="text-gray-500">Not logged in</p>
            )}
          </CardContent>
        </Card>

        {/* Test User */}
        <Card>
          <CardHeader>
            <CardTitle>Test User (ID: {testUserId})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Experienced content creator and storyteller
                </p>
              </div>
              <FollowButton userId={testUserId} />
            </div>
            
            <FollowStats userId={testUserId} showDetails={true} />
          </CardContent>
        </Card>

        {/* Follow Network Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Follow Network Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowList userId={testUserId} />
          </CardContent>
        </Card>

        {/* API Endpoints Info */}
        <Card>
          <CardHeader>
            <CardTitle>Available API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>POST /api/follows/:userId</strong> - Follow a user</p>
              <p><strong>DELETE /api/follows/:userId</strong> - Unfollow a user</p>
              <p><strong>POST /api/follows/:userId/toggle</strong> - Toggle follow status</p>
              <p><strong>GET /api/follows/:userId/check</strong> - Check follow status</p>
              <p><strong>GET /api/follows/:userId/followers/count</strong> - Get followers count</p>
              <p><strong>GET /api/follows/:userId/following/count</strong> - Get following count</p>
              <p><strong>GET /api/follows/:userId/followers</strong> - Get followers list</p>
              <p><strong>GET /api/follows/:userId/following</strong> - Get following list</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Make sure you're logged in to test the follow functionality</li>
              <li>Click the "Follow" button to follow the test user</li>
              <li>The button should change to "Unfollow" and show a success message</li>
              <li>Click "Unfollow" to unfollow the user</li>
              <li>The follow stats should update automatically</li>
              <li>Check the browser console for any errors</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 