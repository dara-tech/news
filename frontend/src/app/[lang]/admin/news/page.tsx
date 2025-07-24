'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { NewsArticle } from '@/types/news';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import NewsHeader from '@/components/admin/news/NewsHeader';
import NewsTable from '@/components/admin/news/NewsTable';
import NewsPagination from '@/components/admin/news/NewsPagination';
import NewsTableSkeleton from '@/components/admin/news/NewsTableSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

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

  const handleDuplicate = async (id: string) => {
    try {
      const { data: newArticle } = await api.post(`/news/${id}/duplicate`);
      setArticles([newArticle, ...articles]);
      toast.success('Article duplicated successfully. You can now edit the draft.');
    } catch {
      toast.error('Failed to duplicate article.');
    }
  };

  const handleStatusChange = (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    setArticles(articles.map(article => 
      article._id === id ? { ...article, status: newStatus } : article
    ));
  };

  const handleExport = () => {
    try {
      // Convert articles to CSV format
      const headers = ['Title', 'Status', 'Author', 'Created Date', 'Views', 'Category'];
      const csvContent = [
        headers.join(','),
        ...filteredArticles.map(article => [
          `"${article.title.en.replace(/"/g, '""')}"`,
          article.status,
          `"${article.author?.name || 'Unknown'}"`,
          new Date(article.createdAt).toLocaleDateString(),
          article.views || 0,
          `"${article.category?.name?.en || 'Uncategorized'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `news-articles-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Articles exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export articles.');
    }
  };

  const handleBulkDelete = async (selectedArticles: NewsArticle[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = selectedArticles.map(article => 
        api.delete(`/news/${article._id}`)
      );
      
      await Promise.all(deletePromises);
      
      const deletedIds = selectedArticles.map(article => article._id);
      setArticles(articles.filter(article => !deletedIds.includes(article._id)));
      
      toast.success(`${selectedArticles.length} article(s) deleted successfully.`);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete some articles.');
    }
  };

  const handleAdd = () => {
    window.location.href = '/admin/news/create';
  };

  // Filtering and Pagination logic
  const filteredArticles = articles;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const renderContent = () => {
    if (loading) {
      return <NewsTableSkeleton />;
    }

    if (error) {
      return <ErrorState message={error} />;
    }

    if (articles.length === 0) {
      return <EmptyState title="No Articles Found" description="You haven't created any news articles yet. Get started by creating one." />;
    }

    if (filteredArticles.length === 0) {
      return <EmptyState title="No Matching Articles" description="Your search for '${searchTerm}' did not return any results." />;
    }

    return (
      <>
        <NewsTable 
          articles={currentArticles} 
          onDelete={handleDelete} 
          onDuplicate={handleDuplicate} 
          onStatusChange={handleStatusChange}
          onAdd={handleAdd}
          onExport={handleExport}
          onBulkDelete={handleBulkDelete}
        />
        <NewsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          indexOfFirstArticle={indexOfFirstArticle}
          indexOfLastArticle={indexOfLastArticle}
          totalArticles={filteredArticles.length}
        />
      </>
    );
  };

  return (
    <Card>
      <NewsHeader />
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default NewsPage;
