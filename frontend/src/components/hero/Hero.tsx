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
  const { mainFeature, secondaryFeatures, trendingCategories, allCategories } = useMemo(() => {
    const main = featured[0] || breaking[0] || null
    const secondaries = featured.slice(1, 5)
    const trending = categories.slice(0, 6)
    const remainingCategories = categories.slice(6)
    return {
      mainFeature: main,
      secondaryFeatures: secondaries,
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-border/20 shadow-lg sm:shadow-xl bg-card/60 backdrop-blur-md"
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

        {/* Main Advanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left: Main & Secondary Features */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-8">
            {/* Main Feature */}
            {mainFeature && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border bg-gradient-to-br from-blue-100/60 to-white/80"
              >
                <MainFeature article={mainFeature} locale={locale} />
              </motion.div>
            )}
            {/* Secondary Features: horizontal scroll on mobile, grid on desktop */}
            {secondaryFeatures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full"
              >
                <div className="flex lg:grid lg:grid-cols-1 xl:grid-cols-1 gap-3 sm:gap-6 overflow-x-auto sm:overflow-x-visible pb-2 scrollbar-thin scrollbar-thumb-blue-200">
                  <SecondaryFeatureGrid articles={secondaryFeatures} locale={locale} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar (sticky on desktop) */}
          <aside className="lg:col-span-1 flex flex-col gap-4 sm:gap-7 lg:sticky lg:top-24 lg:h-fit">
            {/* More Stories - Minimalistic & Advanced */}
            <MoreStories articles={secondaryFeatures} locale={locale} />
            {/* Trending Categories - Minimalistic & Advanced */}
            <TrendingCategories categories={trendingCategories} locale={locale} />
          </aside>
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
