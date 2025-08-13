import { MetadataRoute } from 'next';

const URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.razewire.online";

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date().toISOString();
  
  // Return a comprehensive news sitemap with static URLs
  // This ensures it always works regardless of API availability
  return [
    // Main news pages 
    {
      url: `${URL}/news`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
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
    {
      url: `${URL}/news?dateRange=month`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    
    // Category pages
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
      changeFrequency: 'hourly' as const,
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
      url: `${URL}/news?category=world`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?category=science`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    
    // Language-specific news pages
    {
      url: `${URL}/en/news`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${URL}/km/news`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    
    // Search and filter pages
    {
      url: `${URL}/news?sort=latest`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?sort=popular`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${URL}/news?sort=trending`,
      lastModified,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    
    // Archive pages
    {
      url: `${URL}/archive`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${URL}/archive?year=${new Date().getFullYear()}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    
    // Newsletter and subscription pages
    {
      url: `${URL}/newsletter`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];
}
