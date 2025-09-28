'use client';

import NewsCardSkeleton from './NewsCardSkeleton';

interface NewsGridSkeletonProps {
  count?: number;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export default function NewsGridSkeleton({ count = 6, className = '', viewMode = 'grid' }: NewsGridSkeletonProps) {
  // List view skeleton
  if (viewMode === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <NewsCardSkeleton key={index} viewMode="list" />
        ))}
      </div>
    );
  }

  // Grid view skeleton (default)
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeleton key={index} viewMode="grid" />
      ))}
    </div>
  );
}
