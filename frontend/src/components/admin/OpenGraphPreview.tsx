'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Twitter, Facebook, Share2 } from 'lucide-react';

interface OpenGraphPreviewProps {
  title: string;
  description: string;
  image: string;
  siteName: string;
  url: string;
  type?: 'facebook' | 'twitter' | 'linkedin' | 'general';
}

export default function OpenGraphPreview({
  title,
  description,
  image,
  siteName,
  url,
  type = 'general'
}: OpenGraphPreviewProps) {
  const getPlatformIcon = () => {
    switch (type) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getPlatformName = () => {
    switch (type) {
      case 'facebook':
        return 'Facebook';
      case 'twitter':
        return 'Twitter';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Social Media';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getPlatformIcon()}
        <span className="font-semibold">{getPlatformName()} Preview</span>
        <Badge variant="outline" className="text-xs">
          {type === 'twitter' ? 'Large Card' : 'Rich Preview'}
        </Badge>
      </div>
      
      <Card className="max-w-lg">
        <CardContent className="p-0">
          {/* Image */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-500 ${image ? 'hidden' : ''}`}>
              <div className="text-center">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No image available</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                {title || 'Article Title'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {description || 'Article description will appear here when shared on social media platforms.'}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">{siteName.toLowerCase()}</span>
              <span className="truncate max-w-[200px]">{url}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Platform-specific notes */}
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        {type === 'facebook' && (
          <p>• Facebook will automatically fetch and cache this preview</p>
        )}
        {type === 'twitter' && (
          <p>• Twitter will show this as a large card with image</p>
        )}
        {type === 'linkedin' && (
          <p>• LinkedIn will display this as a rich preview</p>
        )}
        <p>• Image dimensions: 1200x630px recommended</p>
        <p>• Title should be under 60 characters for best display</p>
        <p>• Description should be under 160 characters</p>
      </div>
    </div>
  );
}
