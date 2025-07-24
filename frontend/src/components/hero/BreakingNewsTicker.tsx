"use client"

import { useMemo, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useCarousel } from "@/components/hero/components/use-carousel"
import { Article } from "@/types"
import { cn } from "@/lib/utils"
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"

interface BreakingNewsTickerProps {
  articles: Article[]
  locale: 'en' | 'kh'
  autoRotateInterval?: number
}

const TICKER_VARIANTS = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

const DEFAULT_INTERVAL = 5000

export interface BreakingNewsTickerHandle {
  play: () => void
  pause: () => void
}

export const BreakingNewsTicker = forwardRef<BreakingNewsTickerHandle, BreakingNewsTickerProps>(({
  articles = [],
  locale = 'en',
  autoRotateInterval = DEFAULT_INTERVAL,
}, ref) => {
  const validArticles = useMemo(() =>
    Array.isArray(articles)
      ? articles.filter(article => article?._id && article?.title?.[locale])
      : [],
    [articles, locale]
  )

  const {
    currentIndex,
    play,
    pause,
    setCurrentIndex
  } = useCarousel({
    itemCount: validArticles.length,
    autoRotate: validArticles.length > 1,
    autoRotateInterval,
  })

  useImperativeHandle(ref, () => ({ play, pause }))

  const currentArticle = validArticles[currentIndex]
  const languagePath = locale === 'kh' ? 'km' : 'en'
  const articleHref = currentArticle
    ? `/${languagePath}/news/${currentArticle?.slug?.[locale] || currentArticle?._id}`
    : ''
  const articleTitle = currentArticle?.title?.[locale] || ''

  if (validArticles.length === 0 || !currentArticle) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "h-14 sm:h-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800",
        "text-white flex items-center overflow-hidden shadow-lg relative",
        "backdrop-blur-md transition-all duration-300 rounded-b-xl"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Breaking Label */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative rounded-full h-6 w-6 bg-white border-2 border-red-600"></span>
            <AlertTriangle className="absolute text-red-700 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 justify-center items-center" />
          </div>
          <span className="uppercase text-base sm:text-lg font-extrabold tracking-widest drop-shadow-lg">
            Breaking
          </span>
        </div>

        {/* Prev Button */}
        {validArticles.length > 1 && (
          <button
            onClick={() => setCurrentIndex((currentIndex - 1 + validArticles.length) % validArticles.length)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Previous breaking news"
            tabIndex={0}
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* News Ticker Content */}
        <div className="relative w-full mx-2 sm:mx-4 overflow-hidden flex-grow min-h-[32px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentArticle._id}
              variants={TICKER_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <Link
                href={articleHref}
                className={cn(
                  "block w-full text-base sm:text-lg font-semibold leading-tight hover:underline",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80",
                  "rounded-sm transition-colors duration-200",
                  "truncate"
                )}
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
          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % validArticles.length)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Next breaking news"
            tabIndex={0}
            type="button"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Dot Indicators */}
        {validArticles.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            {validArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full border border-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/80",
                  index === currentIndex
                    ? "bg-white shadow-lg scale-110"
                    : "bg-white/40 hover:bg-white/70"
                )}
                aria-label={`View breaking news ${index + 1}`}
                aria-current={index === currentIndex ? "step" : undefined}
                tabIndex={0}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

BreakingNewsTicker.displayName = 'BreakingNewsTicker'
