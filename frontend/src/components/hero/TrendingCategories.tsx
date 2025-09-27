"use client"

import type React from "react"
import Link from "next/link"
import { Globe } from "lucide-react"
import type { Category } from "@/types"
import { Card } from "../ui/card"

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

  return (
    <Card className="p-4 shadow-none">
      <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2 text-foreground tracking-tight">
        <Globe className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Trending Categories</span>
        <span className="sm:hidden">Trending</span>
      </h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {categories.map((category) => {
          // Safety check for category object
          if (!category || typeof category !== 'object' || !category._id) {
            return null;
          }
          
          const articleCount = category.articlesCount ?? category.newsCount ?? 0
          const categoryName = getLocalizedString(category.name, locale) || "Uncategorized"
          // Get localized slug properly
          const categorySlug = typeof category.slug === "string" 
            ? category.slug 
            : category.slug?.[locale] || category.slug?.en || category._id
          const categoryColor = category.color || "#3b82f6"
          return (
            <Link
              key={category._id}
              href={`/${locale === "kh" ? "kh" : "en"}/category/${String(categorySlug).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-colors flex items-center gap-1 text-xs sm:text-sm"
              style={{
                backgroundColor: `${categoryColor}15`,
                borderColor: `${categoryColor}30`,
                color: categoryColor,
              }}
              aria-label={`View ${categoryName} category with ${articleCount} articles`}
            >
              <span
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-0.5 sm:mr-1"
                style={{ backgroundColor: categoryColor, display: "inline-block" }}
              />
              <span className="truncate max-w-[80px] sm:max-w-none">{categoryName}</span>
              {articleCount > 0 && (
                <span
                  className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] font-semibold"
                  style={{ color: categoryColor }}
                >
                  {articleCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

export default TrendingCategories 