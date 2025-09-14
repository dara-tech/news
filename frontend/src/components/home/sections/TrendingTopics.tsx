"use client"

import { motion } from "framer-motion"
import { TrendingUp, Hash, ArrowUpRight, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getTrendingTopics } from "@/lib/api"

interface TrendingTopic {
  id: string
  title: string
  category: string
  trend: 'up' | 'down' | 'stable'
  change: number
  posts: number
  href: string
  color: string
}

interface TrendingTopicsProps {
  lang: string
  realData?: TrendingTopic[]
}

export default function TrendingTopics({ lang, realData }: TrendingTopicsProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data as fallback
  const mockData: TrendingTopic[] = [
    {
      id: '1',
      title: 'AI Technology',
      category: 'Technology',
      trend: 'up',
      change: 24.5,
      posts: 1250,
      href: '/search?q=AI+Technology',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Climate Change',
      category: 'Environment',
      trend: 'up',
      change: 18.2,
      posts: 890,
      href: '/search?q=Climate+Change',
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: 'Cryptocurrency',
      category: 'Finance',
      trend: 'down',
      change: -12.3,
      posts: 650,
      href: '/search?q=Cryptocurrency',
      color: 'bg-orange-500'
    },
    {
      id: '4',
      title: 'Space Exploration',
      category: 'Science',
      trend: 'up',
      change: 31.7,
      posts: 420,
      href: '/search?q=Space+Exploration',
      color: 'bg-purple-500'
    },
    {
      id: '5',
      title: 'Health & Wellness',
      category: 'Health',
      trend: 'stable',
      change: 2.1,
      posts: 1100,
      href: '/search?q=Health+Wellness',
      color: 'bg-pink-500'
    }
  ]

  // Fetch trending topics from API
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Use real data if provided, otherwise fetch from API
        if (realData) {
          setTrendingTopics(realData)
          setIsLoading(false)
          return
        }

        const response = await getTrendingTopics(lang, 10, '24h')
        
        if (response.success && response.data && response.data.recommendations) {
          // Transform API data to match our interface
          const transformedTopics: TrendingTopic[] = response.data.recommendations.map((item: any, index: number) => ({
            id: item._id || `trending-${index}`,
            title: typeof item.title === 'string' ? item.title : (item.title?.[lang] || item.title?.en || 'Untitled'),
            category: item.category || 'General',
            trend: item.recommendationScore > 50 ? 'up' : item.recommendationScore > 30 ? 'stable' : 'down',
            change: Math.round(item.recommendationScore || 0),
            posts: item.views || 0,
            href: `/search?q=${encodeURIComponent(typeof item.title === 'string' ? item.title : (item.title?.[lang] || item.title?.en || ''))}`,
            color: ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'][index % 5]
          }))
          
          setTrendingTopics(transformedTopics)
        } else {
          // Fallback to mock data if API fails
          setTrendingTopics(mockData)
        }
      } catch (err) {
        console.error('Error fetching trending topics:', err)
        setError('Failed to load trending topics')
        // Fallback to mock data on error
        setTrendingTopics(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingTopics()
  }, [lang, realData])
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-3 w-3 text-green-500" />
      case 'down':
        return <ArrowUpRight className="h-3 w-3 text-red-500 rotate-180" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'ប្រធានបទពេញនិយម' : 'Trending Topics'}
          </h2>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs px-2 py-1">
          <Clock className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="h-3 w-16 bg-gray-300 rounded" />
                </div>
                <div className="h-4 bg-gray-300 rounded mb-2" />
                <div className="h-3 bg-gray-300 rounded mb-3" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-12 bg-gray-300 rounded" />
                  <div className="h-3 w-3 bg-gray-300 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/${lang}${topic.href}`} className="block group">
                  <div className="relative p-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 hover:border-gray-300/50 dark:hover:border-gray-700/50 hover:shadow-md transition-all duration-200 group-hover:scale-[1.02]">
                    {/* Trend indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        topic.trend === 'up' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : topic.trend === 'down'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {getTrendIcon(topic.trend)}
                        <span>{topic.change > 0 ? '+' : ''}{topic.change}%</span>
                      </div>
                    </div>

                    {/* Category dot */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${topic.color}`} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {topic.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {topic.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {topic.posts.toLocaleString()}
                      </span>
                      <Hash className="h-3 w-3 opacity-50" />
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-200 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link 
              href={`/${lang}/trending`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors group"
            >
              View all trending topics
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </>
      )}
    </motion.section>
  )
}
