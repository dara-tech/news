"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CategoriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Page Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Category Icon Skeleton */}
                  <Skeleton className="w-16 h-16 rounded-full" />
                  
                  {/* Category Name Skeleton */}
                  <Skeleton className="h-6 w-24" />
                  
                  {/* Category Description Skeleton */}
                  <Skeleton className="h-4 w-32" />
                  
                  {/* Article Count Skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
