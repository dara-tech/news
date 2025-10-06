"use client"

import { useMemo, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { useCarousel } from "@/components/hero/components/use-carousel"
import type { Article } from "@/types"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
interface BreakingNewsTickerProps {
  articles: Article[]
  locale: "en" | "kh"
  autoRotateInterval?: number
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
    const languagePath = locale === "kh" ? "kh" : "en"
    const articleHref = currentArticle
      ? `/${languagePath}/news/${currentArticle?.slug?.[locale] || currentArticle?._id}`
      : ""
    const articleTitle = currentArticle?.title?.[locale] || ""

    if (validArticles.length === 0 || !currentArticle) return null

    return (
      <div className="bg-red-600 border-b border-red-500/30 py-2">
        <div className="px-2 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Breaking Label */}
          <div className="flex items-center gap-2 sm:gap-3 ]">
            {/* <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
              <Zap className="text-red-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div> */}
            <span className="uppercase text-xs sm:text-sm font-bold tracking-wide text-white">
              Breaking
            </span>
          </div>

          {/* Navigation Buttons - Hidden on mobile, shown on tablet+ */}
          {validArticles.length > 1 && (
            <Button
              onClick={() => setCurrentIndex((currentIndex - 1 + validArticles.length) % validArticles.length)}
              className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center"
              aria-label="Previous breaking news"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </Button>
          )}

          {/* News Content */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div
              key={currentArticle._id}
              className="w-full"
            >
              <Link
                href={articleHref}
                className="block text-white hover:text-white/90 font-medium truncate transition-colors text-sm sm:text-base"
                aria-label={`Breaking: ${articleTitle}`}
              >
                {articleTitle}
              </Link>
            </div>
          </div>

          {/* Navigation Buttons - Hidden on mobile, shown on tablet+ */}
          {validArticles.length > 1 && (
            <Button
              onClick={() => setCurrentIndex((currentIndex + 1) % validArticles.length)}
              className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center"
              aria-label="Next breaking news"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </Button>
          )}

          {/* Dot Indicators - Hidden on mobile, shown on tablet+ */}
          {validArticles.length > 1 && validArticles.length <= 5 && (
            <div className="hidden sm:flex items-center gap-1">
              {validArticles.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors p-0 min-w-0 min-h-0",
                    index === currentIndex ? "bg-white" : "bg-white/30 hover:bg-white/60"
                  )}
                  aria-label={`View breaking news ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Counter for many articles */}
          {validArticles.length > 5 && (
            <div className="text-white/70 text-xs sm:text-sm font-medium min-w-[40px] text-right">
              {currentIndex + 1}/{validArticles.length}
            </div>
          )}
        </div>
      </div>
    )
  },
)

BreakingNewsTicker.displayName = "BreakingNewsTicker"
