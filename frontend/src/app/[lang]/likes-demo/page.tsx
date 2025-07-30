'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikeButton from '@/components/common/LikeButton';
import AdvancedLikeButton from '@/components/common/AdvancedLikeButton';
import { likeApi, PopularArticle } from '@/lib/likeApi';

export default function LikesDemoPage() {
  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Demo article IDs for testing
  const demoArticleIds = [
    '507f1f77bcf86cd799439011', // Replace with actual article IDs
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013',
  ];

  useEffect(() => {
    loadPopularArticles();
  }, []);

  const loadPopularArticles = async () => {
    try {
      setIsLoading(true);
      const response = await likeApi.getPopularArticles(5);
      setPopularArticles(response.data);
    } catch (error) {
      console.error('Error loading popular articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeChange = (liked: boolean, newCount: number) => {
    console.log(`Article ${liked ? 'liked' : 'unliked'}, new count: ${newCount}`);
    // Refresh popular articles after like change
    loadPopularArticles();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Like System Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Interactive like buttons with full backend integration
        </p>
      </div>

      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="popular">Popular Articles</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Like Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Basic Like Button
                  <Badge variant="secondary">Simple</Badge>
                </CardTitle>
                <CardDescription>
                  Standard like button with backend integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <LikeButton
                    newsId={demoArticleIds[0]}
                    size="md"
                    variant="ghost"
                    onLikeChange={handleLikeChange}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Features: Backend sync, optimistic updates, error handling
                </div>
              </CardContent>
            </Card>

            {/* Advanced Like Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Advanced Like Button
                  <Badge variant="default">Premium</Badge>
                </CardTitle>
                <CardDescription>
                  Enhanced with double-tap and animations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <AdvancedLikeButton
                    newsId={demoArticleIds[1]}
                    size="md"
                    variant="ghost"
                    enableDoubleTap={true}
                    enableHapticFeedback={true}
                    showAnimation={true}
                    onLikeChange={handleLikeChange}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Features: Double-tap, haptic feedback, floating heart animation
                </div>
              </CardContent>
            </Card>

            {/* Size Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Size Variants</CardTitle>
                <CardDescription>
                  Different sizes for various use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <LikeButton 
                    newsId={demoArticleIds[0]} 
                    size="sm" 
                    showCount={false} 
                  />
                  <LikeButton 
                    newsId={demoArticleIds[1]} 
                    size="md" 
                    showCount={false} 
                  />
                  <LikeButton 
                    newsId={demoArticleIds[2]} 
                    size="lg" 
                    showCount={false} 
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Small, Medium, and Large sizes available
                </div>
              </CardContent>
            </Card>

            {/* Variant Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Variant Styles</CardTitle>
                <CardDescription>
                  Different button styles and themes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <LikeButton 
                    newsId={demoArticleIds[0]} 
                    variant="ghost" 
                    showCount={false} 
                  />
                  <LikeButton 
                    newsId={demoArticleIds[1]} 
                    variant="outline" 
                    showCount={false} 
                  />
                  <LikeButton 
                    newsId={demoArticleIds[2]} 
                    variant="default" 
                    showCount={false} 
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Ghost, Outline, and Default variants
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Popular Articles
                <Badge variant="outline">Live Data</Badge>
              </CardTitle>
              <CardDescription>
                Most liked articles from the backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading popular articles...</p>
                </div>
              ) : popularArticles.length > 0 ? (
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <div key={article._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {article.title.en}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {article.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">
                          {article.likeCount} likes
                        </Badge>
                        <LikeButton
                          newsId={article._id}
                          size="sm"
                          showCount={false}
                          onLikeChange={handleLikeChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No popular articles found</p>
                  <Button 
                    onClick={loadPopularArticles}
                    className="mt-2"
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Testing</CardTitle>
              <CardDescription>
                Test the like API endpoints directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={loadPopularArticles}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Load Popular Articles'}
                </Button>
                <Button 
                  onClick={() => likeApi.getLikeCount(demoArticleIds[0]).then(console.log)}
                  variant="outline"
                  className="w-full"
                >
                  Get Like Count
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold">API Endpoints:</h4>
                <div className="text-sm space-y-1">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    GET /api/likes/popular
                  </code>
                  <br />
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    GET /api/likes/:newsId/count
                  </code>
                  <br />
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    GET /api/likes/:newsId/status
                  </code>
                  <br />
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    POST /api/likes/:newsId/toggle
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 