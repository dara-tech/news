"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock, User } from "lucide-react"
import type { Article } from "@/types"
import { getArticleImageUrl } from "@/hooks/useImageLoader"

interface MainFeatureProps {
  article: Article
  locale: "en" | "kh"
}

const MainFeature: React.FC<MainFeatureProps> = ({ article, locale }) => {
  if (!article) return null

  // Extract category info (support both string and object)
  let categoryName = ""
  let categoryColor = "#3b82f6"
  if (article.category) {
    if (typeof article.category === "string") {
      categoryName = article.category
    } else {
      categoryName = article.category.name?.[locale] || article.category.name?.en || ""
      categoryColor = article.category.color || "#3b82f6"
    }
  }

  // Helper: clamp title to 2-3 lines, add ellipsis if too long
  function clampText(text: string, maxChars: number) {
    if (!text) return ""
    if (text.length <= maxChars) return text
    return text.slice(0, maxChars - 1).trim() + "…"
  }

  // Responsive max title chars
  const maxTitleChars = 85

  // Advanced: calculate read time based on description length
  function estimateReadTime(text: string) {
    if (!text) return 1
    const words = text.trim().split(/\s+/).length
    return Math.max(1, Math.round(words / 200))
  }
  const readTime = estimateReadTime(article.description?.[locale] || "")

  // Advanced: format date - consistent between server and client
  function formatDate(dateString: string, locale: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    
    // Use consistent formatting to avoid hydration mismatches
    const month = date.getMonth()
    const day = date.getDate()
    const year = date.getFullYear()
    
    if (locale === "kh") {
      const khmerMonths = [
        "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
        "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
      ]
      return `${day} ${khmerMonths[month]} ${year}`
    } else {
      const englishMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ]
      return `${englishMonths[month]} ${day}, ${year}`
    }
  }
  const publishDate = formatDate(article.createdAt || article.publishedAt || new Date().toISOString(), locale)

  return (
    <div
      className="relative rounded-2xl lg:rounded-3xl overflow-hidden group backdrop-blur-lg border border-primary/20"
    >
      <Link
        href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}
        className="block w-full h-full focus:outline-none transition-all duration-300"
        tabIndex={0}
      >
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
          {/* Background image with animated overlay */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={getArticleImageUrl(article) || "/placeholder.jpg"}
              alt={article.title?.[locale] || "Feature article image"}
              fill
              priority
              sizes="100vw"
              className="object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"
              }}
            />
            {/* Advanced layered gradients */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent sm:via-black/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent sm:from-black/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              {/* Static floating shapes for visual interest - only on sm+ */}
              <div
                className="hidden sm:block absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-2xl opacity-60"
              />
              <div
                className="hidden sm:block absolute -bottom-16 right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl opacity-40"
              />
            </div>
          </div>

          {/* Floating category badge */}
          {categoryName && (
            <div
              className="absolute top-3 left-3 sm:top-8 sm:left-8 z-20"
            >
              <span
                className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold px-3 py-1.5 sm:px-5 sm:py-2 rounded-full tracking-wider uppercase text-white"
                style={{
                  background: `linear-gradient(90deg, ${categoryColor} 60%, #fff3 100%)`,
                  letterSpacing: "0.1em",
                }}
                aria-label="Category"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                {categoryName}
              </span>
            </div>
          )}

          {/* Article metadata - optimized for sm */}
          <div
            className="absolute top-3 right-3 sm:top-8 sm:right-8 z-20 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/40 backdrop-blur-md">
              <Clock className="w-3 h-3 text-white/80" />
              <span className="text-xs text-white/80 font-medium">{readTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/40 backdrop-blur-md">
              <span className="text-xs text-white/80 font-medium">{publishDate}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 lg:p-12 z-20 space-y-4 sm:space-y-6">
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
              style={{
                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                letterSpacing: "-0.02em",
              }}
              title={article.title?.[locale]}
            >
              {clampText(article.title?.[locale] || "", maxTitleChars)}
            </h1>

            {article.description?.[locale] && (
              <p
                className="text-base sm:text-lg lg:text-xl text-white/90 max-w-4xl leading-relaxed drop-shadow-lg line-clamp-2 sm:line-clamp-3 bg-black/40 rounded-xl px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-md border border-white/10"
              >
                {article.description?.[locale]}
              </p>
            )}

            {/* Enhanced CTA button - stacked on sm */}
            <div
              className="flex flex-col gap-3 pt-2 sm:pt-4"
            >
              <span
                className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 sm:px-10 sm:py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
              >
                <span className="tracking-wide">Read Full Story</span>
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform duration-300" />
              </span>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-white/80 bg-black/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-md">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{article.author?.username || "Editorial Team"}</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 sm:h-2 opacity-70"
            style={{
              background: `linear-gradient(90deg, ${categoryColor} 0%, #fff0 100%)`,
              filter: "blur(1px)",
            }}
          />
          {/* Static floating dot for extra flair, hidden on mobile */}
          <div
            className="hidden sm:block absolute bottom-8 right-8 w-6 h-6 rounded-full bg-primary/70 blur-sm opacity-70"
          />
        </div>
      </Link>
    </div>
  )
}

export default MainFeature
