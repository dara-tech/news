'use client';

import { useState, useEffect } from 'react';
import { getArticle } from '@/lib/articles';
import NewsArticleLoader from './NewsArticleLoader';
import { Article } from '@/types';

export default function NewsArticleFetcher({ id }: { id: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const fetchedArticle = await getArticle(id);
        if (fetchedArticle) {
          setArticle(fetchedArticle);
        } else {
          setError('Article not found');
        }
      } catch {
        setError('Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <p>Loading article...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!article) {
    return <p>Article not found</p>;
  }

  return <NewsArticleLoader article={article} />;
}
