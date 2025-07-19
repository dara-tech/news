"use client"

import { useMemo, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useCarousel } from "@/components/hero/components/use-carousel"
import { Article } from "@/types"
import { cn } from "@/lib/utils"

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
        "h-12 sm:h-14 bg-gradient-to-r from-red-600 via-red-700 to-red-800",
        "text-white flex items-center  overflow-hidden shadow-md relative",
        "backdrop-blur-md transition-all duration-300"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Breaking Label */}
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative  rounded-full h-3 w-3 bg-white "></span>
          </div>
          <span className="uppercase text-sm sm:text-base font-bold tracking-wide">
            Breaking
          </span>
        </div>

        {/* News Ticker Content */}
        <div className="relative w-full mx-4 overflow-hidden flex-grow min-h-[28px]">
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
                  "block w-full text-sm sm:text-base font-medium leading-tight hover:underline",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/80",
                  "rounded-sm"
                )}
                aria-label={`Breaking: ${articleTitle}`}
              >
                {articleTitle}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot Indicators */}
        {validArticles.length > 1 && (
          <div className="flex items-center gap-2">
            {validArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full border border-white transition-all duration-200",
                  index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                )}
                aria-label={`View breaking news ${index + 1}`}
                aria-current={index === currentIndex ? "step" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

BreakingNewsTicker.displayName = 'BreakingNewsTicker'
