'use client';

import { useState, useEffect } from 'react';
import { getFollowersCount, getFollowingCount } from '@/lib/followApi';
import { Users, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowList from './FollowList';

interface FollowStatsProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

export default function FollowStats({ userId, className = '', showDetails = false }: FollowStatsProps) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowList, setShowFollowList] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        const [followersResponse, followingResponse] = await Promise.all([
          getFollowersCount(userId),
          getFollowingCount(userId)
        ]);
        
        setFollowersCount(followersResponse.count);
        setFollowingCount(followingResponse.count);
      } catch (error) {// Don't show error state, just keep the default values (0)
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="animate-pulse">...</span>
          </div>
          <div className="flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            <span className="animate-pulse">...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Basic Stats */}
      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{followersCount.toLocaleString()} followers</span>
        </div>
        <div className="flex items-center gap-1">
          <UserPlus className="w-4 h-4" />
          <span>{followingCount.toLocaleString()} following</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
              {followersCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
              {followingCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
          </CardContent>
        </Card>
      </div>

      {/* Follow Ratio */}
      {followersCount > 0 && followingCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Follow ratio:</span>
          <Badge variant="outline" className="text-xs">
            {((followersCount / followingCount) * 100).toFixed(1)}%
          </Badge>
          {followersCount > followingCount ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-orange-500" />
          )}
        </div>
      )}

      {/* View Details Button */}
      {showDetails && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFollowList(!showFollowList)}
          className="w-full text-xs"
        >
          {showFollowList ? 'Hide Details' : 'View Follow Network'}
        </Button>
      )}

      {/* Follow List */}
      {showDetails && showFollowList && (
        <FollowList userId={userId} />
      )}
    </div>
  );
} 