import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import NewsPageClient from './NewsPageClient';

interface NewsPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ 
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang === 'kh' ? 'kh' : 'en';
  
  const siteName = locale === 'kh' ? 'Razewire' : 'Razewire';
  const title = locale === 'kh' ? 'ព័ត៌មានទាំងអស់' : 'All News';
  const description = locale === 'kh' 
    ? 'ព័ត៌មានថ្មីៗ និងព័ត៌មានចុងក្រោយពី Razewire'
    : 'Latest news and updates from Razewire';

  return {
    title: `${title} - ${siteName}`,
    description,
    openGraph: {
      title: `${title} - ${siteName}`,
      description,
      type: 'website',
      locale: locale === 'kh' ? 'km_KH' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${siteName}`,
      description,
    },
    alternates: {
      canonical: `/${locale}/news`,
    },
  };
}

async function getNewsData(lang: string, page: number = 1, category?: string, search?: string, sort?: string) {
  try {
    console.log('getNewsData called with:', { lang, page, category, search, sort });
    
    const params: any = {
      lang,
      page,
      limit: 12,
    };

    if (category && category !== 'all') params.category = category;
    if (search) params.keyword = search;
    if (sort) params.sortBy = sort;

    console.log('API params:', params);

    const [newsRes, categoriesRes] = await Promise.all([
      api.get('/news', { params }),
      api.get('/categories', { timeout: 10000 }).catch(() => ({ data: { data: [] } })),
    ]);

    const news = newsRes.data?.news || newsRes.data?.data || [];
    const totalPages = newsRes.data?.pages || 1;
    const currentPage = newsRes.data?.page || 1;
    const categories = categoriesRes.data?.data || [];

    console.log('Successfully fetched data:', { newsCount: news.length, categoriesCount: categories.length });
    
    return {
      news: Array.isArray(news) ? news : [],
      categories: Array.isArray(categories) ? categories : [],
      pagination: {
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      status: (error as any).response?.status,
      data: (error as any).response?.data
    });
    return {
      news: [],
      categories: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { lang } = await params;
  const { page, category, search, sort } = await searchParams;
  
  const locale = lang === 'kh' ? 'kh' : 'en';
  
  // Validate locale
  if (!['en', 'kh'].includes(lang)) {
    notFound();
  }

  const currentPage = page ? parseInt(page, 10) : 1;
  
  // Ensure category is always a string
  const categoryString = typeof category === 'string' ? category : '';
  
  const newsData = await getNewsData(lang, currentPage, categoryString, search, sort);

  return (
    <NewsPageClient
      newsData={newsData}
      locale={locale}
      currentPage={currentPage}
      filters={{
        category: categoryString,
        search: search || '',
        sort: sort || 'latest',
      }}
    />
  );
}

// Enable caching for better performance
export const revalidate = 300;
