"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

interface LiveStats {
  activeUsers: number
  totalArticles: number
  totalViews: number
  lastUpdated: string
  status: 'healthy' | 'warning' | 'error'
  trending: {
    title: string
    views: number
  }[]
}

const LiveStatsBar = () => {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLiveStats = async () => {
    try {
      const response = await api.get('/admin/analytics/overview')
      const data = response.data

      const liveStats: LiveStats = {
        activeUsers: data.realTime?.activeUsers || 0,
        totalArticles: data.overview?.totalArticles || 0,
        totalViews: data.overview?.totalViews || 0,
        lastUpdated: new Date().toISOString(),
        status: data.realTime?.status === 'healthy' ? 'healthy' : 'warning',
        trending: data.trending?.articles?.slice(0, 3).map((article: any) => ({
          title: typeof article.title === 'string' ? article.title : article.title?.en || 'Article',
          views: article.views || 0
        })) || []
      }

      setStats(liveStats)
      setError(null)
    } catch (err) {
      setError('Failed to load stats')
    }
  }

  useEffect(() => {
    fetchLiveStats()
    const interval = setInterval(fetchLiveStats, 30000)
    return () => clearInterval(interval)
  }, [])
  
  if (error || !stats) return null

  const statusColor = stats.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md"
        >
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between py-1.5">
              {/* Status & Core Metrics */}
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                  <span className="text-neutral-600 dark:text-neutral-400 font-mono">
                    {stats.activeUsers} live
                  </span>
                </div>
                
                <div className="hidden sm:flex items-center gap-1 text-neutral-500 dark:text-neutral-500">
                  <span className="font-mono">{stats.totalViews.toLocaleString()}</span>
                  <span>views</span>
                </div>

                <div className="hidden md:flex items-center gap-1 text-neutral-500 dark:text-neutral-500">
                  <span className="font-mono">{stats.totalArticles}</span>
                  <span>articles</span>
                </div>
              </div>

              {/* Trending */}
              <div className="hidden lg:flex items-center gap-3">
                {stats.trending.length > 0 && (
                  <>
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">trending</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stats.trending.slice(0, 1).map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-neutral-900 dark:text-neutral-100 font-medium max-w-40 truncate">
                            {item.title}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-500 font-mono">
                            {item.views}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors text-xs px-1 h-auto"
              >
                ×
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LiveStatsBar
