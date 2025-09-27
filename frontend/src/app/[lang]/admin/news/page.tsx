'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface FilterState {
  status?: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

const NewsPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const [categories, setCategories] = useState<Array<{ _id: string; name: { en: string; kh: string } }>>([]);
  const [authors, setAuthors] = useState<Array<{ _id: string; username: string; email: string }>>([]);
  const articlesPerPage = 10;

  // Fetch categories and authors for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, authorsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users')
        ]);
        
        setCategories(categoriesRes.data?.data || []);
        setAuthors(authorsRes.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch news with search and filters
  const fetchNews = useCallback(async () => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: articlesPerPage,
        ...filters
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const { data } = await api.get('/news/admin', {
        params,
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setArticles(data.articles || []);
      setTotalPages(data.totalPages || 1);
      setTotalArticles(data.totalArticles || (data.articles?.length || 0));
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to fetch news articles.');
      toast.error('Failed to fetch news articles.');
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, searchTerm, filters, articlesPerPage]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

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
        ...(Array.isArray(articles) ? articles : []).map(article => [
          `"${article.title.en.replace(/"/g, '""')}"`,
          article.status,
          `"${article.author?.email || 'Unknown'}"`,
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
    } catch {
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
    } catch {
      toast.error('Failed to delete some articles.');
    }
  };

  const handleAdd = () => {
    window.location.href = '/admin/news/create';
  };

  // Search and filter handlers
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFilter = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Pagination indexes for display
  const indexOfFirstArticle = (currentPage - 1) * articlesPerPage;
  const indexOfLastArticle = indexOfFirstArticle + (articles?.length || 0);

  // Ensure current page is valid when articles change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

    return (
      <>
        <NewsTable 
          articles={articles} 
          onDelete={handleDelete} 
          onDuplicate={handleDuplicate} 
          onStatusChange={handleStatusChange}
          onAdd={handleAdd}
          onExport={handleExport}
          onBulkDelete={handleBulkDelete}
        />
        {totalPages > 1 && (
          <NewsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={handlePageChange}
            indexOfFirstArticle={indexOfFirstArticle}
            indexOfLastArticle={indexOfLastArticle}
            totalArticles={totalArticles}
          />
        )}
      </>
    );
  };

  return (
    <Card>
      <NewsHeader
        onSearch={handleSearch}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        searchTerm={searchTerm}
        activeFilters={filters}
        categories={categories}
        authors={authors}
        totalResults={totalArticles}
      />
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default NewsPage;
