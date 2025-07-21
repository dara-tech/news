import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';

interface NewsPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export const metadata: Metadata = {
  title: 'All News - NewsApp',
  description: 'Browse all the latest news articles from various categories including technology, business, sports, and more.',
};

async function getNewsData(lang: string, page: number = 1, category?: string, search?: string) {
  try {
    const params: Record<string, string | number> = { lang, page, limit: 12 };
    if (category) params.category = category;
    if (search) params.search = search;

    const response = await api.get('/news', { params });
    return {
      news: response.data?.news || response.data?.data || [],
      pagination: {
        page: response.data?.page || 1,
        pages: response.data?.pages || 1,
        total: response.data?.total || 0,
      }
    };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return {
      news: [],
      pagination: { page: 1, pages: 1, total: 0 }
    };
  }
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { lang } = await params;
  const { page, category, search } = await searchParams;
  
  const currentPage = parseInt(page || '1', 10);
  const { news, pagination } = await getNewsData(lang, currentPage, category, search);

  const locale = lang === 'km' ? 'kh' : 'en';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {search ? `Search Results for "${search}"` : 
           category ? `${category.charAt(0).toUpperCase() + category.slice(1)} News` : 
           'All News'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {pagination.total > 0 
            ? `Showing ${pagination.total} article${pagination.total !== 1 ? 's' : ''}`
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

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <a
            href={`/${lang}/news`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              !category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </a>
          {['technology', 'business', 'sports', 'politics', 'entertainment', 'health'].map((cat) => (
            <a
              key={cat}
              href={`/${lang}/news?category=${cat}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                category === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </a>
          ))}
        </div>
      </div>

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
                ? `No articles found in the ${category} category yet.`
                : 'No articles available at the moment.'
              }
            </p>
            <a
              href={`/${lang}`}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
