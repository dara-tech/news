import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { default: api } = await import('@/lib/api');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Fetch recent news articles (last 48 hours for news sitemap)
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { 
          limit: 1000,
          sort: 'publishedAt',
          status: 'published',
          // Only articles from last 48 hours for news sitemap
          publishedAfter: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      });
      
      clearTimeout(timeoutId);
      
      const articles = articlesResponse.data?.data?.news || [];
      
      return articles.map((article: {
        slug: string;
        publishedAt?: string;
        updatedAt?: string;
        title?: string;
        category?: string;
        language?: string;
      }) => ({
        url: `${URL}/news/${article.slug}`,
        lastModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : 
                     article.publishedAt ? new Date(article.publishedAt).toISOString() : 
                     new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.9, // High priority for news articles
      }));
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('News Sitemap: Error fetching articles:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
    
  } catch (error) {
    console.log('News Sitemap: Import error:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}
