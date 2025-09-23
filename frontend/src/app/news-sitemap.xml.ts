import { MetadataRoute } from 'next';

// Use a static URL or fallback to a default
const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Dynamically import to prevent loading issues
    const { default: api } = await import('@/lib/api');
    
    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      // Fetch recent news articles (last 2 days for news sitemap)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { 
          limit: 1000, // Get more articles for news sitemap
          sort: 'publishedAt',
          status: 'published',
          publishedAfter: twoDaysAgo.toISOString()
        }
      });
      
      clearTimeout(timeoutId);
      
      const articles = articlesResponse.data?.data?.news || [];
      
      // Create news sitemap entries
      const newsEntries = articles.map((article: {
        slug: string;
        title: string | { [key: string]: string };
        description: string | { [key: string]: string };
        publishedAt?: string;
        updatedAt?: string;
        category?: {
          name: string | { [key: string]: string };
        };
        tags?: string[];
        thumbnail?: string;
      }) => {
        const title = typeof article.title === 'string' 
          ? article.title 
          : article.title?.en || Object.values(article.title || {})[0] || 'News Article';
        
        const description = typeof article.description === 'string' 
          ? article.description 
          : article.description?.en || Object.values(article.description || {})[0] || '';
        
        const categoryName = typeof article.category?.name === 'string' 
          ? article.category.name 
          : article.category?.name?.en || Object.values(article.category?.name || {})[0] || 'News';
        
        const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const lastModified = article.updatedAt ? new Date(article.updatedAt) : publishedDate;
        
        return {
          url: `${URL}/news/${article.slug}`,
          lastModified: lastModified.toISOString(),
          changeFrequency: 'hourly' as const,
          priority: 0.9, // High priority for news articles
          // Additional news-specific metadata
          news: {
            title,
            description,
            publicationDate: publishedDate.toISOString(),
            category: categoryName,
            tags: article.tags || [],
            image: article.thumbnail || `${URL}/og-image.svg`
          }
        };
      });
      
      // Add language-specific news entries
      const languageNewsEntries = articles.flatMap((article: {
        slug: string;
        title: string | { [key: string]: string };
        description: string | { [key: string]: string };
        publishedAt?: string;
        updatedAt?: string;
        category?: {
          name: string | { [key: string]: string };
        };
        tags?: string[];
        thumbnail?: string;
      }) => {
        const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const lastModified = article.updatedAt ? new Date(article.updatedAt) : publishedDate;
        
        return [
          {
            url: `${URL}/en/news/${article.slug}`,
            lastModified: lastModified.toISOString(),
            changeFrequency: 'hourly' as const,
            priority: 0.9,
            news: {
              title: typeof article.title === 'string' 
                ? article.title 
                : article.title?.en || 'News Article',
              description: typeof article.description === 'string' 
                ? article.description 
                : article.description?.en || '',
              publicationDate: publishedDate.toISOString(),
              category: typeof article.category?.name === 'string' 
                ? article.category.name 
                : article.category?.name?.en || 'News',
              tags: article.tags || [],
              image: article.thumbnail || `${URL}/og-image.svg`
            }
          },
          {
            url: `${URL}/kh/news/${article.slug}`,
            lastModified: lastModified.toISOString(),
            changeFrequency: 'hourly' as const,
            priority: 0.9,
            news: {
              title: typeof article.title === 'string' 
                ? article.title 
                : article.title?.kh || 'ព័ត៌មាន',
              description: typeof article.description === 'string' 
                ? article.description 
                : article.description?.kh || '',
              publicationDate: publishedDate.toISOString(),
              category: typeof article.category?.name === 'string' 
                ? article.category.name 
                : article.category?.name?.kh || 'ព័ត៌មាន',
              tags: article.tags || [],
              image: article.thumbnail || `${URL}/og-image.svg`
            }
          }
        ];
      });
      
      // Combine all news entries
      const allNewsEntries = [...newsEntries, ...languageNewsEntries];
      
      // Sort by publication date (newest first)
      allNewsEntries.sort((a, b) => {
        const dateA = new Date(a.news?.publicationDate || a.lastModified);
        const dateB = new Date(b.news?.publicationDate || b.lastModified);
        return dateB.getTime() - dateA.getTime();
      });
      
      return allNewsEntries;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching news for sitemap:', error);
      return [];
    }
    
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return [];
  }
}