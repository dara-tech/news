"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, TrendingUp, Eye, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import api from '@/lib/api'

interface Author {
  _id: string
  username: string
  avatar?: string
  profileImage?: string
  articleCount: number
  totalViews: number
  totalLikes: number
  engagementScore: number
  recentArticles: Array<{
    id: string
    title: { en: string; kh: string }
    views: number
    likes: number
  }>
}

interface TopAuthorsProps {
  locale: 'en' | 'kh'
  limit?: number
}

const TopAuthors: React.FC<TopAuthorsProps> = ({ locale = 'en', limit = 5 }) => {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopAuthors = async () => {
      try {
        const response = await api.get('/news/top-authors', {
          params: { limit, lang: locale }
        })
        
        if (response.data?.success && response.data?.data) {
          setAuthors(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching top authors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopAuthors()
  }, [limit, locale])

  if (loading) {
    return (
      <div className="bg-card/50 rounded-lg border border-border/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-lg">
            {locale === 'kh' ? 'អ្នកសរសេរល្អបំផុត' : 'Top Authors'}
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (authors.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card/50 rounded-lg border border-border/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-lg">
          {locale === 'kh' ? 'អ្នកសរសេរល្អបំផុត' : 'Top Authors'}
        </h3>
      </div>
      
      <div className="space-y-3">
        {authors.slice(0, limit).map((author, index) => (
          <motion.div
            key={author._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            <Link 
              href={`/author/${author.username}`}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={author.avatar || author.profileImage} 
                    alt={author.username}
                  />
                  <AvatarFallback className="text-xs">
                    {author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {author.username}
                  </p>
                  {index < 3 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      #{index + 1}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{author.articleCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{author.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{author.totalLikes}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/30">
        <Link 
          href="/authors"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          {locale === 'kh' ? 'មើលអ្នកសរសេរទាំងអស់' : 'View all authors'}
          <TrendingUp className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}

export default TopAuthors
