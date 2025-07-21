import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';

interface SearchPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  
  return {
    title: q ? `Search Results for "${q}" - NewsApp` : 'Search - NewsApp',
    description: q 
      ? `Search results for "${q}". Find the latest news articles matching your query.`
      : 'Search for news articles across all categories including technology, business, sports, and more.',
  };
}

async function searchNews(query: string, lang: string, page: number = 1, category?: string) {
  try {
    const params: Record<string, string | number> = { 
      search: query, 
      lang, 
      page, 
      limit: 12 
    };
    if (category) params.category = category;

    const response = await api.get('/news/search', { params });
    return {
      news: response.data?.news || response.data?.data || [],
      pagination: {
        page: response.data?.page || 1,
        pages: response.data?.pages || 1,
        total: response.data?.total || 0,
      }
    };
  } catch (error) {
    console.error('Failed to search news:', error);
    return {
      news: [],
      pagination: { page: 1, pages: 1, total: 0 }
    };
  }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params;
  const { q: query, page, category } = await searchParams;
  
  const currentPage = parseInt(page || '1', 10);
  const locale = lang === 'km' ? 'kh' : 'en';

  let searchResults = { news: [], pagination: { page: 1, pages: 1, total: 0 } };
  
  if (query) {
    searchResults = await searchNews(query, lang, currentPage, category);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Search News
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Find articles across all categories
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form method="GET" className="max-w-2xl">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search for news articles..."
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-colors duration-200"
            >
              Search
            </button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value=""
                defaultChecked={!category}
                className="mr-2"
              />
              <span className="text-sm">All Categories</span>
            </label>
            {['technology', 'business', 'sports', 'politics', 'entertainment', 'health'].map((cat) => (
              <label key={cat} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  defaultChecked={category === cat}
                  className="mr-2"
                />
                <span className="text-sm">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </label>
            ))}
          </div>
        </form>
      </div>

      {/* Search Results */}
      {query ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Search Results for &quot;{query}&quot;
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {searchResults.pagination.total > 0 
                ? `Found ${searchResults.pagination.total} article${searchResults.pagination.total !== 1 ? 's' : ''}`
                : 'No articles found'
              }
              {category && ` in ${category} category`}
            </p>
          </div>

          {searchResults.news.length > 0 ? (
            <>
              <NewsGrid articles={searchResults.news} locale={locale} />
              
              {/* Pagination */}
              {searchResults.pagination.pages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={searchResults.pagination.page}
                    totalPages={searchResults.pagination.pages}
                    baseUrl={`/${lang}/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We couldn&apos;t find any articles matching &quot;{query}&quot;
                  {category && ` in the ${category} category`}.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>Try:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Using different keywords</li>
                    <li>Checking your spelling</li>
                    <li>Using more general terms</li>
                    <li>Try searching for &quot;technology&quot;, &quot;sports&quot;, or &quot;business&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Search News Articles
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter keywords above to search through our news database
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
