'use client';

import { motion, Variants } from 'framer-motion';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const shimmerVariants: Variants = {
  shimmer: {
    x: ['-100%', '100%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop' as const,
        duration: 1.5,
        ease: 'linear' as const,
      },
    },
  },
};

export default function NewsCardSkeleton() {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative overflow-hidden rounded-3xl aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shadow-2xl"
    >
      {/* Image skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
        <motion.div
          variants={shimmerVariants}
          animate="shimmer"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

      {/* Content skeleton */}
      <div className="relative z-30 flex flex-col justify-end h-full p-6">
        {/* Category skeleton */}
        <div className="inline-flex items-center gap-2 self-start bg-white/25 backdrop-blur-lg px-4 py-2 rounded-full mb-4 border border-white/40">
          <div className="w-3 h-3 rounded-full bg-white/60" />
          <div className="w-16 h-3 bg-white/60 rounded animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-white/80 rounded animate-pulse" />
          <div className="h-6 bg-white/60 rounded animate-pulse w-3/4" />
        </div>

        {/* Metadata skeleton */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white/60 rounded animate-pulse" />
            <div className="w-20 h-3 bg-white/60 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white/60 rounded animate-pulse" />
            <div className="w-16 h-3 bg-white/60 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Action button skeleton */}
      <div className="absolute top-4 right-4 z-40 p-3 bg-white/20 backdrop-blur-lg rounded-full">
        <div className="w-6 h-6 bg-white/60 rounded animate-pulse" />
      </div>

      {/* Progress bar skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-1/3 animate-pulse" />
      </div>
    </motion.div>
  );
}
