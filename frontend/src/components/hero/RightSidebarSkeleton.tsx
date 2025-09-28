'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RightSidebarSkeleton = () => (
  <div className="p-6 space-y-4 h-full flex flex-col ">
    {/* Search Bar Skeleton */}
    <div className="relative">
      <Skeleton className="w-full h-12 rounded-full" />
    </div>

    {/* Trending Categories Skeleton */}
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Skeleton className="w-4 h-4" />
          </div>
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="w-3 h-3" />
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent ">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index} 
            className="rounded-xl border border-border/50 bg-card/50 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Trending indicator for top 3 */}
                {index < 3 && (
                  <div className="flex-shrink-0">
                    <Skeleton className="h-5 w-6 rounded-full" />
                  </div>
                )}
                
                {/* Category info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3 h-3" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                <Skeleton className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>

    {/* Latest Stories Skeleton */}
    <div className="bg-card/50 rounded-xl border border-border/50 p-4 flex-1">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 rounded-lg space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="text-xs space-y-2 pt-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

export default RightSidebarSkeleton;
