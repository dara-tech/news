import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-[500px]">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>

      {/* Latest News Section Skeleton */}
      <section>
        <Skeleton className="h-9 w-48 mb-6" /> {/* for "Latest News" title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;
