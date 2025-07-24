import api from '@/lib/api';
import { Article, Category } from '@/types';
import HomePage from '@/components/home/HomePage';
import ErrorDisplay from '@/components/common/ErrorDisplay';

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
  } catch (err) {
    console.error('Failed to fetch news data:', err);
    throw new Error('Could not load news. Please try refreshing the page.');
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories');
    return response.data?.data || response.data || [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export default async function Home({ params }: HomeProps) {
  const { lang } = await params;

  try {
    const [newsData, categories] = await Promise.all([
      getNewsData(lang),
      getCategories(),
    ]);
    
    return <HomePage lang={lang} newsData={newsData} categories={categories} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay message={message} />
      </div>
    );
  }
}
