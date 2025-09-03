"use client"

import { motion } from "framer-motion"
import { Clock, Eye, TrendingUp, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EnterpriseCard } from "./enterprise-card"
import Link from "next/link"
import Image from "next/image"

interface NewsArticle {
  id: string
  title: string | { en: string; kh: string }
  description: string | { en: string; kh: string }
  thumbnail?: string
  category: {
    name: string | { en: string; kh: string }
    color?: string
  }
  publishedAt: string
  views: number
  isFeatured?: boolean
  isBreaking?: boolean
  slug: string
}

interface EnterpriseNewsGridProps {
  articles: NewsArticle[]
  lang: string
  title?: string
}

export const EnterpriseNewsGrid = ({
  articles,
  lang,
  title = "Latest Intelligence"
}: EnterpriseNewsGridProps) => {
  const renderText = (text: string | { en: string; kh: string }) => {
    if (typeof text === 'string') return text
    return text[lang as keyof typeof text] || text.en || ''
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const featuredArticle = articles.find(article => article.isFeatured) || articles[0]
  const regularArticles = articles.filter(article => article.id !== featuredArticle?.id).slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay informed with real-time updates and in-depth analysis from trusted sources worldwide.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <EnterpriseCard className="h-full" gradient>
              <div className="relative h-80 lg:h-96 overflow-hidden rounded-t-2xl">
                {featuredArticle.thumbnail && (
                  <Image
                    src={featuredArticle.thumbnail}
                    alt={renderText(featuredArticle.title)}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {featuredArticle.isBreaking && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Breaking
                    </Badge>
                  )}
                  <Badge 
                    className="border-0 text-white"
                    style={{ 
                      backgroundColor: featuredArticle.category.color || '#3b82f6',
                    }}
                  >
                    {renderText(featuredArticle.category.name)}
                  </Badge>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-3 line-clamp-2">
                    {renderText(featuredArticle.title)}
                  </h3>
                  <p className="text-gray-200 mb-4 line-clamp-2">
                    {renderText(featuredArticle.description)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(featuredArticle.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {featuredArticle.views.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      asChild
                    >
                      <Link href={`/${lang}/news/${featuredArticle.slug}`}>
                        Read More
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </EnterpriseCard>
          </motion.div>
        )}

        {/* Regular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {regularArticles.map((article, index) => (
            <EnterpriseCard key={article.id} className="p-0" hover>
              <Link href={`/${lang}/news/${article.slug}`} className="block">
                <div className="flex gap-4 p-4">
                  {article.thumbnail && (
                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={article.thumbnail}
                        alt={renderText(article.title)}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${article.category.color}20`,
                          color: article.category.color,
                          borderColor: `${article.category.color}30`
                        }}
                      >
                        {renderText(article.category.name)}
                      </Badge>
                      {article.isBreaking && (
                        <Badge className="bg-red-500 text-white text-xs border-0">
                          Breaking
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {renderText(article.title)}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </EnterpriseCard>
          ))}
          
          {/* View All Button */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full border-2 hover:bg-primary/5 hover:border-primary/30"
              asChild
            >
              <Link href={`/${lang}/news`}>
                View All News
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Export ArrowRight for use in the component
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
