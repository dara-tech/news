'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LeftSidebarSkeleton = () => (
  <div className="p-6 space-y-6 h-full flex flex-col">
    {/* Navigation Menu Skeleton */}
    <nav className="space-y-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-full h-14 flex items-center gap-4 p-4 rounded-lg">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </nav>

    {/* Top Authors Section Skeleton */}
    <div className="flex-1 pt-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LeftSidebarSkeleton;
