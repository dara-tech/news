'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Filter, 
  Globe, 
  Calendar, 
  Tag, 
  Folder,
  RefreshCw,
  Search,
  TrendingUp,
  Clock,
  Eye,
  Star,
  Bookmark,
  User,
  BarChart3,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string | { en: string; kh: string };
  color?: string;
  count?: number;
}

interface Author {
  id: string;
  name: string;
  avatar?: string;
  articleCount?: number;
}

interface RecommendationFiltersProps {
  filters: {
    limit: number;
    language: string;
    categories: string[];
    tags: string[];
    authors: string[];
    timeRange: 'today' | 'week' | 'month' | 'year' | 'all';
    excludeRead: boolean;
    includeBreaking: boolean;
    minViews: number;
    maxViews: number;
    minRating: number;
    sortBy: 'relevance' | 'date' | 'views' | 'rating' | 'trending';
    contentType: 'all' | 'articles' | 'videos' | 'podcasts';
    readingTime: number[];
    savedOnly: boolean;
    verifiedAuthorsOnly: boolean;
    premiumContent: boolean;
    searchQuery: string;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
  categories?: Category[];
  authors?: Author[];
  isLoading?: boolean;
}

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'kh', label: 'ខ្មែរ', flag: '🇰🇭' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'th', label: 'ไทย', flag: '🇹🇭' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' }
];

const TIME_RANGES = [
  { value: 'today', label: 'Today', icon: Clock },
  { value: 'week', label: 'This Week', icon: Calendar },
  { value: 'month', label: 'This Month', icon: Calendar },
  { value: 'year', label: 'This Year', icon: Calendar },
  { value: 'all', label: 'All Time', icon: BarChart3 }
];

const LIMIT_OPTIONS = [
  { value: 6, label: '6 articles' },
  { value: 12, label: '12 articles' },
  { value: 18, label: '18 articles' },
  { value: 24, label: '24 articles' },
  { value: 50, label: '50 articles' },
  { value: 100, label: '100 articles' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant', icon: TrendingUp },
  { value: 'date', label: 'Latest First', icon: Clock },
  { value: 'views', label: 'Most Viewed', icon: Eye },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'trending', label: 'Trending Now', icon: Zap }
];

const CONTENT_TYPES = [
  { value: 'all', label: 'All Content', icon: Folder },
  { value: 'articles', label: 'Articles Only', icon: Folder },
  { value: 'videos', label: 'Videos Only', icon: Folder },
  { value: 'podcasts', label: 'Podcasts Only', icon: Folder }
];

// Default categories with multilingual support
const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: { en: 'Technology', kh: 'បច្ចេកវិទ្យា' }, 
    color: '#3b82f6',
    count: 142
  },
  { 
    id: '2', 
    name: { en: 'Business', kh: 'អាជីវកម្ម' }, 
    color: '#10b981',
    count: 89
  },
  { 
    id: '3', 
    name: { en: 'Politics', kh: 'នយោបាយ' }, 
    color: '#f59e0b',
    count: 156
  },
  { 
    id: '4', 
    name: { en: 'Health', kh: 'សុខភាព' }, 
    color: '#ef4444',
    count: 78
  },
  { 
    id: '5', 
    name: { en: 'Sports', kh: 'កីឡា' }, 
    color: '#8b5cf6',
    count: 234
  },
  { 
    id: '6', 
    name: { en: 'Entertainment', kh: 'កម្សាន្ត' }, 
    color: '#ec4899',
    count: 167
  },
  { 
    id: '7', 
    name: { en: 'Science', kh: 'វិទ្យាសាស្ត្រ' }, 
    color: '#06b6d4',
    count: 92
  },
  { 
    id: '8', 
    name: { en: 'World News', kh: 'ព័ត៌មានពិភពលោក' }, 
    color: '#84cc16',
    count: 312
  }
];

// Enhanced popular tags with categories
const POPULAR_TAGS = [
  { name: 'AI', category: 'Technology', trending: true },
  { name: 'Climate Change', category: 'Environment', trending: true },
  { name: 'Economy', category: 'Business', trending: false },
  { name: 'Innovation', category: 'Technology', trending: true },
  { name: 'Research', category: 'Science', trending: false },
  { name: 'Global Markets', category: 'Business', trending: true },
  { name: 'Breaking News', category: 'General', trending: true },
  { name: 'Analysis', category: 'General', trending: false },
  { name: 'Cryptocurrency', category: 'Finance', trending: true },
  { name: 'Space', category: 'Science', trending: false },
  { name: 'Healthcare', category: 'Health', trending: true },
  { name: 'Education', category: 'Society', trending: false }
];

export function RecommendationFilters({ 
  filters, 
  onFiltersChange, 
  onClose,
  categories = DEFAULT_CATEGORIES,
  authors = [],
  isLoading = false
}: RecommendationFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    categories: true,
    tags: false,
    authors: false,
    advanced: false,
    content: false
  });
  const [presets, setPresets] = useState([
    { name: 'My Interests', filters: { categories: ['1', '3'], tags: ['AI', 'Analysis'] } },
    { name: 'Trending Now', filters: { sortBy: 'trending', timeRange: 'today' } },
    { name: 'Deep Reads', filters: { readingTime: [10, 30], minRating: 4 } }
  ]);

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const name = typeof category.name === 'string' 
        ? category.name 
        : category.name[filters.language as keyof typeof category.name] || category.name.en;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [categories, searchTerm, filters.language]);

  const filteredTags = useMemo(() => {
    return POPULAR_TAGS.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    handleFilterChange('categories', newCategories);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const handleAuthorToggle = (authorId: string) => {
    const newAuthors = filters.authors.includes(authorId)
      ? filters.authors.filter(id => id !== authorId)
      : [...filters.authors, authorId];
    
    handleFilterChange('authors', newAuthors);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section as keyof typeof prev]: !prev[section as keyof typeof prev]
    }));
  };

  const applyPreset = (preset: any) => {
    onFiltersChange({
      ...filters,
      ...preset.filters
    });
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (name) {
      setPresets(prev => [...prev, { name, filters: { ...filters } as any }]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      limit: 12,
      language: 'en',
      categories: [],
      tags: [],
      authors: [],
      timeRange: 'all',
      excludeRead: true,
      includeBreaking: true,
      minViews: 0,
      maxViews: 1000000,
      minRating: 0,
      sortBy: 'relevance',
      contentType: 'all',
      readingTime: [1, 60],
      savedOnly: false,
      verifiedAuthorsOnly: false,
      premiumContent: false,
      searchQuery: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return filters.categories.length > 0 || 
           filters.tags.length > 0 || 
           filters.authors.length > 0 ||
           filters.timeRange !== 'all' ||
           !filters.excludeRead ||
           !filters.includeBreaking ||
           filters.minViews > 0 ||
           filters.maxViews < 1000000 ||
           filters.minRating > 0 ||
           filters.sortBy !== 'relevance' ||
           filters.contentType !== 'all' ||
           filters.readingTime[0] !== 1 ||
           filters.readingTime[1] !== 60 ||
           filters.savedOnly ||
           filters.verifiedAuthorsOnly ||
           filters.premiumContent ||
           filters.searchQuery.length > 0;
  };

  const getDisplayName = (category: Category) => {
    if (typeof category.name === 'string') {
      return category.name;
    }
    return category.name[filters.language as keyof typeof category.name] || category.name.en;
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Recommendation Filters</span>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentAsPreset}
              className="text-xs"
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Save Preset
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Quick Presets */}
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Quick Presets:</span>
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs h-6"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories, tags, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Settings */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => toggleSection('basic')}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium">Basic Settings</span>
            {expandedSections.basic ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expandedSections.basic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Language</span>
                  </Label>
                  <Select
                    value={filters.language}
                    onValueChange={(value) => handleFilterChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <span className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Time Range</span>
                  </Label>
                  <Select
                    value={filters.timeRange}
                    onValueChange={(value) => handleFilterChange('timeRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_RANGES.map((range) => {
                        const Icon = range.icon;
                        return (
                          <SelectItem key={range.value} value={range.value}>
                            <span className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{range.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Sort By</span>
                  </Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Content Settings */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => toggleSection('content')}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium">Content Settings</span>
            {expandedSections.content ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expandedSections.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content Type</Label>
                    <Select
                      value={filters.contentType}
                      onValueChange={(value) => handleFilterChange('contentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <span className="flex items-center space-x-2">
                                <Icon className="h-4 w-4" />
                                <span>{type.label}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limit */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Number of Articles</Label>
                    <Select
                      value={filters.limit.toString()}
                      onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIMIT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Reading Time Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Reading Time: {filters.readingTime[0]}-{filters.readingTime[1]} minutes
                  </Label>
                  <Slider
                    value={filters.readingTime}
                    onValueChange={(value) => handleFilterChange('readingTime', value)}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Rating Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Minimum Rating: {filters.minRating} stars</span>
                  </Label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => handleFilterChange('minRating', value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* View Count Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Min Views</Label>
                    <Input
                      type="number"
                      value={filters.minViews}
                      onChange={(e) => handleFilterChange('minViews', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Views</Label>
                    <Input
                      type="number"
                      value={filters.maxViews}
                      onChange={(e) => handleFilterChange('maxViews', parseInt(e.target.value) || 1000000)}
                      placeholder="1000000"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => toggleSection('categories')}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span>Categories</span>
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </span>
            {expandedSections.categories ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expandedSections.categories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate">{getDisplayName(category)}</span>
                        {category.count && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {category.count}
                          </Badge>
                        )}
                      </Label>
                      {category.color && (
                        <div 
                          className="w-full h-1 rounded-full mt-1" 
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => toggleSection('tags')}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.tags.length}
                </Badge>
              )}
            </span>
            {expandedSections.tags ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expandedSections.tags && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2"
              >
                {filteredTags.map((tag) => (
                  <Button
                    key={tag.name}
                    variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag.name)}
                    className="text-xs relative"
                  >
                    {tag.name}
                    {tag.trending && (
                      <TrendingUp className="h-3 w-3 ml-1 text-orange-500" />
                    )}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Authors */}
        {authors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => toggleSection('authors')}
                className="w-full justify-between p-0 h-auto"
              >
                <span className="font-medium flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Authors</span>
                  {filters.authors.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.authors.length}
                    </Badge>
                  )}
                </span>
                {expandedSections.authors ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              <AnimatePresence>
                {expandedSections.authors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {authors.map((author) => (
                      <div key={author.id} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50">
                        <Checkbox
                          id={`author-${author.id}`}
                          checked={filters.authors.includes(author.id)}
                          onCheckedChange={() => handleAuthorToggle(author.id)}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          {author.avatar && (
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <Label
                            htmlFor={`author-${author.id}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                          >
                            {author.name}
                          </Label>
                          {author.articleCount && (
                            <Badge variant="outline" className="text-xs">
                              {author.articleCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        <Separator />

        {/* Advanced Options */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => toggleSection('advanced')}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="font-medium">Advanced Options</span>
            {expandedSections.advanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expandedSections.advanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclude-read"
                        checked={filters.excludeRead}
                        onCheckedChange={(checked) => handleFilterChange('excludeRead', checked)}
                      />
                      <Label htmlFor="exclude-read" className="text-sm font-medium flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Exclude read articles</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-breaking"
                        checked={filters.includeBreaking}
                        onCheckedChange={(checked) => handleFilterChange('includeBreaking', checked)}
                      />
                      <Label htmlFor="include-breaking" className="text-sm font-medium flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Include breaking news</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saved-only"
                        checked={filters.savedOnly}
                        onCheckedChange={(checked) => handleFilterChange('savedOnly', checked)}
                      />
                      <Label htmlFor="saved-only" className="text-sm font-medium flex items-center space-x-2">
                        <Bookmark className="h-4 w-4" />
                        <span>Saved articles only</span>
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified-authors"
                        checked={filters.verifiedAuthorsOnly}
                        onCheckedChange={(checked) => handleFilterChange('verifiedAuthorsOnly', checked)}
                      />
                      <Label htmlFor="verified-authors" className="text-sm font-medium flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Verified authors only</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="premium-content"
                        checked={filters.premiumContent}
                        onCheckedChange={(checked) => handleFilterChange('premiumContent', checked)}
                      />
                      <Label htmlFor="premium-content" className="text-sm font-medium flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>Premium content</span>
                      </Label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Filters</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.categories.length} categories
                  </Badge>
                )}
                {filters.tags.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.tags.length} tags
                  </Badge>
                )}
                {filters.authors.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.authors.length} authors
                  </Badge>
                )}
                {filters.timeRange !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {TIME_RANGES.find(r => r.value === filters.timeRange)?.label}
                  </Badge>
                )}
                {filters.sortBy !== 'relevance' && (
                  <Badge variant="secondary" className="text-xs">
                    {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
                  </Badge>
                )}
                {filters.contentType !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {CONTENT_TYPES.find(c => c.value === filters.contentType)?.label}
                  </Badge>
                )}
                {filters.minRating > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.minRating}+ stars
                  </Badge>
                )}
                {(filters.readingTime[0] !== 1 || filters.readingTime[1] !== 60) && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.readingTime[0]}-{filters.readingTime[1]} min
                  </Badge>
                )}
                {filters.savedOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Saved only
                  </Badge>
                )}
                {filters.verifiedAuthorsOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Verified authors
                  </Badge>
                )}
                {filters.premiumContent && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    "{filters.searchQuery}"
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
