'use client';

import dynamic from 'next/dynamic';
import { NewsArticleProps } from './NewsArticle';

// Dynamically import the NewsArticle component with SSR disabled
const NewsArticle = dynamic<NewsArticleProps>(() => import('./NewsArticle'), {
  ssr: false,
  // Optional: add a loading component
  loading: () => <p>Loading article...</p>,
});

// This loader component is a client component that wraps the dynamic import
export default function NewsArticleLoader({ article }: NewsArticleProps) {
  return <NewsArticle article={article} />;
}
