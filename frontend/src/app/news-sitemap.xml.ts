import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date().toISOString();
  
  try {
    const { default: api } = await import('@/lib/api');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
    
    try {
      // Fetch recent news articles (last 48 hours for news sitemap)
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { 
          limit: 100, // Reduced limit for faster response
          sort: 'publishedAt',
          status: 'published',
          // Only articles from last 48 hours for news sitemap
          publishedAfter: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      });
      
      clearTimeout(timeoutId);
      
      const articles = articlesResponse.data?.data?.news || [];
      
      if (articles.length > 0) {
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
                       lastModified,
          changeFrequency: 'daily' as const,
          priority: 0.9, // High priority for news articles
        }));
      } else {
        // Fallback: Return recent news pages even if API fails
        console.log('News Sitemap: No recent articles found, using fallback');
        return getFallbackNewsSitemap();
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('News Sitemap: API error, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return getFallbackNewsSitemap();
    }
    
  } catch (error) {
    console.log('News Sitemap: Import error, using fallback:', error instanceof Error ? error.message : 'Unknown error');
    return getFallbackNewsSitemap();
  }
}

// Fallback function to ensure sitemap always returns content
function getFallbackNewsSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString();
  
  // Return basic news structure even if API fails
  return [
    {
      url: `${URL}/news`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${URL}/news?category=technology`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=business`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=sports`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=breaking-news`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${URL}/news?category=politics`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=entertainment`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=health`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?dateRange=today`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${URL}/news?dateRange=week`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];
}
