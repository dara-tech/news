"use client"

import type React from "react"
import { useMemo, useCallback, useRef } from "react"
import { ArrowRight, TrendingUp, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { Article, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BreakingNewsTicker } from "./BreakingNewsTicker"
import MainFeature from "./MainFeature"
import SecondaryFeatureGrid from "./SecondaryFeatureGrid"
import MoreStories from "./MoreStories"
import TrendingCategories from "./TrendingCategories"

interface HeroProps {
  breaking: Article[]
  featured: Article[]
  categories: Category[]
  locale: "en" | "kh"
}

const READERS_COUNT = 12847
function formatReaders(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

const Hero: React.FC<HeroProps> = ({ breaking = [], featured = [], categories = [], locale = "en" }) => {
  const router = useRouter()
  const tickerRef = useRef<{ pause: () => void; play: () => void }>(null)

  // Memoize derived values
  const { mainFeature, secondaryFeatures, trendingCategories, allCategories, moreStories } = useMemo(() => {
    const main = featured[0] || breaking[0] || null
    const secondaries = featured.slice(1, 5)
    
    // Get more stories for sidebar - use breaking news as fallback
    let moreStories = featured.slice(5, 9)
    if (moreStories.length < 4) {
      // If not enough featured articles, add breaking news
      const needed = 4 - moreStories.length
      const breakingForSidebar = breaking.slice(0, needed)
      moreStories = [...moreStories, ...breakingForSidebar]
    }
    
    const trending = categories.slice(0, 6)
    const remainingCategories = categories.slice(6)
    return {
      mainFeature: main,
      secondaryFeatures: secondaries,
      moreStories: moreStories,
      trendingCategories: trending,
      allCategories: remainingCategories,
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

  return (
    <section className="relative min-h-screen" aria-label="Featured content">
      {/* Breaking News */}
      {breaking.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          onMouseEnter={() => handleTickerHover(true)}
          onMouseLeave={() => handleTickerHover(false)}
          onFocus={() => handleTickerHover(true)}
          onBlur={() => handleTickerHover(false)}
          className="relative z-20"
        >
          <BreakingNewsTicker ref={tickerRef} articles={breaking} locale={locale} autoRotateInterval={6000} />
        </div>
      )}

      {/* Advanced Responsive Grid Layout */}
      <div className="container mx-auto px-2 sm:px-4 pt-4 sm:pt-8 md:pt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md"
        >
          <div className="flex items-center flex-wrap gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="font-medium text-sm sm:text-base">Live Coverage</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs sm:text-sm">Real-time updates</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1 sm:gap-2 text-xs">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span className="hidden sm:inline">Trending Now</span>
              <span className="sm:hidden">Trending</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 text-xs">
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>{formatReaders(READERS_COUNT)} <span className="hidden sm:inline">Reading</span></span>
            </Badge>
          </div>
        </motion.div>

        {/* Professional Hero Layout */}
        <div className="space-y-8 lg:space-y-12">
          {/* Main Feature - Hero Section */}
          {mainFeature && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <MainFeature article={mainFeature} locale={locale} />
            </motion.div>
          )}

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Featured Articles Section */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Featured Stories
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/news")}
                    className="text-primary hover:text-primary/80"
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                {secondaryFeatures.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {secondaryFeatures.slice(0, 4).map((article, index) => (
                      <motion.div
                        key={article._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      >
                        <SecondaryFeatureGrid articles={[article]} locale={locale} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                {/* More Stories */}
                <MoreStories articles={moreStories} locale={locale} />
                
                {/* Trending Categories */}
                <TrendingCategories categories={trendingCategories} locale={locale} />
              </motion.div>
            </aside>
          </div>
        </div>

        {/* All Categories Button (below grid, optional) */}
        {allCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center pt-4 sm:pt-8"
          >
            <Button
              variant="outline"
              size="default"
              className="group hover:scale-105 transform-gpu transition-all duration-300 bg-transparent w-full sm:w-auto"
              onClick={() => router.push("/news")}
            >
              <span className="text-sm sm:text-base">View All News</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Hero
