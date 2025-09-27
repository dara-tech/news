'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {  AnimatePresence } from 'framer-motion';
import type { Article } from '@/types';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { newsService } from '@/lib/newsService';
import ArticleCard from './ArticleCard';
import LoadingSkeleton from './LoadingSkeleton';

import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import EndOfContent from './EndOfContent';
import ScrollToTopButton from './ScrollToTopButton';

interface InfiniteScrollFeedProps {
  initialArticles: Article[];
  locale: 'en' | 'kh';
  onLoadMore?: (page: number) => Promise<Article[]>;
  hasMore?: boolean;
  className?: string;
  categoryId?: string;
  searchQuery?: string;
  sortBy?: 'createdAt' | 'views' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}


const InfiniteScrollFeed: React.FC<InfiniteScrollFeedProps> = ({
  initialArticles,
  locale,
  onLoadMore,
  hasMore = true,
  className = '',
  categoryId,
  searchQuery,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { language } = useOptimizedLanguage();

  // Create fetch function for infinite scroll
  const fetchMore = useCallback(async (page: number): Promise<Article[]> => {
    if (onLoadMore) {
      return onLoadMore(page);
    }

    try {
      let response;
      if (searchQuery) {
        response = await newsService.searchNews(searchQuery, locale, page);
      } else if (categoryId) {
        response = await newsService.getNewsByCategory(categoryId, locale, page);
      } else {
        response = await newsService.getNews({
          lang: locale,
          page,
          limit: 10,
          sortBy,
          sortOrder
        });
      }
      return response.news;
    } catch (error) {
      console.error('Error fetching more articles:', error);
      return [];
    }
  }, [onLoadMore, searchQuery, categoryId, locale, sortBy, sortOrder]);

  // Use infinite scroll hook
  const {
    data: articles,
    loading,
    error,
    hasMore: hasMoreData,
    loadMore,
    refresh,
    loadingRef
  } = useInfiniteScroll({
    initialData: initialArticles,
    fetchMore,
    hasMore
  });

  // Debug logging for feed state
  console.log('InfiniteScrollFeed debug:', {
    initialArticlesCount: initialArticles.length,
    currentArticlesCount: articles.length,
    loading,
    error,
    hasMore: hasMoreData,
    hasOnLoadMore: !!onLoadMore,
    searchQuery,
    categoryId
  });

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize article cards to prevent unnecessary re-renders
  const articleCards = useMemo(() => 
    articles.map((article, index) => (
      <ArticleCard
        key={`${article._id}-${index}`}
        article={article}
        locale={locale}
        index={index}
        isLast={index === articles.length - 1}
      />
    )), [articles, locale]
  );

  return (
    <div className={`relative ${className}`}>
  
      {/* Error State */}
      {error && (
        <ErrorState
          error={error}
          onRetry={refresh}
        />
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        {articles.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {articleCards}
          </AnimatePresence>
        ) : !loading ? (
          <EmptyState
            searchQuery={searchQuery}
            onRefresh={refresh}
          />
        ) : null}
      </div>

      {/* Loading Trigger */}
      <div ref={loadingRef} className="mt-8">
        {loading && <LoadingSkeleton />}
        
        {!hasMoreData && articles.length > 0 && (
          <EndOfContent />
        )}
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton
        show={showScrollTop}
        onClick={scrollToTop}
      />
    </div>
  );
};

export default InfiniteScrollFeed;
