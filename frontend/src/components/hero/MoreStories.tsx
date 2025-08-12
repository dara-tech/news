"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiApplenews } from "react-icons/si";
import type { Article } from "@/types"
import { getArticleImageUrl } from "@/hooks/useImageLoader"

// Helper to get localized string or fallback
type LocalizedString = string | Record<string, string | undefined>
function getLocalizedString(str: LocalizedString, locale: "en" | "kh"): string {
  if (typeof str === "string") return str
  if (str && typeof str === "object") {
    return str[locale] || str["en"] || Object.values(str)[0] || ""
  }
  return ""
}

interface MoreStoriesProps {
  articles: Article[]
  locale: "en" | "kh"
}

const MoreStories: React.FC<MoreStoriesProps> = ({ articles = [], locale = "en" }) => {
  return (
    <div className="bg-card/50 rounded-xl sm:rounded-2xl border border-border/20 shadow-md sm:shadow-lg backdrop-blur-sm p-3 sm:p-5">
      <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-foreground tracking-tight flex items-center gap-2 border-b border-border/20 dark:border-gray-700 pb-2">
      <SiApplenews className="w-4 h-4  text-red-500" />
        More Stories
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {articles.map((article, idx) => (
          <Link
            key={article._id || idx}
            href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug || article._id}`}
            className="block group rounded-lg transition-all duration-200 hover:bg-muted/30 px-1 sm:px-2 py-1.5 sm:py-2"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-border/30 flex-shrink-0">
                <Image
                  src={getArticleImageUrl(article) || "/placeholder.jpg"}
                  alt={getLocalizedString(article.title, locale)}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {getLocalizedString(article.title, locale)}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
                  {getLocalizedString(article.category?.name, locale)}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MoreStories 