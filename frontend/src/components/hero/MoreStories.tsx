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
    <div className="bg-background rounded-lg border border-border/50 p-4">
      <h3 className="font-semibold text-base mb-3 text-foreground flex items-center gap-2 border-b border-border/30 pb-2">
        <SiApplenews className="w-4 h-4 text-primary" />
        <span>Latest Stories</span>
      </h3>
              <div className="space-y-2">
          {articles.length > 0 ? (
            articles.map((article, idx) => (
              <Link
                key={article._id || idx}
                href={`/${locale === "kh" ? "kh" : "en"}/news/${article.slug || article._id}`}
                className="block group rounded transition-all duration-200 hover:bg-muted/30 p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded overflow-hidden border border-border/30 flex-shrink-0 bg-muted">
                    <Image
                      src={getArticleImageUrl(article) || '/placeholder-news.jpg'}
                      alt={getLocalizedString(article.title, locale)}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {getLocalizedString(article.title, locale)}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {getLocalizedString(article.category?.name, locale)}
                    </p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </Link>
            ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <SiApplenews className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No stories available</p>
            <p className="text-xs mt-1">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoreStories 