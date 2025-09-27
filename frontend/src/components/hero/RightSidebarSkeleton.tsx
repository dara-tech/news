'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RightSidebarSkeleton = () => (
  <div className="p-6 space-y-4 h-full flex flex-col">
    {/* Search Bar Skeleton */}
    <div className="relative">
      <Skeleton className="w-full h-12 rounded-full" />
    </div>

    {/* Trending Categories Skeleton */}
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
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
