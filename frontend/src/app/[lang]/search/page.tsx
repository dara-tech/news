import { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'Search News',
  description: 'Search through all news articles with advanced filters',
}

interface SearchPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string; category?: string; dateRange?: string; sortBy?: string }>
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params
  const { q, category, dateRange, sortBy } = await searchParams

  return (
    <SearchPageClient 
      initialQuery={q || ''}
      initialFilters={{
        category,
        dateRange: dateRange as 'today' | 'week' | 'month' | 'year' | 'all' | undefined,
        sortBy: sortBy as 'relevance' | 'date' | 'views' | 'title' | undefined
      }}
      lang={lang}
    />
  )
}
