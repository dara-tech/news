'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NewsHeaderProps {
  onSearch: (searchTerm: string) => void;
  onFilter: (filters: {
    status?: string;
    category?: string;
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => void;
  onClearFilters: () => void;
  searchTerm: string;
  activeFilters: {
    status?: string;
    category?: string;
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  categories?: Array<{ _id: string; name: { en: string; kh: string } }>;
  authors?: Array<{ _id: string; username: string; email: string }>;
  totalResults?: number;
}

const NewsHeader = ({ 
  onSearch, 
  onFilter, 
  onClearFilters, 
  searchTerm, 
  activeFilters, 
  categories = [], 
  authors = [],
  totalResults = 0
}: NewsHeaderProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    activeFilters.dateFrom ? new Date(activeFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    activeFilters.dateTo ? new Date(activeFilters.dateTo) : undefined
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearch]);

  const handleFilterChange = (key: string, value: string) => {
    onFilter({ ...(activeFilters || {}), [key]: value });
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', date: Date | undefined) => {
    if (key === 'dateFrom') {
      setDateFrom(date);
      onFilter({ ...(activeFilters || {}), dateFrom: date ? date.toISOString().split('T')[0] : undefined });
    } else {
      setDateTo(date);
      onFilter({ ...(activeFilters || {}), dateTo: date ? date.toISOString().split('T')[0] : undefined });
    }
  };

  const hasActiveFilters = Object.values(activeFilters || {}).some(value => value && value !== '');

  const getFilterCount = () => {
    let count = 0;
    if (activeFilters.status) count++;
    if (activeFilters.category) count++;
    if (activeFilters.author) count++;
    if (activeFilters.dateFrom) count++;
    if (activeFilters.dateTo) count++;
    return count;
  };

  return (
    <CardHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>News Articles</CardTitle>
            <CardDescription>
              Manage, search, and filter all articles in the system.
              {totalResults > 0 && (
                <span className="ml-2 text-primary font-medium">
                  {totalResults} article{totalResults !== 1 ? 's' : ''} found
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getFilterCount()}
                </Badge>
              )}
            </Button>
            <Link href="/admin/news/create">
              <Button>Create Article</Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, description, content, or tags..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
          {localSearchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearchTerm('');
                onSearch('');
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={activeFilters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={activeFilters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Select
                value={activeFilters.author || ''}
                onValueChange={(value) => handleFilterChange('author', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author._id} value={author._id}>
                      {author.username} ({author.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="flex gap-2">
                <Select
                  value={activeFilters.sortBy || 'createdAt'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                    <SelectItem value="title.en">Title</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={activeFilters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">↓</SelectItem>
                    <SelectItem value="asc">↑</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date: Date | undefined) => handleDateChange('dateFrom', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date: Date | undefined) => handleDateChange('dateTo', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.status && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {activeFilters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', '')}
                />
              </Badge>
            )}
            {activeFilters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categories.find(c => c._id === activeFilters.category)?.name.en || 'Unknown'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', '')}
                />
              </Badge>
            )}
            {activeFilters.author && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Author: {authors.find(a => a._id === activeFilters.author)?.username || 'Unknown'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('author', '')}
                />
              </Badge>
            )}
            {activeFilters.dateFrom && (
              <Badge variant="secondary" className="flex items-center gap-1">
                From: {format(new Date(activeFilters.dateFrom), "MMM dd, yyyy")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleDateChange('dateFrom', undefined)}
                />
              </Badge>
            )}
            {activeFilters.dateTo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                To: {format(new Date(activeFilters.dateTo), "MMM dd, yyyy")}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleDateChange('dateTo', undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default NewsHeader;
