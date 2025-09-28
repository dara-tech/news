'use client';

import { Article, Category } from '@/types';
import Hero from '../hero/Hero';
import ErrorBoundary from '../ErrorBoundary';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Clock, Star } from 'lucide-react';
// Removed framer-motion import for static layout

interface HomePageProps {
  lang: 'en' | 'kh';
  newsData: {
    breaking: Article[];
    featured: Article[];
    latest: Article[];
    categories: Category[];
  };
}

export default function HomePage({ lang, newsData }: HomePageProps) {
  // Ensure lang is always a string
  const safeLang = typeof lang === 'string' ? lang : 'en';
  const locale = safeLang;
  const { breaking, featured, latest, categories } = newsData;

  // Ensure arrays are always arrays, even if undefined or null
  const safeBreaking = Array.isArray(breaking) ? breaking : [];
  const safeFeatured = Array.isArray(featured) ? featured : [];
  const safeLatest = Array.isArray(latest) ? latest : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    // In a real app, you would refetch data here
    window.location.reload();
  }, []);

  // Calculate stats
  const totalArticles = safeBreaking.length + safeFeatured.length + safeLatest.length;
  const hasBreaking = safeBreaking.length > 0;
  const hasFeatured = safeFeatured.length > 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Stats Header */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-border/50">
        
        </div>

        {/* Main Hero Component with Infinite Scroll */}
        <Hero
          breaking={safeBreaking}
          featured={safeFeatured}
          categories={safeCategories}
          locale={safeLang}
          useTwitterLayout={true}
        />
      </div>
    </ErrorBoundary>
  );
}
