"use client"

import React, { useMemo, useCallback, useRef, useState } from "react"
import { ArrowRight, Clock, Globe, ChevronRight, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { Article, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BreakingNewsTicker } from "./BreakingNewsTicker"
import MainFeature from "./MainFeature"
import SecondaryFeatureGrid from "./SecondaryFeatureGrid"
import MoreStories from "./MoreStories"
import TrendingCategories from "./TrendingCategories"
import TopAuthors from "./TopAuthors"

interface HeroProps {
  breaking: Article[]
  featured: Article[]
  categories: Category[]
  locale: "en" | "kh"
}

const Hero: React.FC<HeroProps> = ({ breaking = [], featured = [], categories = [], locale = "en" }) => {
  const router = useRouter()
  const tickerRef = useRef<{ pause: () => void; play: () => void }>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasError, setHasError] = useState(false)

  // Error boundary for client-side errors
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Hero component error:', error)
      setHasError(true)
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Memoize derived values
  const { mainFeature, secondaryFeatures, trendingCategories, moreStories, latestNews } = useMemo(() => {
    const main = featured[0] || breaking[0] || null
    const secondaries = featured.slice(1, 6)
    const latest = [...featured, ...breaking].slice(0, 8)
    
    const trending = categories.slice(0, 8)
    return {
      mainFeature: main,
      secondaryFeatures: secondaries,
      moreStories: latest.slice(4, 8),
      trendingCategories: trending,
      latestNews: latest,
    }
  }, [breaking, featured, categories])

  // Ticker hover handler
  const handleTickerHover = useCallback((isHovering: boolean) => {
    if (!tickerRef.current) return
    if (isHovering) {
      tickerRef.current.pause()
    } else {
      tickerRef.current.play()
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale === 'kh' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Phnom_Penh'
    })
  }

  // Error fallback
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load content</h2>
          <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breaking News Ticker */}
      {breaking.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          onMouseEnter={() => handleTickerHover(true)}
          onMouseLeave={() => handleTickerHover(false)}
          className="relative z-20"
        >
          <BreakingNewsTicker ref={tickerRef} articles={breaking} locale={locale} autoRotateInterval={6000} />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto lg:px-8 py-8">
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-4 border-b border-border/30 mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>{locale === 'kh' ? 'កម្ពុជា' : 'Cambodia'}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(locale === 'kh' ? 'km-KH' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </motion.div>

        {/* Main Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {/* Main Feature Story */}
            {mainFeature && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <MainFeature article={mainFeature} locale={locale} />
              </motion.div>
            )}

            {/* Secondary Stories Grid */}
            {secondaryFeatures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {locale === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${locale}/news`)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {locale === 'kh' ? 'មើលទាំងអស់' : 'View All'}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {secondaryFeatures.slice(0, 4).map((article, index) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <SecondaryFeatureGrid articles={[article]} locale={locale} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Top Authors */}
              <TopAuthors locale={locale} limit={5} />
              
              {/* Latest Stories */}
              <div className="bg-card/50 rounded-lg border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {locale === 'kh' ? 'ព័ត៌មានថ្មី' : 'Latest Stories'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${locale}/news`)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {locale === 'kh' ? 'ទាំងអស់' : 'All'}
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {moreStories.slice(0, 4).map((article, index) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="group"
                    >
                      <Link
                        href={`/${locale}/news/${article.slug?.[locale] || article._id}`}
                        className="block p-3 rounded-lg hover:bg-muted/30 transition-colors border-l-2 border-transparent hover:border-primary/50"
                      >
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {typeof article.title === 'string' ? article.title : article.title?.[locale] || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.views || 0} {locale === 'kh' ? 'មើល' : 'views'}</span>
                          <span>•</span>
                          <span>
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                              locale === 'kh' ? 'km-KH' : 'en-US'
                            )}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Categories */}
              <div className="bg-card/50 rounded-lg border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {locale === 'kh' ? 'ប្រភេទព័ត៌មាន' : 'Categories'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${locale}/categories`)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {locale === 'kh' ? 'ទាំងអស់' : 'All'}
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {trendingCategories.slice(0, 8).map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <Link
                        href={`/${locale}/category/${category.slug?.[locale] || category.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted/30 transition-colors text-center"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs font-medium">
                          {typeof category.name === 'string' ? category.name : category.name?.[locale] || 'Category'}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Hero
