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
    <div className="bg-card rounded-xl border border-primary/20 backdrop-blur-sm p-6">
      <h3 className="font-bold text-lg mb-4 text-foreground tracking-tight flex items-center gap-3 border-b border-border/20 pb-3">
        <SiApplenews className="w-5 h-5 text-primary" />
        <span>Latest Stories</span>
      </h3>
      <div className="space-y-3">
        {articles.length > 0 ? (
          articles.map((article, idx) => (
            <Link
              key={article._id || idx}
              href={`/${locale === "kh" ? "km" : "en"}/news/${article.slug || article._id}`}
              className="block group rounded-lg transition-all duration-200 hover:bg-muted/50 p-3 border border-transparent hover:border-border/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/30 flex-shrink-0 bg-muted">
                  <Image
                    src={getArticleImageUrl(article) || "/placeholder.jpg"}
                    alt={getLocalizedString(article.title, locale)}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {getLocalizedString(article.title, locale)}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {getLocalizedString(article.category?.name, locale)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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