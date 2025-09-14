export interface SearchResult {
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

export interface SearchFilters {
  category?: string
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all'
  sortBy?: 'relevance' | 'date' | 'views' | 'title'
  featured?: boolean
  breaking?: boolean
}

export interface SearchPageClientProps {
  initialQuery: string
  initialFilters: SearchFilters
  lang: string
}
