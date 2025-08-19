import api from '@/lib/api';
import { Article, Category } from '@/types';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import HomePage from '@/components/home/HomePage';

interface HomeProps {
  params: Promise<{ lang: 'en' | 'km' }>;
}

interface NewsData {
  breaking: Article[];
  featured: Article[];
  latest: Article[];
}

async function getNewsData(lang: 'en' | 'km'): Promise<NewsData> {
  try {
    console.log('Fetching news data for lang:', lang);
    const [breakingRes, featuredRes, latestRes] = await Promise.all([
      api.get('/news/breaking', { params: { lang } }),
      api.get('/news/featured', { params: { lang } }),
      api.get('/news', { params: { lang } }),
    ]);

    console.log('Breaking news response:', breakingRes);
    console.log('Featured news response:', featuredRes);
    console.log('Latest news response:', latestRes);

    return {
      breaking: breakingRes.data?.data || breakingRes.data || [],
      featured: featuredRes.data?.data || featuredRes.data || [],
      latest: latestRes.data?.news || latestRes.data?.data || latestRes.data || [],
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw new Error('Could not load news. Please try refreshing the page.');
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    console.log('Fetching categories...');
    const response = await api.get('/categories', { timeout: 15000 });
    console.log('Categories response:', response);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home({ params }: HomeProps) {
  console.log('Home page: component rendering');
  
  const resolvedParams = await params;
  const [newsData, categories] = await Promise.all([
    getNewsData(resolvedParams.lang),
    getCategories()
  ]);

  return (
    <MaintenanceCheck>
      <HomePage 
        lang={resolvedParams.lang}
        newsData={newsData}
        categories={categories}
      />
    </MaintenanceCheck>
  );
}
