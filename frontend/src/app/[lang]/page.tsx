import api from '@/lib/api';
import { Article, Category } from '@/types';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import HomePage from '@/components/home/HomePage';
import PerformanceGuard from '@/components/performance/PerformanceGuard';

interface HomeProps {
  params: Promise<{ lang: 'en' | 'kh' }>;
}

interface NewsData {
  breaking: Article[];
  featured: Article[];
  latest: Article[];
}

async function getNewsData(lang: 'en' | 'kh'): Promise<NewsData> {
  try {
    const [breakingRes, featuredRes, latestRes] = await Promise.all([
      api.get('/news/breaking', { params: { lang } }),
      api.get('/news/featured', { params: { lang } }),
      api.get('/news', { params: { lang } }),
    ]);

    return {
      breaking: breakingRes.data?.data || breakingRes.data || [],
      featured: featuredRes.data?.data || featuredRes.data || [],
      latest: latestRes.data?.news || latestRes.data?.data || latestRes.data || [],
    };
  } catch (error) {
    throw new Error('Could not load news. Please try refreshing the page.');
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories', { timeout: 15000 });
    return response.data?.data || response.data || [];
  } catch (error) {
    return [];
  }
}

export default async function Home({ params }: HomeProps) {
  const resolvedParams = await params;
  const [newsData, categories] = await Promise.all([
    getNewsData(resolvedParams.lang),
    getCategories()
  ]);

  return (
    <MaintenanceCheck>
      <PerformanceGuard
        maxRenderTime={16}
        maxRendersPerSecond={30}
      >
        <HomePage 
          lang={resolvedParams.lang}
          newsData={newsData}
          categories={categories}
        />
      </PerformanceGuard>
    </MaintenanceCheck>
  );
}
