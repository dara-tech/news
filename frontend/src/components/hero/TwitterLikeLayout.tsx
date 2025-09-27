'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Clock, Globe, Search, Home, Newspaper, Tag, TrendingUp, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Article, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { BreakingNewsTicker } from './BreakingNewsTicker';
import MainFeature from './MainFeature';
import InfiniteScrollFeed from './InfiniteScrollFeed';
import TopAuthors from './TopAuthors';
import TrendingCategories from './TrendingCategories';
import TwitterLikeLayoutSkeleton from './TwitterLikeLayoutSkeleton';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';
import api from '@/lib/api';

interface TwitterLikeLayoutProps {
  breaking: Article[];
  featured: Article[];
  latestNews: Article[];
  categories: Category[];
  locale: 'en' | 'kh';
  isLoading?: boolean;
  customMainContent?: React.ReactNode;
}

const TwitterLikeLayout: React.FC<TwitterLikeLayoutProps> = ({ 
  breaking = [], 
  featured = [], 
  latestNews = [],
  categories = [], 
  locale = 'en',
  isLoading = false,
  customMainContent
}) => {
  const router = useRouter();
  const tickerRef = useRef<{ pause: () => void; play: () => void }>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { language, formatTime, formatDate } = useOptimizedLanguage();
  
  // State for fetched data
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>(categories);
  const [fetchedLatestNews, setFetchedLatestNews] = useState<Article[]>(latestNews);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch categories and latest news if not provided
  useEffect(() => {
    const fetchData = async () => {
      if (categories.length === 0 || latestNews.length === 0) {
        setDataLoading(true);
        try {
          // Fetch categories
          if (categories.length === 0) {
            const categoriesResponse = await api.get('/categories');
            if (categoriesResponse.data?.success && categoriesResponse.data?.data) {
              setFetchedCategories(categoriesResponse.data.data || []);
            }
          }

          // Fetch latest news
          if (latestNews.length === 0) {
            const newsResponse = await api.get('/news', {
              params: {
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              }
            });
            if (newsResponse.data?.news) {
              setFetchedLatestNews(newsResponse.data.news || []);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchData();
  }, [categories.length, latestNews.length]);

  // Use provided data or fetched data
  const displayCategories = categories.length > 0 ? categories : fetchedCategories;
  const displayLatestNews = latestNews.length > 0 ? latestNews : fetchedLatestNews;

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get main feature (first featured article)
  const mainFeature = featured[0];

  // Show loading skeleton if loading
  if (isLoading) {
    return <TwitterLikeLayoutSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breaking News Ticker */}
      {breaking.length > 0 && (
        <BreakingNewsTicker 
          articles={breaking} 
          locale={language} 
          ref={tickerRef}
        />
      )}

      {/* Twitter-like Layout */}
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-hidden border-r border-border/50">
            <div className="p-6 space-y-6 h-full flex flex-col">
            

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  onClick={() => router.push(`/${language}`)}
                >
                  <Home className="mr-4 h-5 w-5" />
                  {language === 'kh' ? 'ទំព័រដើម' : 'Home'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  onClick={() => router.push(`/${language}/news`)}
                >
                  <Newspaper className="mr-4 h-5 w-5" />
                  {language === 'kh' ? 'ព័ត៌មាន' : 'News'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  onClick={() => router.push(`/${language}/categories`)}
                >
                  <Tag className="mr-4 h-5 w-5" />
                  {language === 'kh' ? 'ប្រភេទ' : 'Categories'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  onClick={() => router.push(`/${language}/trending`)}
                >
                  <TrendingUp className="mr-4 h-5 w-5" />
                  {language === 'kh' ? 'ពេញនិយម' : 'Trending'}
                </Button>
              </nav>

              {/* Top Authors */}
              <div className="flex-1 pt-6">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">
                  {language === 'kh' ? 'អ្នកសរសេរកំពុងពេញនិយម' : 'Top Authors'}
                </h3>
                <TopAuthors locale={language} limit={3} />
              </div>
            </div>
          </aside>

          {/* Main Content - Twitter-like Feed */}
          <main className="lg:col-span-6 border-x border-border/50 h-screen overflow-y-auto">
            {customMainContent ? (
              <div >
                {customMainContent}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {language === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(currentTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{language === 'kh' ? 'កម្ពុជា' : 'Cambodia'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Feature - Pinned Post */}
                {mainFeature && (
                  <div className="border-b border-border/50">
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {language === 'kh' ? 'ពិសេស' : 'Featured'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(mainFeature.publishedAt || mainFeature.createdAt)}</span>
                      </div>
                      <MainFeature article={mainFeature} locale={language} />
                    </div>
                  </div>
                )}

                {/* Infinite Scroll Feed - Main Content */}
                <div>
                  <InfiniteScrollFeed
                    initialArticles={latestNews}
                    locale={locale}
                    hasMore={true}
                    sortBy="createdAt"
                    sortOrder="desc"
                    className=""
                  />
                </div>
              </>
            )}
          </main>

          {/* Right Sidebar - Trending & More */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-hidden">
            <div className="p-6 space-y-4 h-full flex flex-col">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'kh' ? 'ស្វែងរកព័ត៌មាន...' : 'Search news...'}
                  className="w-full bg-muted/50 border border-border/50 rounded-full px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {/* Trending Categories */}
              <div className="bg-card/50 rounded-xl border border-border/50 p-4">
                <h3 className="font-semibold text-lg mb-4">
                  {language === 'kh' ? 'ប្រភេទពេញនិយម' : 'Trending Categories'}
                </h3>
                <TrendingCategories categories={displayCategories} locale={language} />
              </div>

              {/* Latest Stories */}
              <div className="bg-card/50 rounded-xl border border-border/50 p-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {language === 'kh' ? 'ព័ត៌មានថ្មី' : 'Latest Stories'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${language}/news`)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {language === 'kh' ? 'ទាំងអស់' : 'All'}
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {displayLatestNews.slice(0, 3).map((article, index) => (
                    <div
                      key={`story-${article._id}-${index}`}
                      className="group"
                    >
                      <Link
                        href={`/${language}/news/${article.slug?.[language] || article._id}`}
                        className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {typeof article.title === 'string' ? article.title : article.title?.[language] || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.views || 0} {language === 'kh' ? 'មើល' : 'views'}</span>
                          <span>•</span>
                          <span>
                            {formatDate(article.publishedAt || article.createdAt)}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-muted-foreground space-y-2 pt-4">
                <p>© 2024 NewsHub</p>
                <p>{language === 'kh' ? 'ព័ត៌មានថ្មីៗជារៀងរាល់ថ្ងៃ' : 'Fresh news every day'}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TwitterLikeLayout;
