"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationProgress } from '@/hooks/useNavigationProgress'

interface NavigationProgressProps {
  className?: string
}

export default function NavigationProgress({ className = '' }: NavigationProgressProps) {
  const { isLoading, progress } = useNavigationProgress()

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-0 left-0 right-0 z-[60] ${className}`}
        >
          {/* Progress bar container with enhanced styling */}
          <div className="relative h-1 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 overflow-hidden">
            {/* Main progress bar */}
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary shadow-lg shadow-primary/40"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
            />
            
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ 
                x: ['-48px', '100vw'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.1, 1]
              }}
            />
            
            {/* Secondary shimmer for depth */}
            <motion.div
              className="absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ 
                x: ['-24px', '100vw'],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.2, 1]
              }}
            />
          </div>
          
          {/* Enhanced glow effect */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-sm" />
          
          {/* Subtle border highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
