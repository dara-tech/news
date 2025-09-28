"use client"

import { Skeleton } from "@/components/ui/skeleton"
import LeftSidebarSkeleton from "@/components/hero/LeftSidebarSkeleton"
import RightSidebarSkeleton from "@/components/hero/RightSidebarSkeleton"

export default function NewsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout - Full Width */}
      <div className="block lg:hidden">
        <div className="w-full p-4 space-y-8">
          {/* Page Header Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>

            {/* Search and Filters Skeleton */}
            <div className="space-y-4">
              {/* Search Bar Skeleton */}
              <div className="relative">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Filters Skeleton */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Category Filter Skeleton */}
                <Skeleton className="h-10 w-[200px]" />
                
                {/* Sort Filter Skeleton */}
                <Skeleton className="h-10 w-[180px]" />
                
                {/* View Mode Toggle Skeleton */}
                <div className="flex items-center border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-r-none" />
                  <Skeleton className="h-10 w-10 rounded-l-none" />
                </div>
              </div>

              {/* Active Filters Skeleton */}
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>

          {/* News Content Skeleton */}
          <div className="space-y-6">
            {/* News Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center space-x-2">
              <Skeleton className="h-10 w-20" />
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10" />
                ))}
              </div>
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Twitter-like */}
      <div className="hidden lg:block">
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

            {/* Main Content Skeleton */}
            <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto">
              {/* Header Skeleton */}
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10">
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

              {/* News Page Content Skeleton */}
              <div className="p-4 space-y-8">
                {/* Page Header Skeleton */}
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-6 w-96" />
                  </div>

                  {/* Search and Filters Skeleton */}
                  <div className="space-y-4">
                    {/* Search Bar Skeleton */}
                    <div className="relative">
                      <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Filters Skeleton */}
                    <div className="flex flex-wrap gap-4 items-center">
                      {/* Category Filter Skeleton */}
                      <Skeleton className="h-10 w-[200px]" />
                      
                      {/* Sort Filter Skeleton */}
                      <Skeleton className="h-10 w-[180px]" />
                      
                      {/* View Mode Toggle Skeleton */}
                      <div className="flex items-center border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-r-none" />
                        <Skeleton className="h-10 w-10 rounded-l-none" />
                      </div>
                    </div>

                    {/* Active Filters Skeleton */}
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* News Content Skeleton */}
                <div className="space-y-6">
                  {/* News Grid Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="w-full h-48 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex items-center justify-between pt-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Skeleton */}
                  <div className="flex items-center justify-center space-x-2">
                    <Skeleton className="h-10 w-20" />
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-10" />
                      ))}
                    </div>
                    <Skeleton className="h-10 w-16" />
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
    </div>
  )
}
