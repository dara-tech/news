import api from '@/lib/api';
import { Article, Category } from '@/types';
import MaintenanceCheck from '@/components/MaintenanceCheck';
import HomePage from '@/components/home/HomePage';
import PerformanceGuard from '@/components/performance/PerformanceGuard';
import { Button } from '@/components/ui/button';
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
  // Default fallback data structure
  const defaultData: NewsData = {
    breaking: [],
    featured: [],
    latest: [],
    categories: []
  };

  try {
    const [breakingRes, featuredRes, latestRes, categoriesRes] = await Promise.all([
      api.get('/news/breaking', { params: { lang } }).catch(() => ({ data: { data: [] } })),
      api.get('/news/featured', { params: { lang } }).catch(() => ({ data: { data: [] } })),
      api.get('/news', { params: { lang } }).catch(() => ({ data: { news: [] } })),
      api.get('/categories', { timeout: 15000 }).catch(() => ({ data: { data: [] } })),
    ]);

    // Safely extract data with proper fallbacks
    const breaking = Array.isArray(breakingRes?.data?.data) ? breakingRes.data.data : 
                    Array.isArray(breakingRes?.data) ? breakingRes.data : [];
    
    const featured = Array.isArray(featuredRes?.data?.data) ? featuredRes.data.data : 
                    Array.isArray(featuredRes?.data) ? featuredRes.data : [];
    
    const latest = Array.isArray(latestRes?.data?.news) ? latestRes.data.news : 
                  Array.isArray(latestRes?.data?.data) ? latestRes.data.data : 
                  Array.isArray(latestRes?.data) ? latestRes.data : [];
    
    const categories = Array.isArray(categoriesRes?.data?.data) ? categoriesRes.data.data : 
                     Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

    return {
      breaking,
      featured,
      latest,
      categories
    };
  } catch (error) {
    console.error('Error fetching news data:', error);
    // Return default data instead of throwing error
    return defaultData;
  }
}

export default async function Home({ params }: HomeProps) {
  try {
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
  } catch (error) {
    console.error('Error in Home component:', error);
    
    // Return a fallback component instead of crashing
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">We're having trouble loading the news. Please try again later.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
}
