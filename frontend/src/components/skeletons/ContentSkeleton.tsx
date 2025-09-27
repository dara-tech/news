import { Skeleton } from "@/components/ui/skeleton";

export default function ContentSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-80 md:h-[500px] overflow-hidden rounded-2xl">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
          <Skeleton className="h-4 w-1/2 bg-white/20" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
























