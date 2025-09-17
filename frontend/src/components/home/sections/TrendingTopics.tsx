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

        const response = await getTrendingTopics(lang, 14, '24h')
        
        if (response.success && response.data && response.data.recommendations) {
          // Transform API data to match our interface
          const transformedTopics: TrendingTopic[] = response.data.recommendations
            .slice(0, 14) // Limit to 14 items for better responsive layout
            .map((item: any, index: number) => {
              const title = typeof item.title === 'string' 
                ? item.title 
                : (item.title?.[lang] || item.title?.en || 'Untitled')
              
              // Truncate long titles for better mobile display
              const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title
              
              return {
                id: item._id || `trending-${index}`,
                title: truncatedTitle,
                category: item.category?.name?.[lang] || item.category?.name?.en || item.category || 'General',
                trend: item.recommendationScore > 60 ? 'up' : item.recommendationScore > 40 ? 'stable' : 'down',
                change: Math.round(item.recommendationScore || 0),
                posts: item.views || item.posts || 0,
                href: `/search?q=${encodeURIComponent(title)}`,
                color: ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'][index % 7]
              }
            })
          
          setTrendingTopics(transformedTopics)
        } else {
          // Fallback to mock data if API fails
          setTrendingTopics(mockData.slice(0, 14))
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
      className="mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'ប្រធានបទពេញនិយម' : 'Trending Topics'}
          </h2>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
          <Clock className="h-3 w-3 mr-1" />
          <span className="hidden xs:inline">Live</span>
        </Badge>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 auto-rows-fr">
          {[...Array(14)].map((_, index) => (
            <div key={index} className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300" />
                  <div className="h-3 w-12 sm:w-16 bg-gray-300 rounded" />
                </div>
                <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2" />
                <div className="h-3 bg-gray-300 rounded mb-2 sm:mb-3" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-8 sm:w-12 bg-gray-300 rounded" />
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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 auto-rows-fr">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="w-full"
              >
                <Link href={`/${lang}${topic.href}`} className="block group w-full">
                  <div className="relative p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-900/80 hover:border-gray-300/50 dark:hover:border-gray-700/50 hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                    {/* Trend indicator */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        topic.trend === 'up' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : topic.trend === 'down'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {getTrendIcon(topic.trend)}
                        <span className="hidden xs:inline">{topic.change > 0 ? '+' : ''}{topic.change}%</span>
                        <span className="xs:hidden">{topic.change > 0 ? '+' : ''}{topic.change}</span>
                      </div>
                    </div>

                    {/* Category dot */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${topic.color}`} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">
                        {topic.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight min-h-[2.5rem] sm:min-h-[3rem]">
                      {topic.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 truncate">
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{topic.posts.toLocaleString()}</span>
                      </span>
                      <Hash className="h-3 w-3 opacity-50 flex-shrink-0" />
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-200 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <Link 
              href={`/${lang}/trending`}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors group px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50"
            >
              <span className="hidden xs:inline">View all trending topics</span>
              <span className="xs:hidden">View all</span>
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </>
      )}
    </motion.section>
  )
}
