'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewsCard from '@/components/news/NewsCard';
import NewsGridSkeleton from '@/components/news/NewsGridSkeleton';
import TwitterLikeLayout from '@/components/hero/TwitterLikeLayout';
import { Article } from '@/types';

interface NewsPageClientProps {
  newsData: {
    news: Article[];
    categories: Array<{
      _id: string;
      name: { en: string; kh: string };
      slug: string;
      color?: string;
      newsCount?: number;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  locale: 'en' | 'kh';
  currentPage: number;
  filters: {
    category: string;
    search: string;
    sort: string;
  };
}

export default function NewsPageClient({ 
  newsData, 
  locale, 
  currentPage, 
  filters 
}: NewsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const { news, categories, pagination } = newsData;

  // Reset loading when data changes
  useEffect(() => {
    setIsLoading(false);
  }, [news]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`/${locale}/news?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/${locale}/news?${params.toString()}`);
  };

  // Handle search with debouncing
  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        
        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        } else {
          params.delete('search');
        }
        
        params.delete('page');
        router.push(`/${locale}/news?${params.toString()}`);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.search, searchParams, router, locale]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Get localized category name
  const getLocalizedCategoryName = (category: any) => {
    if (!category) return '';
    if (typeof category.name === 'string') return category.name;
    return category.name[locale] || category.name.en || '';
  };

  // Main content component
  const NewsMainContent = () => (
    <div className="space-y-8 p-1 lg:p-0">
      {/* Header */}
      <div className="space-y-6 py-4 lg:py-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {locale === 'kh' ? 'ព័ត៌មានទាំងអស់' : 'All News'}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {locale === 'kh' 
              ? 'ព័ត៌មានថ្មីៗ និងព័ត៌មានចុងក្រោយពី Razewire'
              : 'Latest news and updates from Razewire'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={locale === 'kh' ? 'ស្វែងរកព័ត៌មាន...' : 'Search news...'}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
            {/* Category Filter */}
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-12">
                <SelectValue placeholder={locale === 'kh' ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === 'kh' ? 'ទាំងអស់' : 'All Categories'}</SelectItem>
                {categories.map((category) => {
                  const categorySlug = typeof category.slug === 'string' ? category.slug : (category.slug as any).en;
                  return (
                    <SelectItem key={category._id} value={categorySlug}>
                      {getLocalizedCategoryName(category)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-12">
                <SelectValue placeholder={locale === 'kh' ? 'តម្រៀប' : 'Sort By'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">{locale === 'kh' ? 'ថ្មីបំផុត' : 'Latest'}</SelectItem>
                <SelectItem value="popular">{locale === 'kh' ? 'ពេញនិយម' : 'Popular'}</SelectItem>
                <SelectItem value="views">{locale === 'kh' ? 'មើលច្រើន' : 'Most Viewed'}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg h-12 w-full sm:w-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none flex-1 sm:flex-initial h-full"
              >
                <Grid className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">{locale === 'kh' ? 'ក្រឡា' : 'Grid'}</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none flex-1 sm:flex-initial h-full"
              >
                <List className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">{locale === 'kh' ? 'បញ្ជី' : 'List'}</span>
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {((filters.category && filters.category !== 'all') || searchTerm || filters.sort !== 'latest') && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="gap-2 text-sm py-1 px-3">
                  {locale === 'kh' ? 'ស្វែងរក' : 'Search'}: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      handleFilterChange('search', '');
                    }}
                    className="ml-1 h-auto p-0 hover:text-destructive text-xs"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {filters.category && filters.category !== 'all' && (
                <Badge variant="secondary" className="gap-2 text-sm py-1 px-3">
                  {locale === 'kh' ? 'ប្រភេទ' : 'Category'}: {getLocalizedCategoryName(categories.find(c => {
                    const categorySlug = typeof c.slug === 'string' ? c.slug : (c.slug as any).en;
                    return categorySlug === filters.category;
                  }))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('category', 'all')}
                    className="ml-1 h-auto p-0 hover:text-destructive text-xs"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {filters.sort !== 'latest' && (
                <Badge variant="secondary" className="gap-2 text-sm py-1 px-3">
                  {locale === 'kh' ? 'តម្រៀប' : 'Sort'}: {filters.sort}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('sort', 'latest')}
                    className="ml-1 h-auto p-0 hover:text-destructive text-xs"
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* News Content */}
      <div className="space-y-6 pb-4 lg:pb-8">
        {isLoading ? (
          <NewsGridSkeleton />
        ) : news.length > 0 ? (
          <>
            {/* News Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {news.map((article) => (
                <NewsCard
                  key={article._id}
                  article={article}
                  locale={locale}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {locale === 'kh' ? 'មុន' : 'Previous'}
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  {locale === 'kh' ? 'បន្ត' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              {locale === 'kh' ? 'មិនមានព័ត៌មាន' : 'No news found'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {locale === 'kh' 
                ? 'សូមស្វែងរកព័ត៌មានផ្សេងទៀត'
                : 'Try searching for something else'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout - Full Width */}
      <div className="block lg:hidden">
        <div className="w-full">
          <NewsMainContent />
        </div>
      </div>

      {/* Desktop Layout - Twitter-like */}
      <div className="hidden lg:block">
        <TwitterLikeLayout
          breaking={[]}
          featured={[]}
          latestNews={[]}
          categories={categories.map(cat => ({ 
            ...cat, 
            newsCount: 0,
            slug: { en: cat.slug, kh: cat.slug }
          }))}
          locale={locale}
          customMainContent={<NewsMainContent />}
        />
      </div>
    </div>
  );
}
