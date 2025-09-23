import { MetadataRoute } from 'next';

// Use a static URL or fallback to a default
const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

export default async function imageSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Dynamically import to prevent loading issues
    const { default: api } = await import('@/lib/api');
    
    // Set a timeout for the API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      // Fetch articles with images
      const articlesResponse = await api.get('/news', { 
        signal: controller.signal,
        params: { 
          limit: 1000,
          sort: 'publishedAt',
          status: 'published',
          hasImages: true // Only articles with images
        }
      });
      
      clearTimeout(timeoutId);
      
      const articles = articlesResponse.data?.data?.news || [];
      
      // Create image sitemap entries
      const imageEntries = articles.map((article: {
        slug: string;
        title: string | { [key: string]: string };
        description: string | { [key: string]: string };
        thumbnail?: string;
        images?: string[];
        publishedAt?: string;
        updatedAt?: string;
        category?: {
          name: string | { [key: string]: string };
        };
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
        
        // Collect all images from the article
        const images = [];
        if (article.thumbnail) {
          images.push({
            url: article.thumbnail.startsWith('http') ? article.thumbnail : `${URL}${article.thumbnail}`,
            title: `${title} - Featured Image`,
            caption: description.substring(0, 200)
          });
        }
        
        if (article.images && Array.isArray(article.images)) {
          article.images.forEach((image, index) => {
            if (image) {
              images.push({
                url: image.startsWith('http') ? image : `${URL}${image}`,
                title: `${title} - Image ${index + 1}`,
                caption: description.substring(0, 200)
              });
            }
          });
        }
        
        return {
          url: `${URL}/news/${article.slug}`,
          lastModified: lastModified.toISOString(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
          // Image-specific metadata
          images: images.map(img => ({
            url: img.url,
            title: img.title,
            caption: img.caption
          }))
        };
      });
      
      // Add language-specific image entries
      const languageImageEntries = articles.flatMap((article: {
        slug: string;
        title: string | { [key: string]: string };
        description: string | { [key: string]: string };
        thumbnail?: string;
        images?: string[];
        publishedAt?: string;
        updatedAt?: string;
        category?: {
          name: string | { [key: string]: string };
        };
      }) => {
        const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const lastModified = article.updatedAt ? new Date(article.updatedAt) : publishedDate;
        
        // Collect all images from the article
        const images = [];
        if (article.thumbnail) {
          images.push({
            url: article.thumbnail.startsWith('http') ? article.thumbnail : `${URL}${article.thumbnail}`,
            title: `${typeof article.title === 'string' ? article.title : article.title?.en || 'News Article'} - Featured Image`,
            caption: (typeof article.description === 'string' ? article.description : article.description?.en || '').substring(0, 200)
          });
        }
        
        if (article.images && Array.isArray(article.images)) {
          article.images.forEach((image, index) => {
            if (image) {
              images.push({
                url: image.startsWith('http') ? image : `${URL}${image}`,
                title: `${typeof article.title === 'string' ? article.title : article.title?.en || 'News Article'} - Image ${index + 1}`,
                caption: (typeof article.description === 'string' ? article.description : article.description?.en || '').substring(0, 200)
              });
            }
          });
        }
        
        return [
          {
            url: `${URL}/en/news/${article.slug}`,
            lastModified: lastModified.toISOString(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
            images: images.map(img => ({
              url: img.url,
              title: img.title,
              caption: img.caption
            }))
          },
          {
            url: `${URL}/kh/news/${article.slug}`,
            lastModified: lastModified.toISOString(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
            images: images.map(img => ({
              url: img.url,
              title: img.title,
              caption: img.caption
            }))
          }
        ];
      });
      
      // Add static images
      const staticImages = [
        {
          url: `${URL}/og-image.svg`,
          title: 'Razewire Logo',
          caption: 'Razewire - Your Daily Source of News'
        },
        {
          url: `${URL}/favicon.svg`,
          title: 'Razewire Favicon',
          caption: 'Razewire Favicon'
        }
      ];
      
      const staticImageEntries = [
        {
          url: `${URL}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly' as const,
          priority: 1.0,
          images: staticImages
        }
      ];
      
      // Combine all image entries
      const allImageEntries = [...imageEntries, ...languageImageEntries, ...staticImageEntries];
      
      // Sort by last modified date (newest first)
      allImageEntries.sort((a, b) => {
        const dateA = new Date(a.lastModified);
        const dateB = new Date(b.lastModified);
        return dateB.getTime() - dateA.getTime();
      });
      
      return allImageEntries;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching images for sitemap:', error);
      return [];
    }
    
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return [];
  }
}


