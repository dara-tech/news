'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryPageSkeleton = () => (
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

        {/* Main Content Skeleton - Category */}
        <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Back Button Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Category Hero Skeleton */}
            <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                  {/* Category Icon Skeleton */}
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
                  
                  {/* Category Title Skeleton */}
                  <Skeleton className="h-12 w-64 mx-auto mb-4" />
                  
                  {/* Category Description Skeleton */}
                  <Skeleton className="h-6 w-96 mx-auto mb-8" />
                  
                  {/* Category Stats Skeleton */}
                  <div className="flex justify-center items-center gap-8 mb-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Controls Section Skeleton */}
              <div className="mb-8 border-0 shadow-lg rounded-lg">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search Skeleton */}
                    <div className="flex-1 max-w-md">
                      <Skeleton className="h-10 w-full" />
                    </div>
                    
                    {/* Controls Skeleton */}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-40" />
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="w-full mb-8">
                <div className="grid w-full grid-cols-3 mb-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-3 border-b">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-6 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Articles Grid Skeleton */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                      {/* Article Image Skeleton */}
                      <Skeleton className="w-full h-48" />
                      
                      {/* Article Content Skeleton */}
                      <div className="p-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-3" />
                        <div className="flex items-center gap-2 text-xs">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-2" />
                          <Skeleton className="h-3 w-12" />
                        </div>
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

export default CategoryPageSkeleton;
