"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, Eye, Clock, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

      // Transform the data into our LiveStats format
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
      console.error('Failed to fetch live stats:', err)
      setError('Failed to load stats')
    }
  }

  useEffect(() => {
    fetchLiveStats()
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (error || !stats) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10'
      case 'warning': return 'bg-yellow-500/10'
      case 'error': return 'bg-red-500/10'
      default: return 'bg-gray-500/10'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm border-b border-border/30"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-sm">
              {/* Left side - Live indicators */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusBg(stats.status)} animate-pulse`}>
                    <div className={`w-full h-full rounded-full ${getStatusColor(stats.status)} animate-ping`}></div>
                  </div>
                  <span className="text-muted-foreground">Live</span>
                </div>

                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{stats.activeUsers}</span>
                  <span className="text-muted-foreground">active</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
                  <span className="text-muted-foreground">views</span>
                </div>

                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{stats.totalArticles}</span>
                  <span className="text-muted-foreground">articles</span>
                </div>
              </div>

              {/* Center - Trending */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Trending:</span>
                </div>
                <div className="flex items-center gap-3">
                  {stats.trending.slice(0, 2).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-1"
                    >
                      <span className="text-foreground font-medium truncate max-w-32">
                        {item.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.views}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right side - Last updated & close */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    {new Date(stats.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Hide stats bar"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LiveStatsBar
