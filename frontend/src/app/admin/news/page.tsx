'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { NewsArticle } from '@/types/news';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import NewsHeader from '@/components/admin/news/NewsHeader';
import NewsTable from '@/components/admin/news/NewsTable';
import NewsPagination from '@/components/admin/news/NewsPagination';

const NewsPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (!user) {
          throw new Error('Not authenticated');
        }
        
        setLoading(true);
        const { data } = await api.get('/news/admin', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setArticles(data.articles || []);
      } catch {
        setError('Failed to fetch news articles.');
        toast.error('Failed to fetch news articles.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/news/${id}`);
      setArticles(articles.filter((article) => article._id !== id));
      toast.success('Article deleted successfully.');
    } catch {
      toast.error('Failed to delete article.');
    }
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
          <CardDescription>Loading article data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gray-200 animate-pulse rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Card>
      <NewsHeader />
      <CardContent>
        <NewsTable articles={currentArticles} onDelete={handleDelete} />
      </CardContent>
      <NewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          indexOfFirstArticle={indexOfFirstArticle}
          indexOfLastArticle={indexOfLastArticle}
          totalArticles={articles.length}
        />
    </Card>
  );
};

export default NewsPage;
