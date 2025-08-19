'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, UserPlus, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FollowList from '@/components/common/FollowList';
import { getFollowersCount, getFollowingCount } from '@/lib/followApi';

export default function FollowNetworkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [followersResponse, followingResponse] = await Promise.all([
          getFollowersCount(user._id),
          getFollowingCount(user._id)
        ]);
        
        setFollowersCount(followersResponse.count);
        setFollowingCount(followingResponse.count);
      } catch (error) {
        console.error('Error fetching follow stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Follow Network
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your followers and following connections
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {isLoading ? '...' : followersCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {isLoading ? '...' : followingCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {followersCount > 0 && followingCount > 0 
                  ? `${((followersCount / followingCount) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Follow Ratio</div>
            </CardContent>
          </Card>
        </div>

        {/* Follow Network Details */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Follow Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FollowList userId={user._id} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Discover Users</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Find new users to follow and expand your network
              </p>
              <Link href="/news">
                <Button className="w-full">
                  Browse Articles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Follow Suggestions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get personalized suggestions based on your interests
              </p>
              <Button variant="outline" className="w-full">
                View Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Follow Tips */}
        <Card className="mt-8 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Follow Network Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Building Your Network</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Follow users who share your interests</li>
                  <li>• Engage with content from users you follow</li>
                  <li>• Share quality content to attract followers</li>
                  <li>• Be active in the community</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Follow Ratio</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  A healthy follow ratio indicates good engagement:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">More followers than following = Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">More following than followers = Growing</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 