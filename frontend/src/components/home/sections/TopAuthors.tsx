"use client"

import { motion } from "framer-motion"
import { User, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  totalComments: number
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
    comments: number
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
        const response = await api.get(`/news/top-authors?limit=3&lang=${lang}`)
        
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

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-600">
            <User className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'អ្នកសរសេរកំពុល' : 'Top Authors'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
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
        className="mb-12"
      >
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600">
            <User className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {lang === 'kh' ? 'អ្នកសរសេរកំពុល' : 'Top Authors'}
          </h2>
        </div>
        <Link 
          href={`/${lang}/authors`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {lang === 'kh' ? 'មើលទាំងអស់' : 'View All'}
        </Link>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {authors.map((author, index) => (
          <motion.div
            key={author._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
             <Link href={`/${lang}/author/${author._id}`}>
              <Card className="hover:shadow-md transition-shadow duration-200 border-gray-200 dark:border-gray-700 cursor-pointer">
                <CardContent className="p-4">
                  {/* Author Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700">
                        <Image
                          src={author.avatar || author.profileImage || '/placeholder.jpg'}
                          alt={author.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {author.username}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {author.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-semibold text-sm">{author.articleCount}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lang === 'kh' ? 'អត្ថបទ' : 'Articles'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-semibold text-sm">{formatNumber(author.totalViews)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lang === 'kh' ? 'មើល' : 'Views'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
                        <Heart className="h-3 w-3" />
                        <span className="font-semibold text-sm">{formatNumber(author.totalLikes)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lang === 'kh' ? 'ចូលចិត្ត' : 'Likes'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
                        <MessageCircle className="h-3 w-3" />
                        <span className="font-semibold text-sm">{formatNumber(author.totalComments || 0)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {lang === 'kh' ? 'មតិ' : 'Comments'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
