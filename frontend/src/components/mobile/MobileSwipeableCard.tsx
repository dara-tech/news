"use client"

import { useRef, useState } from "react"
import { motion, PanInfo } from "framer-motion"
import { useTouchGestures } from "@/hooks/useTouchGestures"
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations"
import { cn } from "@/lib/utils"

interface MobileSwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', distance: number, velocity: number) => void
  className?: string
  threshold?: number
  velocityThreshold?: number
  enableHapticFeedback?: boolean
  showSwipeIndicator?: boolean
}

const MobileSwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipe,
  className,
  threshold = 50,
  velocityThreshold = 0.3,
  enableHapticFeedback = true,
  showSwipeIndicator = true
}: MobileSwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  const [swipeProgress, setSwipeProgress] = useState(0)
  
  const { isMobile, triggerHapticFeedback } = useMobileOptimizations()
  const cardRef = useRef<HTMLDivElement>(null)

  const { gestureState, touchHandlers } = useTouchGestures({
    onSwipeLeft: () => {
      if (enableHapticFeedback) triggerHapticFeedback('medium')
      onSwipeLeft?.()
    },
    onSwipeRight: () => {
      if (enableHapticFeedback) triggerHapticFeedback('medium')
      onSwipeRight?.()
    },
    onSwipeUp: () => {
      if (enableHapticFeedback) triggerHapticFeedback('medium')
      onSwipeUp?.()
    },
    onSwipeDown: () => {
      if (enableHapticFeedback) triggerHapticFeedback('medium')
      onSwipeDown?.()
    },
    onSwipe: (direction, distance, velocity) => {
      if (enableHapticFeedback) triggerHapticFeedback('heavy')
      onSwipe?.(direction, distance, velocity)
    },
    threshold,
    velocityThreshold
  })

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDrag = (event: any, info: PanInfo) => {
    const { offset } = info
    const absX = Math.abs(offset.x)
    const absY = Math.abs(offset.y)
    
    if (absX > absY) {
      setSwipeDirection(offset.x > 0 ? 'right' : 'left')
      setSwipeProgress(Math.min(absX / threshold, 1))
    } else {
      setSwipeDirection(offset.y > 0 ? 'down' : 'up')
      setSwipeProgress(Math.min(absY / threshold, 1))
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setSwipeDirection(null)
    setSwipeProgress(0)
  }

  if (!isMobile) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        ref={cardRef}
        drag={isMobile}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTouchStart={touchHandlers.onTouchStart}
        onTouchMove={touchHandlers.onTouchMove}
        onTouchEnd={touchHandlers.onTouchEnd}
        className={cn(
          "touchable relative overflow-hidden",
          "transition-all duration-200 ease-out",
          isDragging && "scale-[0.98] shadow-lg"
        )}
      >
        {children}

        {/* Swipe indicator */}
        {showSwipeIndicator && isDragging && swipeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-primary/10 backdrop-blur-sm",
              "pointer-events-none"
            )}
            style={{
              opacity: swipeProgress * 0.8
            }}
          >
            <motion.div
              className={cn(
                "flex items-center justify-center w-16 h-16 rounded-full",
                "bg-primary text-primary-foreground shadow-lg",
                swipeDirection === 'left' && "ml-[-50%]",
                swipeDirection === 'right' && "ml-[50%]",
                swipeDirection === 'up' && "mt-[-50%]",
                swipeDirection === 'down' && "mt-[50%]"
              )}
              animate={{
                scale: 0.8 + (swipeProgress * 0.2)
              }}
            >
              <motion.div
                animate={{
                  rotate: swipeDirection === 'left' ? -90 : 
                         swipeDirection === 'right' ? 90 :
                         swipeDirection === 'up' ? 0 : 180
                }}
                className="text-2xl"
              >
                {swipeDirection === 'left' && '←'}
                {swipeDirection === 'right' && '→'}
                {swipeDirection === 'up' && '↑'}
                {swipeDirection === 'down' && '↓'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Swipe progress bar */}
        {isDragging && swipeDirection && (
          <motion.div
            className={cn(
              "absolute h-1 bg-primary",
              swipeDirection === 'left' && "left-0 top-0 bottom-0 w-1",
              swipeDirection === 'right' && "right-0 top-0 bottom-0 w-1",
              swipeDirection === 'up' && "top-0 left-0 right-0 h-1",
              swipeDirection === 'down' && "bottom-0 left-0 right-0 h-1"
            )}
            style={{
              opacity: swipeProgress
            }}
          />
        )}
      </motion.div>
    </div>
  )
}

export default MobileSwipeableCard

