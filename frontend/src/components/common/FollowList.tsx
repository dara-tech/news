'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFollowers, getFollowing } from '@/lib/followApi';
import { Users, UserPlus, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface FollowListProps {
  userId: string;
  className?: string;
}

interface FollowUser {
  _id: string;
  username: string;
  profileImage?: string;
  role?: string;
  createdAt?: string;
}

interface FollowItem {
  _id: string;
  follower?: FollowUser;
  following?: FollowUser;
  createdAt: string;
}

export default function FollowList({ userId, className = '' }: FollowListProps) {
  const [followers, setFollowers] = useState<FollowItem[]>([]);
  const [following, setFollowing] = useState<FollowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [followersResponse, followingResponse] = await Promise.all([
          getFollowers(userId, 1, 20),
          getFollowing(userId, 1, 20)
        ]);

        setFollowers(followersResponse.data);
        setFollowing(followingResponse.data);
      } catch (error) {setError('Failed to load follow data');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchFollowData();
    }
  }, [userId]);

  const getUserFromItem = (item: FollowItem, isFollowingTab: boolean = false): FollowUser | null => {
    // For followers tab, we want the follower user
    // For following tab, we want the following user
    const user = isFollowingTab ? item.following : item.follower;
    
    // Return null if user data is missing or invalid
    if (!user || !user._id || !user.username) {
      return null;
    }
    
    return user;
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500 text-white';
      case 'editor':
        return 'bg-blue-500 text-white';
      case 'user':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const FollowUserCard = ({ user, followDate }: { user: FollowUser; followDate: string }) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full">
      <div className="flex items-center gap-3 flex-1 w-full">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.profileImage} alt={user.username} />
          <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {user.username}
            </h4>
            {user.role && (
              <Badge className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Followed {format(new Date(followDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <Link href={`/en/author/${user._id}`}>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={`border border-gray-200 dark:border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Follow Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out invalid items and get valid users
  const validFollowers = followers
    .map(item => ({ user: getUserFromItem(item, false), item }))
    .filter(({ user }) => user !== null) as { user: FollowUser; item: FollowItem }[];

  const validFollowing = following
    .map(item => ({ user: getUserFromItem(item, true), item }))
    .filter(({ user }) => user !== null) as { user: FollowUser; item: FollowItem }[];

  return (
    <Card className={`border border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Follow Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Followers ({validFollowers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Following ({validFollowing.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="space-y-3 mt-4">
            {validFollowers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No followers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {validFollowers.map(({ user, item }) => (
                  <FollowUserCard 
                    key={item._id} 
                    user={user} 
                    followDate={item.createdAt}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="space-y-3 mt-4">
            {validFollowing.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Not following anyone yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {validFollowing.map(({ user, item }) => (
                  <FollowUserCard 
                    key={item._id} 
                    user={user} 
                    followDate={item.createdAt}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 