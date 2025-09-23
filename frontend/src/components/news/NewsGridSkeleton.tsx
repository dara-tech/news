'use client';

import NewsCardSkeleton from './NewsCardSkeleton';

interface NewsGridSkeletonProps {
  count?: number;
  className?: string;
}

export default function NewsGridSkeleton({ count = 6, className = '' }: NewsGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </div>
  );
}
