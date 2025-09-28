"use client"

import { Skeleton } from "@/components/ui/skeleton"
import LeftSidebarSkeleton from "./LeftSidebarSkeleton"
import RightSidebarSkeleton from "./RightSidebarSkeleton"

export default function AuthorLoadingSkeleton() {
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

          {/* Main Content Skeleton - Author Page */}
          <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto scrollbar-hide">
            <div className="w-full">
              {/* Header Section Skeleton - Twitter-style Profile */}
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>

              {/* Stats Section Skeleton - Twitter-style */}
              <div className="p-4 border-b border-border/50">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Articles Skeleton - Twitter Feed Style */}
              <div className="divide-y divide-border/50">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                
                <div className="divide-y divide-border/50">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="w-12 h-4 ml-2" />
                          </div>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                        
                        <Skeleton className="w-3 h-3 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links Skeleton - Twitter-style */}
              <div className="p-4 border-t border-border/50">
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
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
