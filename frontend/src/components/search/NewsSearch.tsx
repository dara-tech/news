'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import InfiniteScrollFeed from '@/components/hero/InfiniteScrollFeed';
import type { Article, Category } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewsSearchProps {
  categories: Category[];
  locale: 'en' | 'kh';
  className?: string;
}

const NewsSearch: React.FC<NewsSearchProps> = ({ categories, locale, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'views' | 'publishedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { language } = useOptimizedLanguage();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // This will be handled by the InfiniteScrollFeed component
      setSearchResults([]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const sortOptions = [
    { value: 'createdAt', label: language === 'kh' ? 'កាលបរិច្ឆេទ' : 'Date' },
    { value: 'views', label: language === 'kh' ? 'ចំនួនមើល' : 'Views' },
    { value: 'publishedAt', label: language === 'kh' ? 'ថ្ងៃចុះផ្សាយ' : 'Published' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {language === 'kh' ? 'ស្វែងរកព័ត៌មាន' : 'Search News'}
        </h2>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={language === 'kh' ? 'ស្វែងរកព័ត៌មាន...' : 'Search for news...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {language === 'kh' ? 'តម្រង' : 'Filters'}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {language === 'kh' ? 'តម្រៀបតាម:' : 'Sort by:'}
            </span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="text-sm h-8 w-auto min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="h-8 w-8 p-0"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-muted/50 rounded-lg"
            >
              <h3 className="font-semibold">
                {language === 'kh' ? 'ប្រភេទព័ត៌មាន' : 'Categories'}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('')}
                >
                  {language === 'kh' ? 'ទាំងអស់' : 'All'}
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category._id}
                    variant={selectedCategory === category._id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category._id)}
                  >
                    {typeof category.name === 'string' 
                      ? category.name 
                      : category.name[language] || category.name.en || category.name.kh
                    }
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <InfiniteScrollFeed
          initialArticles={[]}
          locale={locale}
          searchQuery={searchQuery}
          categoryId={selectedCategory || undefined}
          sortBy={sortBy}
          sortOrder={sortOrder}
          hasMore={true}
          className="mt-6"
        />
      )}

      {/* No Search Query State */}
      {!searchQuery && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {language === 'kh' ? 'ស្វែងរកព័ត៌មាន' : 'Search for News'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'kh' 
              ? 'វាយបញ្ចូលពាក្យស្វែងរកដើម្បីចាប់ផ្តើមស្វែងរកព័ត៌មាន'
              : 'Enter a search term to start looking for news articles'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsSearch;