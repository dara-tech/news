"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Hash, 
  ArrowUpRight, 
  Clock, 
  Filter, 
  SortAsc, 
  SortDesc,
  RefreshCw,
  AlertCircle,
  Calendar,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { getTrendingTopics } from '@/lib/api'

interface TrendingTopic {
  id: string
  title: string
  category: string
  trend: 'up' | 'down' | 'stable'
  change: number
  posts: number
  href: string
  color: string
  publishedAt?: string
  views?: number
  likes?: number
  comments?: number
}

interface TrendingPageClientProps {
  lang: string
}

export default function TrendingPageClient({ lang }: TrendingPageClientProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [sortBy, setSortBy] = useState('trending')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mock data as fallback
  const mockData: TrendingTopic[] = [
    {
      id: '1',
      title: 'AI Technology Revolution',
      category: 'Technology',
      trend: 'up',
      change: 24.5,
      posts: 1250,
      href: '/search?q=AI+Technology',
      color: 'bg-blue-500',
      publishedAt: '2024-01-15T10:30:00Z',
      views: 15420,
      likes: 892,
      comments: 156
    },
    {
      id: '2',
      title: 'Climate Change Solutions',
      category: 'Environment',
      trend: 'up',
      change: 18.2,
      posts: 890,
      href: '/search?q=Climate+Change',
      color: 'bg-green-500',
      publishedAt: '2024-01-14T15:45:00Z',
      views: 12300,
      likes: 654,
      comments: 89
    },
    {
      id: '3',
      title: 'Cryptocurrency Market',
      category: 'Finance',
      trend: 'down',
      change: -12.3,
      posts: 650,
      href: '/search?q=Cryptocurrency',
      color: 'bg-orange-500',
      publishedAt: '2024-01-13T09:20:00Z',
      views: 8900,
      likes: 234,
      comments: 45
    },
    {
      id: '4',
      title: 'Space Exploration Updates',
      category: 'Science',
      trend: 'up',
      change: 31.7,
      posts: 420,
      href: '/search?q=Space+Exploration',
      color: 'bg-purple-500',
      publishedAt: '2024-01-12T14:15:00Z',
      views: 11200,
      likes: 567,
      comments: 78
    },
    {
      id: '5',
      title: 'Health & Wellness Trends',
      category: 'Health',
      trend: 'stable',
      change: 2.1,
      posts: 1100,
      href: '/search?q=Health+Wellness',
      color: 'bg-pink-500',
      publishedAt: '2024-01-11T11:30:00Z',
      views: 9800,
      likes: 445,
      comments: 67
    },
    {
      id: '6',
      title: 'Renewable Energy Breakthrough',
      category: 'Environment',
      trend: 'up',
      change: 28.9,
      posts: 750,
      href: '/search?q=Renewable+Energy',
      color: 'bg-emerald-500',
      publishedAt: '2024-01-10T16:20:00Z',
      views: 13500,
      likes: 723,
      comments: 92
    },
    {
      id: '7',
      title: 'Digital Privacy Concerns',
      category: 'Technology',
      trend: 'up',
      change: 15.6,
      posts: 680,
      href: '/search?q=Digital+Privacy',
      color: 'bg-indigo-500',
      publishedAt: '2024-01-09T13:45:00Z',
      views: 10200,
      likes: 389,
      comments: 56
    },
    {
      id: '8',
      title: 'Global Economic Outlook',
      category: 'Finance',
      trend: 'down',
      change: -8.7,
      posts: 920,
      href: '/search?q=Global+Economy',
      color: 'bg-red-500',
      publishedAt: '2024-01-08T08:30:00Z',
      views: 15600,
      likes: 298,
      comments: 34
    }
  ]

  // Fetch trending topics from API
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await getTrendingTopics(lang, 20, timeRange)
        
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
            color: ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-red-500'][index % 8],
            publishedAt: item.publishedAt,
            views: item.views,
            likes: item.likes || 0,
            comments: item.comments || 0
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
  }, [lang, timeRange])

  // Sort topics based on selected criteria
  const sortedTopics = [...trendingTopics].sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortBy) {
      case 'trending':
        aValue = a.change
        bValue = b.change
        break
      case 'posts':
        aValue = a.posts
        bValue = b.posts
        break
      case 'views':
        aValue = a.views || 0
        bValue = b.views || 0
        break
      case 'likes':
        aValue = a.likes || 0
        bValue = b.likes || 0
        break
      case 'comments':
        aValue = a.comments || 0
        bValue = b.comments || 0
        break
      default:
        aValue = a.change
        bValue = b.change
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowUpRight className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {lang === 'kh' ? 'ប្រធានបទពេញនិយម' : 'Trending Topics'}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {lang === 'kh' 
              ? 'ស្វែងរកប្រធានបទដែលកំពុងពេញនិយមបំផុតនៅពេលនេះ'
              : 'Discover the most popular and trending topics right now'
            }
          </p>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {lang === 'kh' ? 'តម្រង់ និងរៀបចំ' : 'Filters & Sort'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Time Range Filter */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">{lang === 'kh' ? '1 ម៉ោង' : '1 Hour'}</SelectItem>
                      <SelectItem value="24h">{lang === 'kh' ? '24 ម៉ោង' : '24 Hours'}</SelectItem>
                      <SelectItem value="7d">{lang === 'kh' ? '7 ថ្ងៃ' : '7 Days'}</SelectItem>
                      <SelectItem value="30d">{lang === 'kh' ? '30 ថ្ងៃ' : '30 Days'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">{lang === 'kh' ? 'ពេញនិយម' : 'Trending'}</SelectItem>
                      <SelectItem value="posts">{lang === 'kh' ? 'ប្រកាស' : 'Posts'}</SelectItem>
                      <SelectItem value="views">{lang === 'kh' ? 'មើល' : 'Views'}</SelectItem>
                      <SelectItem value="likes">{lang === 'kh' ? 'ចូលចិត្ត' : 'Likes'}</SelectItem>
                      <SelectItem value="comments">{lang === 'kh' ? 'មតិ' : 'Comments'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-2"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  {sortOrder === 'asc' ? (lang === 'kh' ? 'ឡើង' : 'Ascending') : (lang === 'kh' ? 'ចុះ' : 'Descending')}
                </Button>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {lang === 'kh' ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="border-0 shadow-lg">
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-5 w-16 bg-gray-300 rounded" />
                      <div className="h-4 w-20 bg-gray-300 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-3/4" />
                      <div className="h-3 bg-gray-300 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {lang === 'kh' ? 'មានបញ្ហា' : 'Something went wrong'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              {lang === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {sortedTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <Link href={`/${lang}${topic.href}`} className="h-full flex flex-col">
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

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {topic.title}
                      </h3>

                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-xs">
                          {topic.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          {topic.posts.toLocaleString()}
                        </span>
                      </div>

                      {/* Engagement Stats */}
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{(topic.views || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{(topic.likes || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{(topic.comments || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {topic.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(topic.publishedAt)}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sortedTopics.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {lang === 'kh' ? 'មិនមានប្រធានបទពេញនិយម' : 'No trending topics found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {lang === 'kh' 
                ? 'សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ'
                : 'Please try again later or check back soon'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
