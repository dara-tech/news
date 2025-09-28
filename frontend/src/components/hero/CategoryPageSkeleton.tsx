'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import NewsGridSkeleton from '@/components/news/NewsGridSkeleton';

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

            {/* Category Hero Skeleton - Minimal Design */}
            <div className="border-b border-border pb-8">
              <div className="flex items-center gap-4 mb-6">
                {/* Category Icon Skeleton - Minimal */}
                <Skeleton className="w-12 h-12 rounded-lg" />
                
                <div>
                  {/* Category Title Skeleton - Clean */}
                  <Skeleton className="h-8 w-48 mb-2" />
                  
                  {/* Article Count Skeleton - Minimal */}
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              
              {/* Category Description Skeleton - Clean */}
              <Skeleton className="h-5 w-96 max-w-2xl" />
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Controls Section Skeleton - Minimal Design */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search Skeleton - Minimal */}
                  <div className="flex-1 max-w-md">
                    <Skeleton className="h-10 w-full" />
                  </div>
                  
                  {/* Controls Skeleton - Minimal */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <div className="flex items-center bg-muted rounded-md p-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles Grid Skeleton - Using new NewsGridSkeleton */}
              <div className="space-y-6">
                <NewsGridSkeleton count={6} viewMode="grid" />
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
