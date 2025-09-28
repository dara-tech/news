"use client"

import type React from "react"
import Link from "next/link"
import { Hash, TrendingUp, ArrowRight } from "lucide-react"
import type { Category } from "@/types"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"

// Helper to get localized string or fallback
type LocalizedString = string | Record<string, string | undefined>
function getLocalizedString(str: LocalizedString, locale: "en" | "kh"): string {
  if (typeof str === "string") return str
  if (str && typeof str === "object") {
    return str[locale] || str["en"] || Object.values(str)[0] || ""
  }
  return ""
}

interface TrendingCategoriesProps {
  categories: Category[]
  locale: "en" | "kh"
}

const TrendingCategories: React.FC<TrendingCategoriesProps> = ({ categories = [], locale = "en" }) => {
  if (!Array.isArray(categories) || categories.length === 0) return null

  // Sort categories by article count for trending effect
  const sortedCategories = [...categories].sort((a, b) => {
    const countA = a.articlesCount ?? a.newsCount ?? 0
    const countB = b.articlesCount ?? b.newsCount ?? 0
    return countB - countA
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              {locale === 'kh' ? 'ប្រភេទពេញនិយម' : 'Trending Categories'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === 'kh' ? 'ពេញនិយមជារៀងរាល់ថ្ងៃ' : 'Popular today'}
            </p>
          </div>
        </div>
        <Link 
          href={`/${locale}/categories`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors group"
        >
          <span>{locale === 'kh' ? 'ទាំងអស់' : 'View all'}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent scrollbar-hide">
        {sortedCategories.map((category, index) => {
          // Safety check for category object
          if (!category || typeof category !== 'object' || !category._id) {
            return null;
          }
          
          const articleCount = category.articlesCount ?? category.newsCount ?? 0
          const categoryName = getLocalizedString(category.name, locale) || "Uncategorized"
          const categorySlug = typeof category.slug === "string" 
            ? category.slug 
            : category.slug?.[locale] || category.slug?.en || category._id
          const categoryColor = category.color || "#3b82f6"
          
          return (
            <Link
              key={category._id}
              href={`/${locale === "kh" ? "kh" : "en"}/category/${String(categorySlug).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-sm"
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Trending indicator for top 3 */}
                  {index < 3 && (
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={index === 0 ? "default" : "secondary"} 
                        className="text-xs font-bold px-2 py-0.5"
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Category info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {categoryName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {articleCount} {locale === 'kh' ? 'អត្ថបទ' : 'articles'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200"
                style={{ backgroundColor: categoryColor }}
              />
            </Link>
          )
        })}
      </div>

    </div>
  )
}

export default TrendingCategories 