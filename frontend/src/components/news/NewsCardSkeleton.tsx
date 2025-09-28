'use client';

import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

interface NewsCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export default function NewsCardSkeleton({ viewMode = 'grid' }: NewsCardSkeletonProps) {
  // List view skeleton
  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          {/* Image skeleton - Smaller for list view */}
          <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
          
          {/* Content skeleton */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Category skeleton */}
            <Skeleton className="h-3 w-16" />
            
            {/* Title skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            
            {/* Date skeleton */}
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view skeleton (default)
  return (
    <motion.div
      variants={cardVariants}
      className="bg-card border border-border rounded-lg overflow-hidden group"
    >
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-video" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category skeleton */}
        <Skeleton className="h-3 w-16" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        
        {/* Date and arrow skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
