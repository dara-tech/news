"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function NewsPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="border-b-4 border-gray-200 dark:border-gray-700 mb-4">
            <Skeleton className="h-8 w-64 mb-2" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="max-w-md">
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-10" />
              <Skeleton className="w-20 h-10" />
            </div>
          </div>
        </div>

        {/* Category Filter Skeleton */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* News Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-48" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
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

        {/* Pagination Skeleton */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
