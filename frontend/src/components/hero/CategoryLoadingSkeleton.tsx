"use client"

import TwitterLikeLayoutSkeleton from "./TwitterLikeLayoutSkeleton"

export default function CategoryLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-screen">
          {/* Left Sidebar Skeleton */}
          <aside className="hidden lg:block lg:col-span-3 p-6">
            <div className="space-y-6">
              {/* Navigation Skeleton */}
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Back Button Skeleton */}
              <div className="mb-6">
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>

              {/* Category Hero Skeleton */}
              <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <div className="text-center">
                    {/* Category Icon Skeleton */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-6 animate-pulse"></div>
                    
                    {/* Category Title Skeleton */}
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                    
                    {/* Category Description Skeleton */}
                    <div className="space-y-2 mb-8">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto animate-pulse"></div>
                    </div>
                    
                    {/* Category Stats Skeleton */}
                    <div className="flex justify-center items-center gap-8 mb-8">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Section Skeleton */}
              <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search Skeleton */}
                  <div className="flex-1 max-w-md">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Controls Skeleton */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="space-y-4">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Articles Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar Skeleton */}
          <aside className="hidden lg:block lg:col-span-3 p-6">
            <div className="space-y-6">
              {/* Trending Categories Skeleton */}
              <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Stories Skeleton */}
              <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
