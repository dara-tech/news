"use client"

import { motion } from "framer-motion"
import { Clock, TrendingUp, Star, User, Eye, BookOpen, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

export interface SearchResult {
  _id: string
  title: { en: string; kh: string }
  description: { en: string; kh: string }
  content: { en: string; kh: string }
  slug: string
  thumbnail?: string
  category: {
    _id: string
    name: { en: string; kh: string }
    color?: string
    slug?: string
  }
  author: {
    _id: string
    username?: string
    email?: string
  }
  createdAt: string
  publishedAt?: string
  views: number
  isFeatured: boolean
  isBreaking: boolean
  tags: string[]
}

interface SearchResultItemProps {
  item: SearchResult
  lang: string
}

// Get localized text
const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, locale: string) => {
  if (typeof text === 'string') return text
  return text?.[locale === 'km' ? 'kh' : 'en'] || text?.en || ''
}

// Get author name
const getAuthorName = (author: { username?: string; email?: string } | undefined) => {
  return author?.username ||
    (author?.email ? author.email.split('@')[0] : 'Anonymous')
}

export const SearchResultItem = ({ item, lang }: SearchResultItemProps) => {
  const title = getLocalizedText(item.title, lang)
  const description = getLocalizedText(item.description, lang)
  const categoryName = getLocalizedText(item.category?.name, lang)
  const authorName = getAuthorName(item.author)
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/${lang}/news/${item.slug}`} className="block">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={title}
                fill
                sizes="96px"
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            {item.isFeatured && (
              <Badge className="absolute top-1 left-1 bg-yellow-500 text-white text-xs">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {item.isBreaking && (
              <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Breaking
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {item.category && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: item.category.color ? `${item.category.color}20` : undefined,
                    color: item.category.color || undefined
                  }}
                >
                  {categoryName}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>

            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.views} views
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
