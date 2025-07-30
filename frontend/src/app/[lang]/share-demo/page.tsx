'use client';

import { useState } from 'react';
import ShareComponent from '@/components/common/ShareComponent';
import AdvancedShareComponent from '@/components/common/AdvancedShareComponent';
import FloatingShareButton from '@/components/common/FloatingShareButton';
import IconShowcase from '@/components/common/IconShowcase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ShareDemoPage() {
  const [shareAnalytics, setShareAnalytics] = useState<Record<string, number>>({});

  const demoArticle = {
    url: 'https://example.com/article/amazing-news-story',
    title: 'Amazing News Story That Will Blow Your Mind',
    description: 'This is an incredible story about innovation and technology that will change the way you think about the future.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
  };

  // This handler is only used for AdvancedShareComponent, not ShareComponent
  const handleShare = (platform: string) => {
    setShareAnalytics(prev => ({
      ...prev,
      [platform]: (prev[platform] || 0) + 1
    }));
    console.log(`Shared on ${platform}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Share Components Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore different share component variants and features. Each component is designed for specific use cases and provides advanced sharing capabilities.
          </p>
        </div>

        {/* Demo Article */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Demo Article</CardTitle>
            <CardDescription>
              This is the article that will be shared across all components below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Title:</h3>
                <p className="text-gray-600 dark:text-gray-400">{demoArticle.title}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Description:</h3>
                <p className="text-gray-600 dark:text-gray-400">{demoArticle.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">URL:</h3>
                <p className="text-gray-600 dark:text-gray-400 break-all">{demoArticle.url}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Analytics */}
        {Object.keys(shareAnalytics).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Share Analytics</CardTitle>
              <CardDescription>
                Track shares across all components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(shareAnalytics).map(([platform, count]) => (
                  <div key={platform} className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{platform}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Share Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Basic Share Component
                <Badge variant="secondary">Default</Badge>
              </CardTitle>
              <CardDescription>
                Simple share component with essential social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Default:</span>
                <ShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                />
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Minimal:</span>
                <ShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  variant="minimal"
                  size="sm"
                />
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Large:</span>
                <ShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  size="lg"
                  showSocialCounts={true}
                  showQRCode={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Share Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Advanced Share Component
                <Badge variant="default">Advanced</Badge>
              </CardTitle>
              <CardDescription>
                Advanced features including analytics, mobile optimization, and more platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Default:</span>
                <AdvancedShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  onShare={handleShare}
                />
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">With Analytics:</span>
                <AdvancedShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  showAnalytics={true}
                  onShare={handleShare}
                />
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Custom Platforms:</span>
                <AdvancedShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  platforms={['facebook', 'twitter', 'whatsapp', 'telegram']}
                  onShare={handleShare}
                />
              </div>
            </CardContent>
          </Card>

          {/* Floating Share Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Floating Share Button
                <Badge variant="outline">Floating</Badge>
              </CardTitle>
              <CardDescription>
                Fixed position share button that appears on scroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This component appears as a floating button in the bottom-right corner.
                Scroll down to see it in action.
              </p>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The floating share button will appear when you scroll down the page.
                  It&apos;s perfect for long articles where users might want to share
                  while reading.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inline Share Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Inline Share Component
                <Badge variant="secondary">Inline</Badge>
              </CardTitle>
              <CardDescription>
                Share component designed for inline use in content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert">
                <p>
                  This is a paragraph with an inline share component. 
                  <ShareComponent
                    url={demoArticle.url}
                    title={demoArticle.title}
                    description={demoArticle.description}
                    image={demoArticle.image}
                    variant="default"
                    size="sm"
                  />
                  You can place it anywhere in your content.
                </p>
              </div>
              <Separator />
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Or use it as a standalone element:
                </p>
                {/* "inline" is not a valid variant, so use "default" */}
                <ShareComponent
                  url={demoArticle.url}
                  title={demoArticle.title}
                  description={demoArticle.description}
                  image={demoArticle.image}
                  variant="default"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Component Features</CardTitle>
            <CardDescription>
              Overview of features available in each component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Basic Share Component</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Multiple social platforms</li>
                  <li>• Copy link functionality</li>
                  <li>• QR code generation</li>
                  <li>• Social share counts</li>
                  <li>• Multiple size variants</li>
                  <li>• Dark mode support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Advanced Share Component</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• All basic features</li>
                  <li>• Mobile-optimized sharing</li>
                  <li>• Share analytics tracking</li>
                  <li>• Customizable platforms</li>
                  <li>• Sheet view on mobile</li>
                  <li>• Callback support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Floating Share Button</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Fixed position</li>
                  <li>• Scroll-triggered visibility</li>
                  <li>• Smooth animations</li>
                  <li>• High z-index</li>
                  <li>• Customizable threshold</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon Showcase */}
        <div className="mt-8">
          <IconShowcase />
        </div>
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton
        url={demoArticle.url}
        title={demoArticle.title}
        description={demoArticle.description}
        image={demoArticle.image}
        showOnScroll={true}
        scrollThreshold={200}
      />
    </div>
  );
} 