"use client"

import { motion } from "framer-motion"
import { Play, Clock, Eye, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface VideoNewsItem {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: number
  publishedAt: string
  category: string
  isLive?: boolean
  isFeatured?: boolean
  href: string
}

interface VideoNewsProps {
  lang: string
  realData?: VideoNewsItem[]
}

export default function VideoNews({ lang, realData }: VideoNewsProps) {
  // Use real data if provided, otherwise fallback to mock data
  const videoNews = realData || [
    {
      id: '1',
      title: 'Breaking: Major Economic Update',
      description: 'Latest developments in the global economy and market trends',
      thumbnail: '/placeholder.jpg',
      duration: '5:32',
      views: 125000,
      publishedAt: '2024-01-15T10:30:00Z',
      category: 'Business',
      isLive: true,
      isFeatured: true,
      href: '/video/breaking-economic-update'
    },
    {
      id: '2',
      title: 'Technology Innovation Summit',
      description: 'Key insights from the annual tech conference',
      thumbnail: '/placeholder.jpg',
      duration: '12:45',
      views: 89000,
      publishedAt: '2024-01-14T15:20:00Z',
      category: 'Technology',
      isFeatured: true,
      href: '/video/tech-innovation-summit'
    },
    {
      id: '3',
      title: 'Climate Change Report',
      description: 'New findings on environmental impact and solutions',
      thumbnail: '/placeholder.jpg',
      duration: '8:15',
      views: 67000,
      publishedAt: '2024-01-14T09:15:00Z',
      category: 'Environment',
      href: '/video/climate-change-report'
    },
    {
      id: '4',
      title: 'Sports Highlights',
      description: 'Top moments from this week\'s sporting events',
      thumbnail: '/placeholder.jpg',
      duration: '6:30',
      views: 45000,
      publishedAt: '2024-01-13T18:45:00Z',
      category: 'Sports',
      href: '/video/sports-highlights'
    }
  ]
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500">
            <Play className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'វីដេអូព័ត៌មាន' : 'Video News'}
          </h2>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {lang === 'kh' ? 'ពេញនិយម' : 'Trending'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Video */}
        {videoNews.filter(video => video.isFeatured).map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/${lang}${video.href}`} className="block">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-6 w-6 text-gray-900 dark:text-white ml-1" />
                      </div>
                    </div>

                    {/* Live Badge */}
                    {video.isLive && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          LIVE
                        </Badge>
                      </div>
                    )}

                    {/* Duration */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.duration}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90">
                        {video.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatViews(video.views)} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Other Videos */}
        {videoNews.filter(video => !video.isFeatured).map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <CardContent className="p-0">
                <Link href={`/${lang}${video.href}`} className="block">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-4 w-4 text-gray-900 dark:text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                        {video.duration}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs bg-white/90 dark:bg-gray-800/90">
                        {video.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatViews(video.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link 
          href={`/${lang}/videos`}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          {lang === 'kh' ? 'មើលវីដេអូទាំងអស់' : 'View All Videos'}
          <Play className="h-4 w-4" />
        </Link>
      </div>
    </motion.section>
  )
}
