"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import NewsGrid from "@/components/news/NewsGrid"
import Pagination from "@/components/common/Pagination"
import { Badge } from "@/components/ui/badge"
import { Calendar, Tag, TrendingUp } from "lucide-react"
import Link from "next/link"
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
}

interface CategoryPageProps {
  params: { lang: string; slug: string }
  searchParams?: { page?: string }
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
  pages: number
  page?: number
}

// Interface for raw API response article data
interface RawArticleData {
  _id?: string
  id?: string
  title: { en: string; kh: string } | string
  slug: { en: string; kh: string } | string
  content?: { en: string; kh: string } | string
  excerpt?: { en: string; kh: string } | string
  description?: { en: string; kh: string } | string
  featuredImage?: string
  category?: Category
  author?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

async function getCategoryBySlug(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
    const response = await fetch(`${apiUrl}/api/categories/slug/${slug}`, { cache: "no-store" })
    if (!response.ok) return null
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

async function getRelatedCategories(categoryId: string, limit = 3) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
    const response = await fetch(`${apiUrl}/api/categories/related/${categoryId}?limit=${limit}`, { cache: "no-store" })
    if (!response.ok) return []
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error("Error fetching related categories:", error)
    return []
  }
}

async function getNewsByCategory(
  categoryId: string,
  page = 1,
): Promise<{
  news: Article[]
  pagination: PaginationData
}> {
  const defaultPagination = {
    news: [],
    pagination: { currentPage: page, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false, pages: 1 },
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
    const response = await fetch(`${apiUrl}/api/news?category=${categoryId}&page=${page}&limit=12`, {
      cache: "no-store",
    })
    if (!response.ok) return defaultPagination
    const data = await response.json()
    if (data.success) {
      // Transform the data to match the Article interface from @/types
      const transformedNews: Article[] = (data.data || []).map((article: RawArticleData) => ({
        id: article._id || article.id || "", // Ensure id is always a string
        _id: article._id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        description: article.description || article.excerpt || { en: "", kh: "" },
        featuredImage: article.featuredImage,
        category: article.category,
        author: article.author,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        isActive: article.isActive ?? true,
      }))
      return { news: transformedNews, pagination: data.pagination || defaultPagination.pagination }
    }
    return defaultPagination
  } catch (error) {
    console.error("Error fetching news by category:", error)
    return defaultPagination
  }
}

const getLocalizedText = (text: string | { en: string; kh: string } | undefined, lang: "en" | "kh" = "en"): string => {
  if (!text) return ""
  if (typeof text === "string") return text
  return text[lang] || text.en || ""
}

// ----- PAGE COMPONENT -----
export default function CategoryPageClient({ params, searchParams }: CategoryPageProps) {
  const [categoryData, setCategoryData] = useState<{
    news: Article[]
    pagination: PaginationData
    category: Category | null
    relatedCategories: Category[]
    error?: Error | null
  }>({
    news: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false, pages: 1 },
    category: null,
    relatedCategories: [],
    error: null,
  })

  const { lang, slug } = params
  const currentPage = searchParams?.page ? Number.parseInt(searchParams.page, 10) : 1

  useEffect(() => {
    const fetchData = async () => {
      try {
        const category = await getCategoryBySlug(slug)
        if (!category || !category.isActive) {
          notFound()
          return
        }

        const [{ news = [], pagination }, relatedCategories] = await Promise.all([
          getNewsByCategory(category._id || category.id, currentPage),
          getRelatedCategories(category._id || category.id, 3),
        ])

        setCategoryData({ news, pagination, category, relatedCategories, error: null })
      } catch (error) {
        console.error("Error in CategoryPage:", error)
        setCategoryData((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
      }
    }

    fetchData()
  }, [lang, slug, currentPage])

  const { news, pagination, category, relatedCategories, error } = categoryData
  const isDev = process.env.NODE_ENV === "development"

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === "kh" ? "មានបញ្ហាកើតឡើង" : "Something went wrong"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {lang === "kh"
              ? "យើងមានបញ្ហាក្នុងការផ្ទុកទិន្នន័យប្រភេទនេះ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។"
              : "We're having trouble loading this category. Please try again later."}
          </p>
          {isDev && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                {lang === "kh" ? "ព័ត៌មានលម្អិតអំពីកំហុស៖" : "Error details:"}
              </p>
              <code className="text-xs text-red-700 dark:text-red-300 break-words">{error.message}</code>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${lang}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {lang === "kh" ? "ត្រឡប់ទៅផ្ទះ" : "Return to Home"}
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {lang === "kh" ? "ព្យាយាមម្តងទៀត" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return null // Or a loading state
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {getLocalizedText(category.name, lang as "en" | "kh")}
            </h1>
            <Badge variant="secondary" className="ml-2">
              {category.newsCount} articles
            </Badge>
          </div>
          {category.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {getLocalizedText(category.description, lang as "en" | "kh")}
            </p>
          )}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{category.newsCount} total articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Updated daily</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending category</span>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href={`/${lang}`} className="hover:text-gray-700 dark:hover:text-gray-300">
            Home
          </Link>
          <span>/</span>
          <Link href={`/${lang}/categories`} className="hover:text-gray-700 dark:hover:text-gray-300">
            Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {getLocalizedText(category.name, lang as "en" | "kh")}
          </span>
        </nav>

        {/* News Grid & Pagination */}
        {news.length > 0 ? (
          <>
            <NewsGrid articles={news} locale={lang as "en" | "kh"} />
            {pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.currentPage || currentPage}
                  totalPages={pagination.pages}
                  baseUrl={`/${lang}/category/${slug}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No articles yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No articles found in this category. Check back later for updates!
            </p>
          </div>
        )}

        {/* Related Categories */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {getLocalizedText({ en: "Other Categories", kh: "ប្រភេទផ្សេងទៀត" }, lang as "en" | "kh")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedCategories
              .filter((cat: Category) => {
                const catSlug = getLocalizedText(cat.slug, lang as "en" | "kh")
                return catSlug !== slug && cat.isActive
              })
              .slice(0, 3)
              .map((cat: Category) => {
                const catSlug = getLocalizedText(cat.slug, lang as "en" | "kh")
                return (
                  <Link
                    key={catSlug}
                    href={`/${lang}/category/${catSlug}`}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {getLocalizedText(cat.name, lang as "en" | "kh")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cat.count || 0} {cat.count === 1 ? "article" : "articles"}
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
