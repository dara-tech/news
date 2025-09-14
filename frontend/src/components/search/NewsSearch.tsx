"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  Filter,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  User,
  Loader2,
  ArrowRight,
  BookOpen,   
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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

const NewsSearch = () => {
  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // State
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Perform search function
  const performSearch = useCallback(async (searchQuery: string, page: number = 1, resetResults: boolean = false) => {
    if (!searchQuery.trim()) {
      setResults([])
      setSuggestions([])
      return
    }

    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        keyword: searchQuery,
        page: page.toString(),
        limit: '10',
        lang
      })

      // Add filters to params
      if (filters.category) params.append('category', filters.category)
      if (filters.dateRange) params.append('dateRange', filters.dateRange)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.featured) params.append('featured', 'true')
      if (filters.breaking) params.append('breaking', 'true')

      const response = await api.get(`/news/search?${params.toString()}`)
      const data = response.data

      if (data?.success) {
        const newResults = data.data?.news || []
        setResults(resetResults ? newResults : [...results, ...newResults])
        setTotalResults(data.data?.total || 0)
        setHasMore(newResults.length === 10)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, lang, results])

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    debounceTimeout.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, 1, true)
      } else {
        setResults([])
        setSuggestions([])
      }
    }, 300)
  }, [performSearch])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories")
        setCategories(response.data?.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Get localized text
  const getLocalizedText = (text: string | { en?: string; kh?: string } | undefined, locale: string) => {
    if (typeof text === 'string') return text
    if (!text || typeof text !== 'object') return ''
    return text[locale === 'kh' ? 'kh' : 'en'] || text.en || ''
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
    
    // Safely format the date with error handling
    const getTimeAgo = (dateString: string) => {
      try {
        if (!dateString) return 'Unknown time'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Invalid date'
        return formatDistanceToNow(date, { addSuffix: true })
      } catch (error) {
        return 'Unknown time'
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      >
        <Link href={`/${lang}/news/${item.slug}`} className="block">
          <div className="flex gap-4">
            {item.thumbnail && (
              <div className="flex-shrink-0">
                <Image
                  src={item.thumbnail}
                  alt={title}
                  width={120}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {item.isBreaking && (
                  <Badge variant="destructive" className="text-xs">
                    Breaking
                  </Badge>
                )}
                {item.isFeatured && (
                  <Badge variant="default" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {categoryName}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                {title}
              </h3>
              
              {description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(item.publishedAt || item.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views.toLocaleString()}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកព័ត៌មាន...' : 'Search news...'}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="pl-10 pr-10 py-3 text-lg"
              />
              {query && (
                <Button
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    setSuggestions([])
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            {Object.keys(filters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({})
                  if (query.trim()) {
                    performSearch(query, 1, true)
                  }
                }}
                className="text-gray-500"
              >
                Clear filters
              </Button>
            )}
          </div>
          
          {totalResults > 0 && (
            <p className="text-sm text-gray-600">
              {totalResults.toLocaleString()} results found
            </p>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(value) => {
                      const newFilters = { ...filters }
                      if (value) {
                        newFilters.category = value
                      } else {
                        delete newFilters.category
                      }
                      setFilters(newFilters)
                      if (query.trim()) {
                        performSearch(query, 1, true)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {getLocalizedText(category.name, lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <Select
                    value={filters.dateRange || ''}
                    onValueChange={(value) => {
                      const newFilters = { ...filters }
                      if (value) {
                        newFilters.dateRange = value as SearchFilters['dateRange']
                      } else {
                        delete newFilters.dateRange
                      }
                      setFilters(newFilters)
                      if (query.trim()) {
                        performSearch(query, 1, true)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy || 'relevance'}
                    onValueChange={(value) => {
                      const newFilters = { ...filters, sortBy: value as SearchFilters['sortBy'] }
                      setFilters(newFilters)
                      if (query.trim()) {
                        performSearch(query, 1, true)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured || false}
                        onChange={(e) => {
                          const newFilters = { ...filters }
                          if (e.target.checked) {
                            newFilters.featured = true
                          } else {
                            delete newFilters.featured
                          }
                          setFilters(newFilters)
                          if (query.trim()) {
                            performSearch(query, 1, true)
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Featured only</span>
                    </label>
                    <label className="flex items-center">
                      <Input
                        type="checkbox"
                        checked={filters.breaking || false}
                        onChange={(e) => {
                          const newFilters = { ...filters }
                          if (e.target.checked) {
                            newFilters.breaking = true
                          } else {
                            delete newFilters.breaking
                          }
                          setFilters(newFilters)
                          if (query.trim()) {
                            performSearch(query, 1, true)
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Breaking news</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <div className="space-y-4">
          {isLoading && results.length === 0 && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-[120px] h-[80px] rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.map((result) => (
            <SearchResultItem key={result._id} item={result} />
          ))}

          {results.length === 0 && !isLoading && query.trim() && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

          {hasMore && results.length > 0 && (
            <div className="text-center py-6">
              <Button
                onClick={() => performSearch(query, currentPage + 1, false)}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsSearch