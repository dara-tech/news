import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';
import CategoryFilter from '@/components/news/CategoryFilter';
import { Button } from '@/components/ui/button';
import type { Category, Locale } from '@/types';

interface NewsPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export const metadata: Metadata = {
  title: 'All News - Razewire',
  description: 'Browse all the latest news articles from various categories including technology, business, sports, and more.',
};

function getLocalizedText(text: string | { [key: string]: string | undefined } | undefined, locale: Locale): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[locale] === 'string') return text[locale]!;
    // Remove fallback to other values - only use the exact locale
    return '';
  }
  return '';
}

function getCategorySlug(category: Category, lang: string = 'en'): string {
  // Use slug if available, fallback to _id
  if (!category.slug) {
    return String(category._id || 'unknown');
  }
  
  // Handle localized slug
  if (typeof category.slug === 'string') {
    return category.slug;
  }
  
  // Use the appropriate language slug, fallback to English
  const safeLang = lang === 'kh' ? 'kh' : 'en';
  return category.slug[safeLang as keyof typeof category.slug] || category.slug.en || String(category._id || 'unknown');
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const response = await fetch(`${apiUrl}/api/categories`, { cache: 'no-store' });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch categories: API returned success false');
    }
    
    if (!Array.isArray(data.data)) {
      throw new Error('Failed to fetch categories: Invalid data format');
    }
    
    return data.data;
  } catch {
    throw new Error('Failed to fetch categories'); // Re-throw instead of returning empty array
  }
}

async function getNewsData(lang: string, page: number = 1, category?: string, search?: string) {
  try {
    let response;
    
    if (category) {
      // Use the category-specific endpoint
      response = await api.get(`/news/category/${category}`, { 
        params: { page, limit: 12 } 
      });
      
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from category endpoint');
      }
      
      return {
        news: response.data?.news || [],
        pagination: {
          page: response.data?.page || 1,
          pages: response.data?.pages || 1,
          total: response.data?.total || 0,
        }
      };
    } else {
      // Use the main news endpoint for search and general news
      const params: Record<string, string | number> = { lang, page, limit: 12 };
      if (search) params.keyword = search;

      response = await api.get('/news', { params });
      
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from news endpoint');
      }
      
      return {
        news: response.data?.news || response.data?.data || [],
        pagination: {
          page: response.data?.page || 1,
          pages: response.data?.pages || 1,
          total: response.data?.total || 0,
        }
      };
    }
  } catch {
    throw new Error('Failed to fetch news data'); // Re-throw instead of returning empty data
  }
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { lang } = await params;
  const { page, category, search } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const locale: Locale = lang === 'kh' ? 'kh' : 'en';

  // Debug logging for locale
  if (process.env.NODE_ENV === 'development') {
    console.log('News page - lang:', lang, 'locale:', locale, 'URL:', `/${lang}/news`);
  }

  try {
    // Fetch categories for filter chips
    const categories = await getCategories();
    
    // Debug logging for categories
    if (process.env.NODE_ENV === 'development' && locale === 'kh') {
      console.log('Categories data:', categories.slice(0, 2)); // Log first 2 categories
    }
    
    // Find the current category for display
    const currentCategory = category ? categories.find((c: Category) => {
      const categorySlug = getCategorySlug(c, lang);
      return categorySlug === category;
    }) : null;


    // Don't throw error for missing category - just show empty state
    const { news, pagination } = await getNewsData(lang, currentPage, category, search);

    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-6">
          {/* BBC-style Page Header */}
          <div className="mb-8">
            <div className="border-b-4 border-red-600 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {search ? `Search Results for "${search}"` :
                 category ? `${getLocalizedText(currentCategory?.name, locale) || category} News` :
                 'News'}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {pagination.total > 0
                ? `${pagination.total} article${pagination.total !== 1 ? 's' : ''} found`
                : category 
                  ? `No articles found in ${getLocalizedText(currentCategory?.name, locale) || category} category`
                  : search
                  ? `No articles found for "${search}"`
                  : 'No articles found'
              }
            </p>
          </div>

        {/* BBC-style Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search news..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* BBC-style Category Filter */}
        <div className="mb-8">
          <CategoryFilter 
            categories={categories}
            currentCategory={category}
            locale={locale}
            lang={lang}
          />
        </div>

        {/* BBC-style News Grid */}
        {news.length > 0 ? (
          <>
            <NewsGrid articles={news} locale={locale} />
            {/* BBC-style Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  baseUrl={`/${lang}/news${category ? `?category=${category}` : ''}${search ? `${category ? '&' : '?'}search=${search}` : ''}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                No Articles Found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {search
                  ? `No articles found for "${search}". Try different keywords.`
                  : category
                  ? `No articles found in the ${getLocalizedText(currentCategory?.name, locale) || category} category yet.`
                  : 'No articles available at the moment.'
                }
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href={`/${lang}/news`}
                  className="px-6 py-3 bg-red-600 text-white rounded"
                >
                  View All News
                </a>
                <a
                  href={`/${lang}`}
                  className="px-6 py-3 bg-gray-600 text-white rounded"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <div className="text-8xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold text-red-900 dark:text-red-200 mb-4">
                Error Loading News
              </h2>
              <p className="text-lg text-red-700 dark:text-red-300 mb-8 leading-relaxed">
                An unexpected error occurred while loading the news. Please try again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/${lang}/news`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </a>
                <a
                  href={`/${lang}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}