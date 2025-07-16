import { Metadata } from 'next';
import { getArticle } from '@/lib/articles';
import NewsArticleFetcher from './NewsArticleFetcher';

const URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: 'Article not found',
      description: 'The article you are looking for does not exist.',
    };
  }

  const {
    title,
    description,
    thumbnail,
    slug,
    tags,
    createdAt,
    updatedAt,
    author,
  } = article;

  const enTitle = title.en || 'Untitled';
  const enDescription = description.en || 'No description available.';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: enTitle,
    description: enDescription,
    image: thumbnail || `${URL}/placeholder.jpg`,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: author.name || 'NewsApp Author',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NewsApp',
      logo: {
        '@type': 'ImageObject',
        url: `${URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${URL}/news/${slug}`,
    },
  };

  return {
    title: enTitle,
    description: enDescription,
    keywords: tags?.join(', ') || '',
    openGraph: {
      title: enTitle,
      description: enDescription,
      url: `${URL}/news/${slug}`,
      type: 'article',
      publishedTime: createdAt,
      modifiedTime: updatedAt,
      images: [
        {
          url: thumbnail || `${URL}/placeholder.jpg`,
          width: 1200,
          height: 630,
          alt: enTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: enTitle,
      description: enDescription,
      images: [thumbnail || `${URL}/placeholder.jpg`],
    },
    alternates: {
      canonical: `${URL}/news/${slug}`,
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsArticleFetcher id={id} />;
}
