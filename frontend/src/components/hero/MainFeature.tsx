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
      className="relative rounded-lg overflow-hidden group border border-border/50 bg-background"
    >
      <Link
        href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug}`}
        className="block w-full h-full focus:outline-none transition-all duration-300"
        tabIndex={0}
      >
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
          {/* Background image */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={getArticleImageUrl(article) || "/placeholder.jpg"}
              alt={article.title?.[locale] || "Feature article image"}
              fill
              priority
              sizes="100vw"
              className="object-cover w-full h-full transition-all duration-500 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"
              }}
            />
            {/* Simple overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Category badge */}
          {categoryName && (
            <div className="absolute top-4 left-4 z-20">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white/90 text-foreground rounded-md"
                style={{ color: categoryColor }}
                aria-label="Category"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
                {categoryName}
              </span>
            </div>
          )}

          {/* Article metadata */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 text-foreground rounded-md">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-medium">{readTime} min</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 text-foreground rounded-md">
              <span className="text-xs font-medium">{publishDate}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 z-20 space-y-4">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white"
              title={article.title?.[locale]}
            >
              {clampText(article.title?.[locale] || "", maxTitleChars)}
            </h1>

            {article.description?.[locale] && (
              <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-3xl leading-relaxed line-clamp-2">
                {article.description?.[locale]}
              </p>
            )}

            {/* CTA and author info */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{article.author?.username || "Editorial Team"}</span>
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-foreground font-medium rounded-md transition-all duration-300 text-sm">
                <span>Read Full Story</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
          />
        </div>
      </Link>
    </div>
  )
}

export default MainFeature
