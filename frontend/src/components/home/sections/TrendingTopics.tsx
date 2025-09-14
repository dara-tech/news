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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {lang === 'kh' ? 'ប្រធានបទពេញនិយម' : 'Trending Topics'}
        </h2>
        <Badge variant="secondary" className="ml-auto">
          <Clock className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <div className="h-4 w-4 bg-gray-300 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-gray-300 rounded" />
                  </div>
                  <div className="h-6 bg-gray-300 rounded mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-16 bg-gray-300 rounded" />
                    <div className="h-4 w-20 bg-gray-300 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <CardContent className="p-6">
                    <Link href={`/${lang}${topic.href}`} className="block">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${topic.color}`} />
                          <Hash className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(topic.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(topic.trend)}`}>
                            {topic.change > 0 ? '+' : ''}{topic.change}%
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {topic.title}
                      </h3>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {topic.category}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {topic.posts.toLocaleString()} posts
                        </span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link 
              href={`/${lang}/trending`}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              View All Trending Topics
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </motion.section>
  )
}
