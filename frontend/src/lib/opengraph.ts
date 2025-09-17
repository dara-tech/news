/**
 * OpenGraph utility functions for generating social media meta tags
 */

export interface OpenGraphSettings {
  enabled: boolean;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  imageWidth: number;
  imageHeight: number;
  siteName: string;
  locale: string;
  type: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  facebookAppId: string;
  customTags: string;
}

export interface ArticleData {
  title: string | { [key: string]: string };
  description: string | { [key: string]: string };
  thumbnail?: string;
  author?: {
    name?: string;
    username?: string;
  };
  createdAt: string;
  updatedAt: string;
  category?: {
    name: string | { [key: string]: string };
  };
  tags?: string[];
  slug: string | { [key: string]: string };
}

export interface OpenGraphMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  locale: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  facebookAppId?: string;
  customTags?: string;
}

/**
 * Get localized string from multilingual content
 */
function getLocalizedString(
  content: string | { [key: string]: string } | undefined,
  locale: string,
  fallback: string = ''
): string {
  if (!content) return fallback;
  if (typeof content === 'string') return content;
  return content[locale] || content['en'] || content['kh'] || fallback;
}

/**
 * Generate OpenGraph meta tags for an article
 */
export function generateOpenGraphMeta(
  article: ArticleData,
  locale: string,
  baseUrl: string,
  settings: OpenGraphSettings | null
): OpenGraphMeta {
  if (!settings || !settings.enabled) {
    // Get localized slug for fallback case too
    const articleSlug = typeof article.slug === 'string' ? article.slug : (article.slug[locale] || article.slug['en'] || 'article');
    
    return {
      title: settings?.defaultTitle || 'Razewire - Latest News & Updates',
      description: settings?.defaultDescription || 'Stay informed with the latest news...',
      image: settings?.defaultImage || 'https://www.razewire.online/og-image.svg',
      url: `${baseUrl}/${locale}/news/${articleSlug}`,
      type: settings?.type || 'website',
      siteName: settings?.siteName || 'Razewire',
      locale: settings?.locale || 'en_US',
      twitterCard: settings?.twitterCard || 'summary_large_image',
      twitterSite: settings?.twitterSite || '@razewire',
      twitterCreator: settings?.twitterCreator || '@razewire',
      facebookAppId: settings?.facebookAppId || '',
      customTags: settings?.customTags || '',
    };
  }

  // Get localized content
  const title = getLocalizedString(article.title, locale, settings?.defaultTitle || 'Razewire - Latest News & Updates');
  const description = getLocalizedString(article.description, locale, settings?.defaultDescription || 'Stay informed with the latest news...');
  const categoryName = getLocalizedString(article.category?.name, locale, 'News');
  
  // Generate image URL
  const imageUrl = article.thumbnail 
    ? (article.thumbnail.startsWith('http') ? article.thumbnail : `${baseUrl}${article.thumbnail}`)
    : settings?.defaultImage || 'https://www.razewire.online/og-image.svg';

  // Generate author name
  const authorName = article.author?.name || article.author?.username || '';

  // Get localized slug
  const articleSlug = typeof article.slug === 'string' ? article.slug : (article.slug[locale] || article.slug['en'] || 'article');

  return {
    title,
    description,
    image: imageUrl,
    url: `${baseUrl}/${locale}/news/${articleSlug}`,
    type: 'article',
    siteName: settings?.siteName || 'Razewire',
    locale: locale === 'kh' ? 'km_KH' : 'en_US',
    publishedTime: article.createdAt,
    modifiedTime: article.updatedAt,
    authors: authorName ? [authorName] : undefined,
    section: categoryName,
    tags: article.tags,
    twitterCard: settings?.twitterCard || 'summary_large_image',
    twitterSite: settings?.twitterSite || '@razewire',
    twitterCreator: settings?.twitterCreator || '@razewire',
    facebookAppId: settings?.facebookAppId || '',
    customTags: settings?.customTags || '',
  };
}

/**
 * Convert OpenGraph meta to Next.js Metadata format
 */
export function openGraphToMetadata(meta: OpenGraphMeta): any {
  const metadata: any = {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.url,
      siteName: meta.siteName,
      locale: meta.locale,
      type: meta.type,
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: meta.twitterCard,
      title: meta.title,
      description: meta.description,
      images: [meta.image],
      site: meta.twitterSite,
      creator: meta.twitterCreator,
    },
  };

  // Add article-specific OpenGraph properties
  if (meta.type === 'article') {
    metadata.openGraph.publishedTime = meta.publishedTime;
    metadata.openGraph.modifiedTime = meta.modifiedTime;
    if (meta.authors) {
      metadata.openGraph.authors = meta.authors;
    }
    if (meta.section) {
      metadata.openGraph.section = meta.section;
    }
    if (meta.tags) {
      metadata.openGraph.tags = meta.tags;
    }
  }

  // Add Facebook App ID if provided
  if (meta.facebookAppId) {
    metadata.openGraph.appId = meta.facebookAppId;
  }

  // Add custom tags if provided
  if (meta.customTags) {
    metadata.other = {
      ...metadata.other,
      // Parse custom tags and add them
      ...parseCustomTags(meta.customTags),
    };
  }

  return metadata;
}

/**
 * Parse custom HTML meta tags
 */
function parseCustomTags(customTags: string): Record<string, string> {
  const tags: Record<string, string> = {};
  
  if (!customTags.trim()) return tags;

  // Simple regex to extract meta tags
  const metaTagRegex = /<meta\s+([^>]+)>/gi;
  let match;

  while ((match = metaTagRegex.exec(customTags)) !== null) {
    const attributes = match[1];
    const nameMatch = attributes.match(/name=["']([^"']+)["']/);
    const contentMatch = attributes.match(/content=["']([^"']+)["']/);
    const propertyMatch = attributes.match(/property=["']([^"']+)["']/);

    if (nameMatch && contentMatch) {
      tags[nameMatch[1]] = contentMatch[1];
    } else if (propertyMatch && contentMatch) {
      tags[propertyMatch[1]] = contentMatch[1];
    }
  }

  return tags;
}

/**
 * Load OpenGraph settings from API
 */
export async function loadOpenGraphSettings(): Promise<OpenGraphSettings | null> {
  try {
    const response = await fetch('/api/admin/frontend-settings');
    if (response.ok) {
      const data = await response.json();
      return data.settings?.opengraph || null;
    }
  } catch (error) {
    console.error('Failed to load OpenGraph settings:', error);
  }
  return null;
}

/**
 * Default OpenGraph settings
 */
export const defaultOpenGraphSettings: OpenGraphSettings = {
  enabled: true,
  defaultTitle: 'Razewire - Latest News & Updates',
  defaultDescription: 'Stay informed with the latest news in technology, business, and sports from Cambodia and around the world.',
  defaultImage: 'https://www.razewire.online/og-image.svg',
  imageWidth: 1200,
  imageHeight: 630,
  siteName: 'Razewire',
  locale: 'en_US',
  type: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@razewire',
  twitterCreator: '@razewire',
  facebookAppId: '',
  customTags: '',
};
