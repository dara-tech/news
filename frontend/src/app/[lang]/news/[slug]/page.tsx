import { Metadata } from 'next';
import { getArticle } from '@/lib/articles';
import { notFound } from 'next/navigation';
import NewsArticleLoader from './NewsArticleLoader';
import { generateOpenGraphMeta, openGraphToMetadata, loadOpenGraphSettings, defaultOpenGraphSettings } from '@/lib/opengraph';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3000';



export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
  const { slug, lang } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: lang === 'kh' ? 'អត្ថប្រយោគមិនត្រូវបានរកឃើញ' : 'Article not found',
      description: lang === 'kh' ? 'អត្ថប្រយោគដែលអ្នកកំពុងស្វែងរកមិនមានទេ។' : 'The article you are looking for does not exist.',
    };
  }

  // Load OpenGraph settings
  const opengraphSettings = await loadOpenGraphSettings() || defaultOpenGraphSettings;
  
  // Determine language settings
  const isKhmer = lang === 'kh';
  const locale = isKhmer ? 'kh' : 'en';
  const alternateLocale = isKhmer ? 'en' : 'kh';
  
  // Generate OpenGraph meta using the utility function
  const ogMeta = generateOpenGraphMeta(article, locale, BASE_URL, opengraphSettings);
  
  // Convert to Next.js Metadata format
  const metadata = openGraphToMetadata(ogMeta);

  // Add additional metadata
  const { title, description, tags, category } = article;
  const localizedTitle = typeof title === 'string' ? title : (title[locale] || title[alternateLocale] || 'Untitled');
  const localizedDescription = typeof description === 'string' ? description : (description[locale] || description[alternateLocale] || '');
  const categoryName = typeof category?.name === 'string' ? category.name : (category?.name?.[locale] || category?.name?.[alternateLocale] || 'News');
  
  // Prepare keywords
  const defaultKeywords = [categoryName, 'news', isKhmer ? 'ព័ត៌មាន' : 'ព័ត៌មាន'];
  const articleKeywords = tags || [];
  const keywords = [...new Set([...defaultKeywords, ...(Array.isArray(articleKeywords) ? articleKeywords : [])])];

  // Add canonical URL and language alternates
  metadata.metadataBase = new URL(BASE_URL);
  metadata.alternates = {
    canonical: ogMeta.url,
    languages: {
      'en': isKhmer ? `/en/news/${article.slug}` : undefined,
      'kh': !isKhmer ? `/kh/news/${article.slug}` : undefined,
    },
  };

  // Add keywords
  metadata.keywords = keywords.join(', ');

  // Add structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: localizedTitle,
    description: localizedDescription,
    image: ogMeta.image,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || article.author?.username || 'Razewire Author',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Razewire',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': ogMeta.url,
    },
  };

  // Add structured data and additional metadata
  metadata.other = {
    ...metadata.other,
    'article:published_time': article.createdAt,
    'article:modified_time': article.updatedAt,
    'article:section': categoryName,
    'article:tag': keywords.join(', '),
    'application/ld+json': JSON.stringify(structuredData),
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const locale = lang === 'kh' ? 'kh' : 'en';

  return <NewsArticleLoader article={article} locale={locale} />;
}

// Enable caching for better performance
export const revalidate = 300; // 5 minutes