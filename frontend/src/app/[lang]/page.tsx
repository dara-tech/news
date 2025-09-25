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
  categories: Category[];
}

async function getNewsData(lang: 'en' | 'kh'): Promise<NewsData> {
  try {
    const [breakingRes, featuredRes, latestRes, categoriesRes] = await Promise.all([
      api.get('/news/breaking', { params: { lang } }),
      api.get('/news/featured', { params: { lang } }),
      api.get('/news', { params: { lang } }),
      api.get('/categories', { timeout: 15000 }),
    ]);

    return {
      breaking: breakingRes.data?.data || breakingRes.data || [],
      featured: featuredRes.data?.data || featuredRes.data || [],
      latest: latestRes.data?.news || latestRes.data?.data || latestRes.data || [],
      categories: categoriesRes.data?.data || categoriesRes.data || [],
    };
  } catch (error) {
    throw new Error('Could not load news. Please try refreshing the page.');
  }
}

export default async function Home({ params }: HomeProps) {
  const resolvedParams = await params;
  const newsData = await getNewsData(resolvedParams.lang);

  return (
    <MaintenanceCheck>
      <PerformanceGuard
        maxRenderTime={16}
        maxRendersPerSecond={30}
      >
        <HomePage 
          lang={resolvedParams.lang}
          newsData={newsData}
        />
      </PerformanceGuard>
    </MaintenanceCheck>
  );
}
