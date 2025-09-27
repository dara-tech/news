'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
        {/* Trending Badge Skeleton */}
        {i < 3 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
              <Skeleton className="w-3 h-3 mr-1" />
              <Skeleton className="h-3 w-16" />
            </Badge>
          </div>
        )}

        {/* Image Skeleton */}
        <div className="relative w-full h-80 overflow-hidden bg-muted">
          <Skeleton className="w-full h-full" />
          
          {/* Category Badge Skeleton */}
          <div className="absolute bottom-4 left-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="p-6 space-y-4">
          {/* Meta Information Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
          
          {/* Title Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          
          {/* Excerpt Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          
          {/* Tags Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          
          {/* Minimal Action Buttons Skeleton */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
