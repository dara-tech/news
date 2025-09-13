"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  User,
  Eye,
  BookOpen,
  ArrowRight,
  Loader2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Category } from "@/types"
import api from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface SearchResult {
  _id: string
  title: { en: string; kh: string }
  description: { en: string; kh: string }
  content: { en: string; kh: string }
  slug: string
  thumbnail?: string
  category: {
    _id: string
    name: { en: string; kh: string }
    color?: string
    slug?: string
  }
  author: {
    _id: string
    username?: string
    email?: string
  }
  createdAt: string
  publishedAt?: string
  views: number
  isFeatured: boolean
  isBreaking: boolean
  tags: string[]
}

interface SearchFilters {
  category?: string
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all'
  sortBy?: 'relevance' | 'date' | 'views' | 'title'
  featured?: boolean
  breaking?: boolean
}

interface SearchPageClientProps {
  initialQuery: string
  initialFilters: SearchFilters
  lang: string
}

const SearchPageClient = ({ initialQuery, initialFilters, lang }: SearchPageClientProps) => {
  const router = useRouter()
  // searchParams is used for URL-based search functionality

  // State
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [categories, setCategories] = useState<Category[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories")
        setCategories(response.data?.data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  // Perform search
  const performSearch = useCallback(async (
    searchQuery: string,
    page: number = 1,
    isNewSearch: boolean = false
  ) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const params: Record<string, string | number | boolean> = {
        keyword: searchQuery,
        page,
        limit: 20
      }

      // Add filters
      if (filters.category) params.category = filters.category
      if (filters.dateRange && filters.dateRange !== 'all') params.dateRange = filters.dateRange
      if (filters.sortBy) params.sortBy = filters.sortBy
      if (filters.featured) params.featured = filters.featured
      if (filters.breaking) params.breaking = filters.breaking

      const response = await api.get("/news", { params })
      const data = response.data

      if (isNewSearch) {
        setResults(data.news || [])
        setCurrentPage(1)
      } else {
        setResults(prev => [...prev, ...(data.news || [])])
      }

      setTotalResults(data.total || 0)
      setHasMore(data.page < data.pages)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Initial search
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, 1, true)
    }
  }, [initialQuery, performSearch])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query, 1, true)
      updateURL()
    }
  }

  // Update URL with search params
  const updateURL = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.category) params.set('category', filters.category)
    if (filters.dateRange && filters.dateRange !== 'all') params.set('dateRange', filters.dateRange)
    if (filters.sortBy) params.set('sortBy', filters.sortBy)

    const newURL = `/${lang}/search?${params.toString()}`
    router.push(newURL)
  }

  // Load more results
  const loadMore = () => {
    if (!isLoading && hasMore) {
      performSearch(query, currentPage + 1, false)
      setCurrentPage(prev => prev + 1)
    }
  }

  // Get localized text
  const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, locale: string) => {
    if (typeof text === 'string') return text
    return text?.[locale === 'km' ? 'kh' : 'en'] || text?.en || ''
  }

  // Get author name
  const getAuthorName = (author: { username?: string; email?: string } | undefined) => {
    return author?.username ||
      (author?.email ? author.email.split('@')[0] : 'Anonymous')
  }

  // Search result item
  const SearchResultItem = ({ item }: { item: SearchResult }) => {
    const title = getLocalizedText(item.title, lang)
    const description = getLocalizedText(item.description, lang)
    const categoryName = getLocalizedText(item.category?.name, lang)
    const authorName = getAuthorName(item.author)
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
      >
        <Link href={`/${lang}/news/${item.slug}`} className="block">
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative w-24 h-24 flex-shrink-0">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={title}
                  fill
                  sizes="96px"
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              {item.isFeatured && (
                <Badge className="absolute top-1 left-1 bg-yellow-500 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {item.isBreaking && (
                <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Breaking
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {item.category && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: item.category.color ? `${item.category.color}20` : undefined,
                      color: item.category.color || undefined
                    }}
                  >
                    {categoryName}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
              </div>

              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views} views
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Filter component
  const SearchFiltersComponent = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-muted/30 rounded-lg p-4 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <Filter className="w-4 h-4" />
              {filters.category ?
                categories.find(c => c._id === filters.category)?.name?.[lang === 'km' ? 'kh' : 'en'] || 'Category'
                : 'Category'
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category._id}
                onClick={() => setFilters(prev => ({ ...prev, category: category._id }))}
              >
                {getLocalizedText(category.name, lang)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <Calendar className="w-4 h-4" />
              {filters.dateRange === 'today' ? 'Today' :
                filters.dateRange === 'week' ? 'This Week' :
                  filters.dateRange === 'month' ? 'This Month' :
                    filters.dateRange === 'year' ? 'This Year' : 'All Time'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Date Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ].map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, dateRange: option.value as 'today' | 'week' | 'month' | 'year' | 'all' }))}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort By Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <TrendingUp className="w-4 h-4" />
              {filters.sortBy === 'relevance' ? 'Relevance' :
                filters.sortBy === 'date' ? 'Date' :
                  filters.sortBy === 'views' ? 'Views' :
                    filters.sortBy === 'title' ? 'Title' : 'Sort By'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'date', label: 'Date' },
              { value: 'views', label: 'Views' },
              { value: 'title', label: 'Title' }
            ].map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as 'relevance' | 'date' | 'views' | 'title' }))}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() => setFilters({})}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>

      {/* Apply Filters Button */}
      <div className="mt-4">
        <Button
          onClick={() => {
            performSearch(query, 1, true)
            updateURL()
          }}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Search News
        </h1>
        <p className="text-lg text-muted-foreground">
          Find articles across all categories with advanced filters
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search all news articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-12 h-12 text-lg"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted/50"
                onClick={() => {
                  setQuery("")
                  setResults([])
                  setTotalResults(0)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </form>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && <SearchFiltersComponent />}
      </AnimatePresence>

      {/* Search Results */}
      {query && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Search Results for &quot;{query}&quot;
              </h2>
              <p className="text-muted-foreground">
                {totalResults > 0
                  ? `Found ${totalResults} article${totalResults !== 1 ? 's' : ''}`
                  : 'No articles found'
                }
              </p>
            </div>
            {totalResults > 0 && (
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && results.length === 0 ? (
        // Loading skeleton
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-xl">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        // Search results
        <div className="space-y-4">
          {results.map((item) => (
            <SearchResultItem key={item._id} item={item} />
          ))}

          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Results'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : query && !isLoading ? (
        // No results
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-lg p-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">
              No Results Found
            </h3>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find any articles matching &quot;{query}&quot;
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Using more general terms</li>
                <li>Adjusting your filters</li>
              </ul>
            </div>
          </div>
        </div>
      ) : !query ? (
        // Initial state
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-lg p-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-4">
              Search News Articles
            </h3>
            <p className="text-muted-foreground">
              Enter keywords above to search through our news database
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SearchPageClient