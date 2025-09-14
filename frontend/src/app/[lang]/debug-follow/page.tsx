'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFollowersCount, getFollowingCount } from '@/lib/followApi';

export default function DebugFollowPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFollowAPI = async () => {
    setLoading(true);
    setError(null);
    setResults({});

    try {const testUserId = '687362dbfcd8692cef0917df';
      
      const [followersResponse, followingResponse] = await Promise.all([
        getFollowersCount(testUserId),
        getFollowingCount(testUserId)
      ]);

      setResults({
        followers: followersResponse,
        following: followingResponse
      });} catch (err: any) {setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Debug Follow API</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the follow API directly from the frontend.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testFollowAPI} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Follow API'}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200">Error:</h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {Object.keys(results).length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Results:</h3>
                <pre className="text-sm text-green-700 dark:text-green-300 overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 