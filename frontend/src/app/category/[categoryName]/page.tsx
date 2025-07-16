"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import NewsCard from '@/components/news/NewsCard';

interface Article {
  _id: string;
  slug: string;
  title: { en: string; kh: string };
  category: string;
  thumbnail?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryName = Array.isArray(params.categoryName) ? params.categoryName[0] : params.categoryName;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryName) {
      const fetchNews = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/news/category/${categoryName}`);
          setArticles(data.news || []);
        } catch (error) {
          console.error(`Failed to fetch news for category ${categoryName}:`, error);
          setArticles([]);
        } finally {
          setLoading(false);
        }
      };
      fetchNews();
    }
  }, [categoryName]);

  if (loading) {
    return <p>Loading articles...</p>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Category: {decodeURIComponent(categoryName || '')}</h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <p>No articles found in this category.</p>
      )}
    </div>
  );
}
