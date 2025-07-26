"use client"

import type React from "react"
import { useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Globe, TrendingUp, Eye, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { Article, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BreakingNewsTicker } from "./BreakingNewsTicker"
import MainFeature from "./MainFeature"
import SecondaryFeatureGrid from "./SecondaryFeatureGrid"

// Helper to get localized string or fallback
type LocalizedString = string | Record<string, string | undefined>
function getLocalizedString(str: LocalizedString, locale: "en" | "kh"): string {
  if (typeof str === "string") return str
  if (str && typeof str === "object") {
    return str[locale] || str["en"] || Object.values(str)[0] || ""
  }
  return ""
}

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
    <section className="relative min-h-screen " aria-label="Featured content">
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
      <div className="container mx-auto px-4 pt-8 md:pt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 rounded-2xl border shadow-lg bg-white/80 backdrop-blur"
        >
          <div className="flex items-center flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="font-medium">Live Coverage</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Real-time updates</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span>Trending Now</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>{formatReaders(READERS_COUNT)} Reading</span>
            </Badge>
          </div>
        </motion.div>

        {/* Main Advanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main & Secondary Features */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Main Feature */}
            {mainFeature && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border bg-gradient-to-br from-blue-100/60 to-white/80"
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
                <div className="flex lg:grid lg:grid-cols-1 xl:grid-cols-1 gap-6  pb-2 scrollbar-thin scrollbar-thumb-blue-200">
                  <SecondaryFeatureGrid articles={secondaryFeatures} locale={locale} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar (sticky on desktop) */}
          <aside className="lg:col-span-1 flex flex-col gap-7 sticky top-24 h-fit">
            {/* More Stories - Minimalistic & Advanced */}
            <div className="bg-white/95 rounded-2xl border border-neutral-200 shadow-sm p-5">
              <h3 className="font-semibold text-base mb-3 text-neutral-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                More Stories
              </h3>
              <div className="space-y-3">
                {secondaryFeatures.map((article, idx) => (
                  <Link
                    key={article._id || idx}
                    href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug || article._id}`}
                    className="block group rounded-lg transition-all duration-200 hover:bg-neutral-50 px-2 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                        <Globe className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm group-hover:text-blue-700 transition-colors line-clamp-2">
                          {getLocalizedString(article.title, locale)}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                          {getLocalizedString(article.category?.name, locale)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Trending Categories - Minimalistic & Advanced */}
            {trendingCategories.length > 0 && (
              <div className="bg-white/95 rounded-2xl border border-neutral-200 shadow-sm p-5">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-neutral-900 tracking-tight">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Trending Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingCategories.map((category) => {
                    const articleCount = category.articlesCount ?? 0
                    const categoryName = getLocalizedString(category.name as LocalizedString, locale) || "Uncategorized"
                    const categorySlug = typeof category.slug === "string" ? category.slug : category._id
                    const categoryColor = category.color || "#3b82f6"
                    return (
                      <Link
                        key={category._id}
                        href={`/${locale === "kh" ? "km" : "en"}/category/${categorySlug}`}
                        className="px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1"
                        style={{
                          backgroundColor: `${categoryColor}15`,
                          borderColor: `${categoryColor}30`,
                          color: categoryColor,
                        }}
                        aria-label={`View ${categoryName} category with ${articleCount} articles`}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: categoryColor, display: "inline-block" }}
                        />
                        {categoryName}
                        {articleCount > 0 && (
                          <span
                            className="ml-1 text-[10px] font-semibold"
                            style={{ color: categoryColor }}
                          >
                            {articleCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* All Categories Button (below grid, optional) */}
        {allCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center pt-8"
          >
            <Button
              variant="outline"
              size="lg"
              className="group hover:scale-105 transform-gpu transition-all duration-300 bg-transparent"
              onClick={() => router.push("/news")}
            >
              <span>View All News</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Hero
