import { Metadata } from 'next';
import { getArticle } from '@/lib/articles';
import { notFound } from 'next/navigation';
import NewsArticleLoader from './NewsArticleLoader';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || 'http://localhost:3000';



export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
  const { slug, lang } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: lang === 'km' ? 'អត្ថប្រយោគមិនត្រូវបានរកឃើញ' : 'Article not found',
      description: lang === 'km' ? 'អត្ថប្រយោគដែលអ្នកកំពុងស្វែងរកមិនមានទេ។' : 'The article you are looking for does not exist.',
    };
  }

  const { title, description, thumbnail, tags, createdAt, updatedAt, author, category } = article;

  // Determine language settings
  const isKhmer = lang === 'km';
  const locale = isKhmer ? 'kh' : 'en';
  const alternateLocale = isKhmer ? 'en' : 'kh';
  
  // Get localized content with fallbacks
  const localizedTitle = title[locale] || title[alternateLocale] || 'Untitled';
  const localizedDescription = description[locale] || description[alternateLocale] || '';
  const categoryName = category?.name?.[locale] || category?.name?.[alternateLocale] || 'News';
  
  // Create URLs
  const canonicalUrl = `${BASE_URL}/${lang}/news/${article.slug}`;
  // const alternateUrl = `${BASE_URL}/${isKhmer ? 'en' : 'km'}/news/${article.slug}`;
  const imageUrl = thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`) : `${BASE_URL}/placeholder.jpg`;

  // Prepare keywords
  const defaultKeywords = [categoryName, 'news', isKhmer ? 'ព័ត៌មាន' : 'ព័ត៌មាន'];
  const articleKeywords = tags || [];
  const keywords = [...new Set([...defaultKeywords, ...articleKeywords])];

  // Generate author name
  const authorName = author?.name || author?.username || 
                    (author?.email ? author.email.split('@')[0] : 'Razewire Author');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: localizedTitle,
    description: localizedDescription,
    image: imageUrl,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
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
      '@id': canonicalUrl,
    },
  };

  // Prepare metadata
  const metadata: Metadata = {
    title: localizedTitle,
    description: localizedDescription,
    keywords: keywords.join(', '),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: isKhmer ? `/en/news/${article.slug}` : undefined,
        km: !isKhmer ? `/km/news/${article.slug}` : undefined,
      },
    },
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      url: canonicalUrl,
              siteName: 'Razewire',
      locale: isKhmer ? 'km_KH' : 'en_US',
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: localizedTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: localizedTitle,
      description: localizedDescription,
      images: [imageUrl],
      creator: authorName,
              site: '@razewire',
    },
    other: {
      'article:published_time': createdAt,
      'article:modified_time': updatedAt,
      'article:section': categoryName,
      'article:tag': keywords.join(', '),
    },
  };

  // Add structured data as JSON-LD
  const otherMetadata: Record<string, string | number | (string | number)[]> = {
    'article:published_time': createdAt,
    'article:modified_time': updatedAt,
    'article:section': categoryName,
    'article:tag': keywords.join(', '),
    'application/ld+json': JSON.stringify(structuredData),
  };
  
  metadata.other = otherMetadata;

  return metadata;
}

export default async function Page({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const locale = lang === 'km' ? 'kh' : 'en';

  return <NewsArticleLoader article={article} locale={locale} />;
}
