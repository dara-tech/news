import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';
import type { Category } from '@/types';

interface NewsPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export const metadata: Metadata = {
  title: 'All News - NewsApp',
  description: 'Browse all the latest news articles from various categories including technology, business, sports, and more.',
};

function getLocalizedText(text: string | { [key: string]: string | undefined } | undefined, lang: string): string {
  const safeLang = lang === 'km' ? 'kh' : lang;
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[safeLang] === 'string') return text[safeLang]!;
    const values = Object.values(text).filter(Boolean);
    if (values.length > 0) return values[0] as string;
  }
  return '';
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const response = await fetch(`${apiUrl}/api/categories`, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

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

  // Fetch categories for filter chips
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {search ? `Search Results for "${search}"` :
           category ? `${getLocalizedText(categories.find((c: Category) => c.slug === category)?.name, locale) || category} News` :
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
          {categories.length === 0 ? (
            <span className="text-gray-400">Loading categories...</span>
          ) : (
            categories.map((cat: Category) => (
              <a
                key={typeof cat.slug === 'string' ? cat.slug : (cat.slug?.en || cat.slug?.kh || cat._id)}
                href={`/${lang}/news?category=${typeof cat.slug === 'string' ? cat.slug : (cat.slug?.en || cat.slug?.kh || cat._id)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  category === (typeof cat.slug === 'string' ? cat.slug : (cat.slug?.en || cat.slug?.kh || cat._id))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {getLocalizedText(cat.name, locale)}
              </a>
            ))
          )}
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
                ? `No articles found in the ${getLocalizedText(categories.find((c: Category) => c.slug === category)?.name, locale) || category} category yet.`
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
