
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LikeButton from './LikeButton';
import AdvancedLikeButton from './AdvancedLikeButton';

export default function LikeButtonDemo() {
  const [demoLikes, setDemoLikes] = useState(42);
  const [demoLiked, setDemoLiked] = useState(false);

  const handleLikeChange = (liked: boolean, newCount: number) => {
    console.log(`Demo like changed: ${liked ? 'liked' : 'unliked'}, count: ${newCount}`);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDemoLikes(newCount);
        setDemoLiked(liked);
        resolve();
      }, 500);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Like Button Components
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive like buttons with various features and animations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Like Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Basic Like Button
              <Badge variant="secondary">Simple</Badge>
            </CardTitle>
            <CardDescription>
              Standard like button with count display and hover effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <LikeButton
                newsId="demo-article-1"
                initialLikes={128}
                initialLiked={false}
                onLikeChange={handleLikeChange}
                size="md"
                variant="ghost"
              />
            </div>
            <div className="text-sm text-gray-500">
              Features: Count display, hover effects, state management
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
              Enhanced with double-tap, haptic feedback, and animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <AdvancedLikeButton
                newsId="demo-article-2"
                initialLikes={256}
                initialLiked={true}
                onLikeChange={handleLikeChange}
                size="md"
                variant="ghost"
                enableDoubleTap={true}
                enableHapticFeedback={true}
                showAnimation={true}
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
              <LikeButton newsId="demo-size-sm" size="sm" showCount={false} />
              <LikeButton newsId="demo-size-md" size="md" showCount={false} />
              <LikeButton newsId="demo-size-lg" size="lg" showCount={false} />
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
              <LikeButton newsId="demo-variant-ghost" variant="ghost" showCount={false} />
              <LikeButton newsId="demo-variant-outline" variant="outline" showCount={false} />
              <LikeButton newsId="demo-variant-default" variant="default" showCount={false} />
            </div>
            <div className="text-sm text-gray-500">
              Ghost, Outline, and Default variants
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Try the like buttons and see the state changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <LikeButton
                  newsId="demo-interactive-basic"
                  initialLikes={demoLikes}
                  initialLiked={demoLiked}
                  onLikeChange={handleLikeChange}
                  size="lg"
                />
                <p className="text-sm text-gray-500 mt-2">Basic Version</p>
              </div>
              
              <Separator orientation="vertical" className="h-16" />
              
              <div className="text-center">
                <AdvancedLikeButton
                  newsId="demo-interactive-advanced"
                  initialLikes={demoLikes}
                  initialLiked={demoLiked}
                  onLikeChange={handleLikeChange}
                  size="lg"
                  enableDoubleTap={true}
                  enableHapticFeedback={true}
                  showAnimation={true}
                />
                <p className="text-sm text-gray-500 mt-2">Advanced Version</p>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current State: {demoLiked ? 'Liked' : 'Not Liked'} • Count: {demoLikes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try double-tapping the advanced button for instant like!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              Code examples for implementing like buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Basic Implementation</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import LikeButton from '@/components/common/LikeButton';

<LikeButton
  initialLikes={42}
  initialLiked={false}
  onLikeChange={(liked, newCount) => {
    // Handle like state change
    console.log(\`Liked: \${liked}, Count: \${newCount}\`);
  }}
  size="md"
  variant="ghost"
/>`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Advanced Implementation</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import AdvancedLikeButton from '@/components/common/AdvancedLikeButton';

<AdvancedLikeButton
  initialLikes={128}
  initialLiked={true}
  onLikeChange={handleLikeChange}
  enableDoubleTap={true}
  enableHapticFeedback={true}
  showAnimation={true}
  size="lg"
  variant="outline"
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 