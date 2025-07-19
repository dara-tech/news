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
      title: 'Article not found',
      description: 'The article you are looking for does not exist.',
    };
  }

  const { title, description, thumbnail, tags, createdAt, updatedAt, author } = article;

  const locale = lang === 'km' ? 'kh' : 'en';
  const pageTitle = title[locale] || title.en || 'Untitled';
  const pageDescription = description[locale] || description.en || 'No description available.';
  const shareUrl = `${BASE_URL}/${lang}/news/${lang === 'km' ? article._id : article.slug}`;
  const imageUrl = thumbnail || `${BASE_URL}/placeholder.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle,
    description: pageDescription,
    image: imageUrl,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: author?.name || 'NewsApp Author',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NewsApp',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': shareUrl,
    },
  };

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: tags?.join(', ') || '',
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: shareUrl,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: shareUrl,
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  };
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
