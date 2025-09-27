'use client';

import React from 'react';

const MainFeatureSkeleton = () => (
  <div className="relative rounded-lg overflow-hidden group border border-border/50">
    <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
      {/* Background image skeleton */}
      <div className="relative w-full h-full overflow-hidden">
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        {/* Simple overlay skeleton */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Category badge skeleton */}
      <div className="absolute top-4 left-4 z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-white/20 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="h-3 w-16 bg-white/40 rounded" />
        </div>
      </div>

      {/* Article metadata skeleton */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 animate-pulse">
          <div className="w-3 h-3 bg-white/40 rounded" />
          <div className="h-3 w-8 bg-white/40 rounded" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 animate-pulse">
          <div className="h-3 w-20 bg-white/40 rounded" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 z-20 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-full bg-white/20 animate-pulse rounded" />
          <div className="h-8 w-4/5 bg-white/20 animate-pulse rounded" />
          <div className="h-8 w-3/4 bg-white/20 animate-pulse rounded" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/20 animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-white/20 animate-pulse rounded" />
        </div>

        {/* CTA and author info skeleton */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 animate-pulse rounded" />
            <div className="h-4 w-24 bg-white/20 animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-white/20 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Bottom accent skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
    </div>
  </div>
);

export default MainFeatureSkeleton;
