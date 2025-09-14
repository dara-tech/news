"use client"

import { motion } from "framer-motion"
import { User, TrendingUp, Eye, Heart, Calendar, ExternalLink, Award, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import api from "@/lib/api"

interface Author {
  _id: string
  username: string
  email: string
  avatar?: string
  profileImage?: string
  role: string
  createdAt: string
  articleCount: number
  totalViews: number
  totalLikes: number
  avgViews: number
  latestArticle: string
  engagementScore: number
  recentArticles: Array<{
    id: string
    title: any
    description: any
    thumbnail?: string
    publishedAt: string
    views: number
    likes: number
    category: {
      _id: string
      name: any
      color?: string
      slug?: string
    }
  }>
}

interface TopAuthorsProps {
  lang: string
}

export default function TopAuthors({ lang }: TopAuthorsProps) {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopAuthors = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/news/top-authors?limit=6&lang=${lang}`)
        
        if (response.data.success) {
          setAuthors(response.data.data)
        } else {
          setError(response.data.message || 'Failed to fetch top authors')
        }
      } catch (err) {
        setError('Failed to fetch top authors')
        console.error('Error fetching top authors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopAuthors()
  }, [lang])

  const renderText = (text: string | { en: string; kh: string }) => {
    if (typeof text === 'string') return text
    return text[lang as keyof typeof text] || text.en || ''
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'kh' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Award className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Award className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800'
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800'
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800'
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800'
    }
  }

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lang === 'kh' ? 'អ្នកសរសេរកំពុល' : 'Top Authors'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {lang === 'kh' ? 'អ្នកសរសេរដែលមានអ្នកអានច្រើនបំផុត' : 'Most popular and engaging writers'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>
    )
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'អ្នកសរសេរកំពុល' : 'Top Authors'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {lang === 'kh' ? 'អ្នកសរសេរដែលមានអ្នកអានច្រើនបំផុត' : 'Most popular and engaging writers'}
          </p>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author, index) => (
          <motion.div
            key={author._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${getRankColor(index)} hover:shadow-xl transition-all duration-300 group`}>
              <CardContent className="p-6">
                {/* Author Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-md">
                      <Image
                        src={author.avatar || author.profileImage || '/placeholder.jpg'}
                        alt={author.username}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {getRankIcon(index)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {author.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {author.email}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {author.role}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-bold">{author.articleCount}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lang === 'kh' ? 'អត្ថបទ' : 'Articles'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                      <Eye className="h-4 w-4" />
                      <span className="font-bold">{formatNumber(author.totalViews)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lang === 'kh' ? 'មើល' : 'Views'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                      <Heart className="h-4 w-4" />
                      <span className="font-bold">{formatNumber(author.totalLikes)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lang === 'kh' ? 'ចូលចិត្ត' : 'Likes'}
                    </p>
                  </div>
                </div>

                {/* Recent Articles */}
                {author.recentArticles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {lang === 'kh' ? 'អត្ថបទថ្មីៗ' : 'Recent Articles'}
                    </h4>
                    {author.recentArticles.slice(0, 2).map((article) => (
                      <Link
                        key={article.id}
                        href={`/${lang}/news/${renderText(article.title).toLowerCase().replace(/\s+/g, '-')}`}
                        className="block p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors group/article"
                      >
                        <div className="flex gap-2">
                          {article.thumbnail && (
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={article.thumbnail}
                                alt={renderText(article.title)}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover/article:text-blue-600 dark:group-hover/article:text-blue-400 transition-colors">
                              {renderText(article.title)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(article.publishedAt)}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {article.views} {lang === 'kh' ? 'មើល' : 'views'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* View Profile Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href={`/${lang}/author/${author._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group/button"
                    >
                      <User className="h-4 w-4 mr-2 group-hover/button:scale-110 transition-transform" />
                      {lang === 'kh' ? 'មើលប្រវត្តិ' : 'View Profile'}
                      <ExternalLink className="h-3 w-3 ml-2 group-hover/button:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'kh' ? 'ចាប់ផ្តើមសរសេរជាមួយយើង' : 'Start Writing with Us'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {lang === 'kh' ? 'ចូលរួមជាមួយអ្នកសរសេរកំពុលរបស់យើង' : 'Join our community of talented writers and share your stories'}
          </p>
          <Link 
            href={`/${lang}/register`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Star className="h-4 w-4" />
            {lang === 'kh' ? 'ចាប់ផ្តើមសរសេរ' : 'Start Writing'}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </motion.section>
  )
}
