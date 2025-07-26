"use client"

import { useMemo, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useCarousel } from "@/components/hero/components/use-carousel"
import type { Article } from "@/types"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"

interface BreakingNewsTickerProps {
  articles: Article[]
  locale: "en" | "kh"
  autoRotateInterval?: number
}

const TICKER_VARIANTS = {
  initial: { opacity: 0, y: -12, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
}

const PULSE_VARIANTS = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: [0.42, 0, 0.58, 1] as [number, number, number, number], // cubic-bezier for easeInOut
    },
  },
}

const DEFAULT_INTERVAL = 5000

export interface BreakingNewsTickerHandle {
  play: () => void
  pause: () => void
}

export const BreakingNewsTicker = forwardRef<BreakingNewsTickerHandle, BreakingNewsTickerProps>(
  ({ articles = [], locale = "en", autoRotateInterval = DEFAULT_INTERVAL }, ref) => {
    const validArticles = useMemo(
      () =>
        Array.isArray(articles)
          ? articles.filter(
              (article): article is Article =>
                Boolean(article?._id && article?.title?.[locale])
            )
          : [],
      [articles, locale],
    )

    const { currentIndex, play, pause, setCurrentIndex } = useCarousel({
      itemCount: validArticles.length,
      autoRotate: validArticles.length > 1,
      autoRotateInterval,
    })

    useImperativeHandle(ref, () => ({ play, pause }))

    const currentArticle = validArticles[currentIndex]
    const languagePath = locale === "kh" ? "km" : "en"
    const articleHref = currentArticle
      ? `/${languagePath}/news/${currentArticle?.slug?.[locale] || currentArticle?._id}`
      : ""
    const articleTitle = currentArticle?.title?.[locale] || ""

    if (validArticles.length === 0 || !currentArticle) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
        role="alert"
        aria-live="polite"
        className="relative h-16 sm:h-18 overflow-hidden bg-red-600 border-b border-red-500/30"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse" />
        </div>

        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4 relative z-10">
          {/* Breaking Label */}
          <div className="flex items-center gap-4 min-w-[140px]">
            <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {/* Animated pulse rings */}
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-white/30"
                variants={PULSE_VARIANTS}
                animate="animate"
              />
              <motion.span
                className="absolute inline-flex h-3/4 w-3/4 rounded-full bg-white/50"
                variants={PULSE_VARIANTS}
                animate="animate"
                transition={{ delay: 0.5 }}
              />

              {/* Center icon */}
              <div className="relative rounded-full h-8 w-8 bg-white border-2 border-red-600 flex items-center justify-center shadow-lg">
                <Zap className="text-red-600 w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="uppercase text-sm font-black tracking-[0.2em] text-white drop-shadow-lg">Breaking</span>
              <span className="text-xs text-white/80 font-medium">Live Updates</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          {validArticles.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIndex((currentIndex - 1 + validArticles.length) % validArticles.length)}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/80 border border-white/20"
              aria-label="Previous breaking news"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
          )}

          {/* News Ticker Content */}
          <div className="relative w-full mx-4 overflow-hidden flex-grow min-h-[40px] flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentArticle._id}
                variants={TICKER_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 flex items-center"
                aria-live="polite"
                aria-atomic="true"
              >
                <Link
                  href={articleHref}
                  className="block w-full text-base sm:text-lg font-bold leading-tight text-white hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80 rounded-sm transition-all duration-200 truncate hover:scale-[1.02] transform-gpu"
                  aria-label={`Breaking: ${articleTitle}`}
                  tabIndex={0}
                >
                  {articleTitle}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {validArticles.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentIndex((currentIndex + 1) % validArticles.length)}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/80 border border-white/20"
              aria-label="Next breaking news"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>
          )}

          {/* Dot Indicators */}
          {validArticles.length > 1 && (
            <div className="flex items-center gap-2 ml-4">
              {validArticles.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-white/80",
                    index === currentIndex ? "bg-white shadow-lg scale-110" : "bg-white/30 hover:bg-white/60",
                  )}
                  aria-label={`View breaking news ${index + 1}`}
                  aria-current={index === currentIndex ? "step" : undefined}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  },
)

BreakingNewsTicker.displayName = "BreakingNewsTicker"
