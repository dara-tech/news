"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
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
              {[...Array(3)].map((_, i) => (
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
        <Card className="mb-8">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="w-full mb-8">
          <div className="grid w-full grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-4 border-b-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-48" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
