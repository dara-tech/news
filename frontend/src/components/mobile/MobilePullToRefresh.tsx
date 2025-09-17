"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Check } from "lucide-react"
import { usePullToRefresh } from "@/hooks/usePullToRefresh"
import { cn } from "@/lib/utils"

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  className?: string
  threshold?: number
  enabled?: boolean
}

const MobilePullToRefresh = ({
  onRefresh,
  children,
  className,
  threshold = 80,
  enabled = true
}: MobilePullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh,
    progress,
    setElementRef,
    refresh
  } = usePullToRefresh({
    onRefresh,
    threshold,
    enabled
  })

  useEffect(() => {
    if (containerRef.current) {
      setElementRef(containerRef.current)
    }
  }, [setElementRef])

  const handleRefresh = async () => {
    await refresh()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "pull-to-refresh fixed left-1/2 z-50 flex items-center justify-center",
              "w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-lg",
              "transform -translate-x-1/2",
              isPulling ? "top-2" : "top-2"
            )}
            style={{
              top: Math.min(pullDistance * 0.5, 20)
            }}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
            >
              {isRefreshing ? (
                <RefreshCw className="h-5 w-5" />
              ) : canRefresh ? (
                <Check className="h-5 w-5" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              style={{
                width: `${progress * 100}%`
              }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Manual refresh button for testing */}
      {enabled && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh content"
          title="Refresh content"
          className={cn(
            "fixed top-4 right-4 z-40 p-2 rounded-full bg-primary text-primary-foreground",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "touchable"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </button>
      )}
    </div>
  )
}

export default MobilePullToRefresh
