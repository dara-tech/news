import { Metadata } from 'next';
import api from '@/lib/api';
import NewsGrid from '@/components/news/NewsGrid';
import Pagination from '@/components/common/Pagination';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.razewire.online';

export const metadata: Metadata = {
  title: 'News Archive - Razewire',
  description: 'Browse archived news articles by date, category, and more. Find historical news and past articles.',
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: `${BASE_URL}/archive`,
  },
  openGraph: {
    title: 'News Archive - Razewire',
    description: 'Browse archived news articles by date, category, and more.',
    url: `${BASE_URL}/archive`,
    siteName: 'Razewire',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News Archive - Razewire',
    description: 'Browse archived news articles by date, category, and more.',
    site: '@razewire',
  },
};

interface ArchivePageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ 
    page?: string; 
    year?: string; 
    month?: string; 
    category?: string;
  }>;
}


async function getArchiveData(lang: string, page: number = 1, year?: string, month?: string, category?: string) {
  try {
    const params: Record<string, string | number> = { lang, page, limit: 12 };
    if (year) params.year = year;
    if (month) params.month = month;
    if (category) params.category = category;

    const response = await api.get('/news/archive', { params });
    return {
      news: response.data?.news || response.data?.data || [],
      pagination: {
        page: response.data?.page || 1,
        pages: response.data?.pages || 1,
        total: response.data?.total || 0,
      },
      years: response.data?.years || [],
      months: response.data?.months || []
    };
  } catch {
    // Remove unused error variable to fix lint error
    return {
      news: [],
      pagination: { page: 1, pages: 1, total: 0 },
      years: [],
      months: []
    };
  }
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default async function ArchivePage({ params, searchParams }: ArchivePageProps) {
  const { lang } = await params;
  const { page, year, month, category } = await searchParams;
  
  const currentPage = parseInt(page || '1', 10);
  const { news, pagination, years } = await getArchiveData(lang, currentPage, year, month, category);

  const locale: 'en' | 'kh' = lang as 'en' | 'kh';
  const currentYear = new Date().getFullYear();
  const availableYears = years.length > 0 ? years : Array.from(
    { length: 5 }, 
    (_, i) => currentYear - i
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          News Archive
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Browse our complete collection of news articles
        </p>
      </div>

      {/* Archive Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <form method="GET" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                name="year"
                title="Filter articles by year"
                defaultValue={year || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                {availableYears.map((y: number) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <select
                name="month"
                title="Filter articles by month"
                defaultValue={month || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Months</option>
                {monthNames.map((m, index) => (
                  <option key={index + 1} value={index + 1}>{m}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                title="Filter articles by category"
                defaultValue={category || ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {['technology', 'business', 'sports', 'politics', 'entertainment', 'health'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {year || month || category ? 'Filtered Results' : 'All Articles'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {pagination.total > 0 
            ? `Showing ${pagination.total} article${pagination.total !== 1 ? 's' : ''}`
            : 'No articles found'
          }
          {year && ` from ${year}`}
          {month && ` in ${monthNames[parseInt(month) - 1]}`}
          {category && ` in ${category} category`}
        </p>
      </div>

      {/* Archive Content */}
      {news.length > 0 ? (
        <>
          <NewsGrid articles={news} locale={locale} />
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                baseUrl={`/${lang}/archive${
                  year || month || category 
                    ? `?${new URLSearchParams({ 
                        ...(year && { year }), 
                        ...(month && { month }), 
                        ...(category && { category }) 
                      }).toString()}`
                    : ''
                }`}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No Articles Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No articles found for the selected filters.
            </p>
            <a
              href={`/${lang}/archive`}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              View All Articles
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
