import { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.razewire.online';

export const metadata: Metadata = {
  title: 'Search News - Razewire',
  description: 'Search through all news articles with advanced filters. Find the latest news by keywords, category, date, and more.',
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: `${BASE_URL}/search`,
  },
  openGraph: {
    title: 'Search News - Razewire',
    description: 'Search through all news articles with advanced filters.',
    url: `${BASE_URL}/search`,
    siteName: 'Razewire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search News - Razewire',
    description: 'Search through all news articles with advanced filters.',
    site: '@razewire',
  },
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
