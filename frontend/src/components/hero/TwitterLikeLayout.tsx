'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { Clock, Globe, Search, Home, Newspaper, Tag, TrendingUp, ExternalLink, Bookmark } from 'lucide-react';
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
  customMainContent?: ReactNode;
}

const TwitterLikeLayout = ({ 
  breaking = [], 
  featured = [], 
  latestNews = [],
  categories = [], 
  locale = 'en',
  isLoading = false,
  customMainContent
}: TwitterLikeLayoutProps) => {
  const router = useRouter();
  const tickerRef = useRef<{ pause: () => void; play: () => void }>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { language, formatTime, formatDate } = useOptimizedLanguage();
  const effectiveLanguage = language as 'en' | 'kh';
  
  // State for fetched data
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>(categories);
  const [fetchedLatestNews, setFetchedLatestNews] = useState<Article[]>(latestNews);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch categories and latest news if not provided
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we don't have any data at all
      if (categories.length === 0 && latestNews.length === 0) {
        setDataLoading(true);
        try {
          // Fetch categories
          const categoriesResponse = await api.get('/categories');
          if (categoriesResponse.data?.success && categoriesResponse.data?.data) {
            setFetchedCategories(categoriesResponse.data.data || []);
          }

          // Fetch latest news
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
        } catch (error) {
          console.error('Error fetching data', error);
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

  // Debug logging
  useEffect(() => {
    console.log('TwitterLikeLayout data flow', {
      originalLatestNews: latestNews.length,
      fetchedLatestNews: fetchedLatestNews.length,
      displayLatestNews: displayLatestNews.length,
      hasOriginalData: latestNews.length > 0,
      hasFetchedData: fetchedLatestNews.length > 0
    });
  }, [latestNews.length, fetchedLatestNews.length, displayLatestNews.length]);

  // Update time every minute
  useEffect(() => {
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
    
    <div className="bg-background ">
      {/* Breaking News Ticker */}
      {breaking.length > 0 && (
        <BreakingNewsTicker 
          articles={breaking} 
          locale={effectiveLanguage} 
          ref={tickerRef}
        />
      )}

      {/* Twitter-like Layout */}
      <div className="w-full ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-screen">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen border-none">
            <div className="p-6 space-y-6 h-full flex flex-col">
            

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <Link href={`/${effectiveLanguage}`} prefetch={true}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  >
                    <Home className="mr-4 h-5 w-5" />
                    {locale === 'kh' ? 'ទំព័រដើម' : 'Home'}
                  </Button>
                </Link>
                <Link href={`/${locale}/news`} prefetch={true}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  >
                    <Newspaper className="mr-4 h-5 w-5" />
                    {locale === 'kh' ? 'ព័ត៌មាន' : 'News'}
                  </Button>
                </Link>
                <Link href={`/${locale}/categories`} prefetch={true}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  >
                    <Tag className="mr-4 h-5 w-5" />
                    {locale === 'kh' ? 'ប្រភេទ' : 'Categories'}
                  </Button>
                </Link>
                <Link href={`/${locale}/trending`} prefetch={true}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  >
                    <TrendingUp className="mr-4 h-5 w-5" />
                    {locale === 'kh' ? 'ពេញនិយម' : 'Trending'}
                  </Button>
                </Link>
                <Link href={`/${locale}/saved`} prefetch={true}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg h-14 hover:bg-primary/10 hover:text-primary"
                  >
                    <Bookmark className="mr-4 h-5 w-5" />
                    {locale === 'kh' ? 'រក្សាទុក' : 'Saved'}
                  </Button>
                </Link>
              </nav>

              {/* Top Authors */}
              <div className="flex-1 pt-6">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">
                  {locale === 'kh' ? 'អ្នកសរសេរកំពុងពេញនិយម' : 'Top Authors'}
                </h3>
                <TopAuthors locale={locale as 'en' | 'kh'} limit={3} />
              </div>
            </div>
          </aside>

          {/* Main Content - Twitter-like Feed */}
          <main className="lg:col-span-6 border-x border-none min-h-screen">
            {customMainContent ? (
              <div className="border-none">
                {customMainContent}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 z-10 hidden">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {locale === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(currentTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{locale === 'kh' ? 'កម្ពុជា' : 'Cambodia'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Feature - Pinned Post */}
                {mainFeature && (
                  <div className="border-b border-border/50 px-6 py-4">
                    <div >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="px-3 py-3 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {locale === 'kh' ? 'ពិសេស' : 'Featured'}
                        </span>
                        <span>•</span>
                        <span>{formatDate((mainFeature as any).publishedAt || (mainFeature as any).createdAt)}</span>
                      </div>
                      <MainFeature article={mainFeature} locale={effectiveLanguage} />
                    </div>
                  </div>
                )}
                {/* Latest News Section Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 z-10">
                  <div className="flex items-center gap-3">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">
                      {locale === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                    </h2>
                  </div>
                </div>

                {/* Infinite Scroll Feed - Main Content */}
                <div >
                  <InfiniteScrollFeed
                    initialArticles={displayLatestNews}
                    locale={effectiveLanguage}
                    onLoadMore={async () => []}
                    hasMore={true}
                    categoryId={undefined}
                    searchQuery={undefined}
                    sortBy="createdAt"
                    sortOrder="desc"
                    className=""
                  />
                </div>
              </>
            )}
          </main>

          {/* Right Sidebar - Trending & More */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-0 h-screen overflow-y-auto scrollbar-hide ">
            <div className="p-6 space-y-4 h-full flex flex-col">
             

              {/* Trending Categories */}
              <div className="bg-card/50 rounded-xl border border-border/50 p-4 h-[500px]">
                <TrendingCategories categories={displayCategories} locale={effectiveLanguage} />
              </div>
              {/* Latest Stories */}
              <div className="bg-card/50 rounded-xl border border-border/50 p-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {locale === 'kh' ? 'ព័ត៌មានថ្មី' : 'Latest Stories'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/${locale}/news`)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {locale === 'kh' ? 'ទាំងអស់' : 'All'}
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
                        href={`/${locale}/news/${article.slug?.[language] || article._id}`}
                        className="block p-3 rounded-lg hover:bg-muted/30 transition-colors"
                        prefetch={true}
                      >
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {typeof article.title === 'string' ? article.title : article.title?.[language] || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.views || 0} {locale === 'kh' ? 'មើល' : 'views'}</span>
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TwitterLikeLayout;
