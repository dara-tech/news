"use client"

import { Skeleton } from "@/components/ui/skeleton"
import NewsGridSkeleton from "@/components/news/NewsGridSkeleton"
import LeftSidebarSkeleton from "./LeftSidebarSkeleton"
import RightSidebarSkeleton from "./RightSidebarSkeleton"

export default function CategoryLoadingSkeleton() {
  return (
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
            <LeftSidebarSkeleton />
          </aside>

          {/* Main Content Skeleton - Category Page */}
          <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-6">
              {/* Minimal Back Navigation Skeleton */}
              <div className="mb-4">
                <Skeleton className="h-8 w-20" />
              </div>

              {/* Minimal Hero Section Skeleton */}
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
              <div className="space-y-6">
                {/* Minimal Controls Section Skeleton */}
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
            <RightSidebarSkeleton />
          </aside>
        </div>
      </div>
    </div>
  );
}
