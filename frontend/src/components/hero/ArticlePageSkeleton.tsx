'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import TwitterLikeLayoutSkeleton from './TwitterLikeLayoutSkeleton';

const ArticlePageSkeleton = () => (
  <div className="min-h-screen bg-background">
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
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen">
        {/* Left Sidebar Skeleton */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-hidden border-r border-border/50">
          <div className="p-6 space-y-6 h-full flex flex-col">
            {/* Logo Skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            {/* Navigation Skeleton */}
            <nav className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </nav>

            {/* Top Authors Skeleton */}
            <div className="flex-1 pt-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <div className="flex gap-3">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton - Article */}
        <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Back Button Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Article Card Skeleton */}
            <div className="bg-white dark:bg-black rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
              {/* Hero Image Skeleton */}
              <Skeleton className="w-full h-64 md:h-80" />

              {/* Article Header Skeleton */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                {/* Badges Skeleton */}
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                
                {/* Title Skeleton */}
                <Skeleton className="h-12 w-full mb-4" />
                
                {/* Meta Information Skeleton */}
                <div className="flex flex-wrap gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar Skeleton */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>

              {/* Article Content Skeleton */}
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>

              {/* Author Section Skeleton */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section Skeleton */}
            <div className="mt-8 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-hidden">
          <div className="p-6 space-y-4 h-full flex flex-col">
            {/* Search Bar Skeleton */}
            <div className="relative">
              <Skeleton className="w-full h-12 rounded-full" />
            </div>

            {/* Trending Categories Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>

            {/* Latest Stories Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex items-center gap-3 text-xs">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-2" />
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
        </aside>
      </div>
    </div>
  </div>
);

export default ArticlePageSkeleton;
