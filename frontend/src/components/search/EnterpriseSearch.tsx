'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  FileText, 
  Tag,
  X,
  ArrowRight,
  Sparkles,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRecommendations } from '@/hooks/useRecommendations';
import { getArticleImage } from '@/hooks/useImageLoader';
import api from '@/lib/api';

interface SearchSuggestion {
  id: string;
  type: 'article' | 'category' | 'author' | 'tag' | 'trending';
  title: string;
  description?: string;
  href: string;
  icon: React.ComponentType<any>;
  image?: string;
  isTrending?: boolean;
  isRecent?: boolean;
  score?: number;
}

interface EnterpriseSearchProps {
  lang: string;
  className?: string;
}

export default function EnterpriseSearch({ lang, className = '' }: EnterpriseSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Get trending recommendations
  const { recommendations: trendingRecs } = useRecommendations({
    type: 'trending',
    autoFetch: true,
    initialFilters: { limit: 5, language: lang as 'en' | 'kh' }
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load trending topics
  useEffect(() => {
    if (trendingRecs && trendingRecs.length > 0) {
      const topics = trendingRecs
        .map(rec => rec.tags || [])
        .flat()
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, 5);
      setTrendingTopics(topics);
    }
  }, [trendingRecs]);

  // Search with debouncing
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use actual news search API
      const response = await api.get('/news', {
        params: {
          keyword: searchQuery,
          limit: 5,
          lang: lang
        }
      });
      
      const data = response.data || {};
      const news = data.news || data.data || [];
      
      if (news.length > 0) {
        const searchSuggestions: SearchSuggestion[] = news.map((article: any) => ({
          id: article._id,
          type: 'article' as const,
          title: article.title[lang] || article.title.en || '',
          description: article.description?.[lang] || article.description?.en || '',
          href: `/${lang}/news/${article.slug}`,
          icon: FileText,
          image: getArticleImage(article) || undefined,
          isTrending: article.isFeatured || article.isBreaking,
          score: 0.9
        }));
        setSuggestions(searchSuggestions);
      } else {
        // Fallback to local suggestions
        setSuggestions(generateLocalSuggestions(searchQuery));
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local suggestions
      setSuggestions(generateLocalSuggestions(searchQuery));
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // Generate local suggestions as fallback
  const generateLocalSuggestions = (searchQuery: string): SearchSuggestion[] => {
    const query = searchQuery.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Add trending articles that match
    if (trendingRecs) {
      trendingRecs.forEach(rec => {
        if (rec.title?.[lang as keyof typeof rec.title]?.toLowerCase().includes(query) || 
            rec.description?.[lang as keyof typeof rec.description]?.toLowerCase().includes(query)) {
          suggestions.push({
            id: rec._id,
            type: 'article',
            title: rec.title?.[lang as keyof typeof rec.title] || rec.title?.en || '',
            description: rec.description?.[lang as keyof typeof rec.description] || rec.description?.en || '',
            href: `/${lang}/news/${rec.slug}`,
            icon: FileText,
            image: getArticleImage(rec) || undefined,
            isTrending: true,
            score: 0.9
          });
        }
      });
    }

    // Add trending topics
    trendingTopics.forEach(topic => {
      if (topic.toLowerCase().includes(query)) {
        suggestions.push({
          id: `tag-${topic}`,
          type: 'tag',
          title: topic,
          description: 'Trending topic',
          href: `/${lang}/search?q=${encodeURIComponent(topic)}`,
          icon: Tag,
          isTrending: true,
          score: 0.8
        });
      }
    });

    return suggestions.slice(0, 8);
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, handleSearch]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      // Navigate to search results
      router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Save to recent searches
    const updated = [suggestion.title, ...recentSearches.filter(s => s !== suggestion.title)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    router.push(suggestion.href);
    setIsOpen(false);
    setQuery('');
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Keyboard navigation and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative z-50 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-200 ${
            isOpen ? 'text-primary/80 scale-105' : 'text-muted-foreground/70 hover:text-muted-foreground'
          }`} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search articles, topics, authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Delay closing to allow clicking on suggestions
              setTimeout(() => setIsOpen(false), 150);
            }}
            className="pl-10 pr-20 h-10 bg-background/80 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200 placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-muted/50 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {(isOpen || (query && suggestions.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-background/98 backdrop-blur-xl border border-border/20 rounded-xl shadow-xl z-[60] overflow-hidden"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-4 border-b border-border/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Recent Searches
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => {
                        setQuery(search);
                        handleSubmit(new Event('submit') as any);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors text-left justify-start h-auto"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{search}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {!query && trendingTopics.length > 0 && (
              <div className="p-4 border-b border-border/10">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(topic);
                        handleSubmit(new Event('submit') as any);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs font-medium rounded-full transition-colors h-auto"
                    >
                      <Tag className="h-3 w-3" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {query && (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground mb-2">Found {suggestions.length} results</div>
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                      >
                        <div className="flex-shrink-0">
                          {suggestion.image ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/20">
                              <Image
                                src={suggestion.image}
                                alt={suggestion.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="absolute inset-0 hidden items-center justify-center bg-muted/20">
                                <suggestion.icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center">
                              <suggestion.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{suggestion.title}</p>
                            {suggestion.isTrending && (
                              <Badge variant="default" className="text-xs bg-orange-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {suggestion.isRecent && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Recent
                              </Badge>
                            )}
                          </div>
                          {suggestion.description && (
                            <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                ) : !isLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Search className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">No results found for "{query}"</p>
                    <p className="text-xs text-muted-foreground/70">Try different keywords or check spelling</p>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
