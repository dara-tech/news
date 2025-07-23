"use client"

import { useEffect } from "react"
import { notFound } from "next/navigation"
import NewsGrid from "@/components/news/NewsGrid"
import { Tag } from "lucide-react"
import type { Article } from "@/types"


// ----- INTERFACES & API FUNCTIONS -----
interface Category {
  _id: string
  id?: string
  name: { en: string; kh: string } | string
  slug: { en: string; kh: string } | string
  description?: { en: string; kh: string } | string
  color: string
  isActive: boolean
  newsCount?: number
  count?: number // For related categories count
  articles?: Article[] // Added for direct article access
  image?: string // Added for category image
}

interface CategoryPageProps {
  params: { lang: string; slug: string }
  category: {
    category: Category;
    articles: Article[];
  };
}

const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, lang: "en" | "kh" | "km" = "en"): string => {
  const safeLang = lang === 'km' ? 'kh' : lang;
  if (!text) return "";
  if (typeof text === "string") return text;
  if (typeof text === "object") {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    // Fallback to any available value
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return "";
}

// ----- PAGE COMPONENT -----
export default function CategoryPageClient({ params, category }: CategoryPageProps) {
  const lang = (params.lang === 'km' ? 'kh' : 'en') as 'en' | 'kh';
  const categoryObj = category.category;
  const articles = category.articles;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!categoryObj || !categoryObj.isActive) {
          notFound()
          return
        }

      } catch (error) {
        console.error("Error in CategoryPage:", error)
        // setCategoryData((prev) => ({
        //   ...prev,
        //   error: error instanceof Error ? error : new Error(String(error)),
        // }))
      }
    }

    fetchData()
  }, [categoryObj])

  if (!categoryObj) {
    return null; // Or a loading state
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: String(categoryObj.color ?? '#3B82F6') }}>
              {(() => { const name = getLocalizedText(categoryObj.name, lang); return (typeof name === 'string' && name.length > 0 ? name.charAt(0) : 'C'); })()}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {getLocalizedText(categoryObj.name, lang) || 'Category'}
            </h1>
          </div>
          {categoryObj.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {getLocalizedText(categoryObj.description, lang)}
            </p>
          )}
        </div>

        {/* News Grid */}
        {articles && articles.length > 0 ? (
          <NewsGrid articles={articles} locale={lang} />
        ) : (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No articles found in this category. Check back later for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
