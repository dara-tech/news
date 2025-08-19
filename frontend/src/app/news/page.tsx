import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';
import CategoryFilter from '@/components/news/CategoryFilter';
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

function getCategorySlug(category: Category): string {
  // Require slug to exist, no fallback to _id
  if (!category.slug) {
    throw new Error(`Category ${category._id} has no slug defined`);
  }
  return category.slug;
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
  const locale: Locale = lang === 'km' ? 'kh' : 'en';


  try {
    // Fetch categories for filter chips
    const categories = await getCategories();
    
    // Find the current category for display
    const currentCategory = category ? categories.find((c: Category) => {
      try {
        const categorySlug = getCategorySlug(c);
        return categorySlug === category;
      } catch {
        return false;
      }
    }) : null;


    // Don't throw error for missing category - just show empty state
    const { news, pagination } = await getNewsData(lang, currentPage, category, search);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {search ? `Search Results for "${search}"` :
             category ? `${getLocalizedText(currentCategory?.name, locale) || category} News` :
             'All News'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {pagination.total > 0
              ? `Showing ${pagination.total} article${pagination.total !== 1 ? 's' : ''}`
              : category 
                ? `No articles found in ${getLocalizedText(currentCategory?.name, locale) || category} category`
                : search
                ? `No articles found for "${search}"`
                : 'No articles found'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Smart Category Filter */}
        <CategoryFilter 
          categories={categories}
          currentCategory={category}
          locale={locale}
          lang={lang}
        />

        {/* News Grid */}
        {news.length > 0 ? (
          <>
            <NewsGrid articles={news} locale={locale} />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
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
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  View All News
                </a>
                <a
                  href={`/${lang}`}
                  className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-red-900 dark:text-red-200 mb-4">
              Error Loading News
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-6">
              An unexpected error occurred while loading the news.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <a
                href={`/${lang}/news`}
                className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                View All News
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
