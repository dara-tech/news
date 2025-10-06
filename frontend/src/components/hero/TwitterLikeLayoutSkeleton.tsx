'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import LeftSidebarSkeleton from './LeftSidebarSkeleton';
import RightSidebarSkeleton from './RightSidebarSkeleton';
import MainFeatureSkeleton from './MainFeatureSkeleton';
import InfiniteScrollSkeleton from './InfiniteScrollSkeleton';

const TwitterLikeLayoutSkeleton = () => (
  <div className="bg-background">
    {/* Breaking News Ticker Skeleton */}
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-border/50">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>

    {/* Twitter-like Layout Skeleton */}
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen">
        {/* Left Sidebar Skeleton */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen border-none">
          <LeftSidebarSkeleton />
        </aside>

        {/* Main Content Skeleton */}
        <main className="lg:col-span-6 border-x border-none min-h-screen">
          {/* Header Skeleton - Hidden */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10 hidden">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Feature Skeleton - Pinned Post */}
          <div className="border-b border-border/50 px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <MainFeatureSkeleton />
          </div>

          {/* Latest News Section Header Skeleton */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 z-10">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          {/* Infinite Scroll Feed Skeleton */}
          <div>
            <InfiniteScrollSkeleton />
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-y-auto scrollbar-hide">
          <RightSidebarSkeleton />
        </aside>
      </div>
    </div>
  </div>
);

export default TwitterLikeLayoutSkeleton;
