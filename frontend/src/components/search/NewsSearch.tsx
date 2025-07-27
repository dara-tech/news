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
    name?: string
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, lang])

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
  const performSearch = async (
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
      if (typeof filters.featured === "boolean") params.featured = filters.featured
      if (typeof filters.breaking === "boolean") params.breaking = filters.breaking

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

      // Generate suggestions based on results
      if (isNewSearch && data.news?.length > 0) {
        const newSuggestions = data.news
          .slice(0, 5)
          .map((item: SearchResult) => {
            const title = typeof item.title === 'string'
              ? item.title
              : item.title[lang === 'km' ? 'kh' : 'en']
            return title ? title.split(' ').slice(0, 3).join(' ') : ''
          })
          .filter((suggestion: string | undefined): suggestion is string => Boolean(suggestion))
        setSuggestions(newSuggestions)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search input
  const handleSearchChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query, 1, true)
      setIsSearchOpen(true)
    }
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
  const getAuthorName = (author: { name?: string; username?: string; email?: string } | undefined) => {
    return author?.name || author?.username ||
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
      className="border-t border-border bg-muted/30"
    >
      <div className="p-4 space-y-4">
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
        <Button
          onClick={() => performSearch(query, 1, true)}
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
    <div className="relative" ref={searchContainerRef}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search all news..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="pl-10 pr-12 h-10 text-base"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-12 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-muted/50"
              onClick={() => {
                setQuery("")
                setResults([])
                setSuggestions([])
                searchInputRef.current?.focus()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Search Results Overlay */}
      <AnimatePresence>
        {isSearchOpen && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {isLoading ? 'Searching...' :
                      totalResults > 0 ? `${totalResults} results found` :
                        query.trim() ? 'No results found' : 'Search suggestions'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && <SearchFiltersComponent />}

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoading && results.length === 0 ? (
                // Loading skeleton
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
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
                <div className="p-4 space-y-4">
                  {results.map((item) => (
                    <SearchResultItem key={item._id} item={item} />
                  ))}

                  {/* Load more button */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
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
              ) : query.trim() && !isLoading ? (
                // No results
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                // Search suggestions
                <div className="p-4">
                  <h3 className="font-medium mb-3">Popular searches</h3>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion, 1, true)
                        }}
                      >
                        <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NewsSearch