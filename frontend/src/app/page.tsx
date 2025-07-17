"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Article } from '@/types';

import { motion } from 'framer-motion';
import Hero from '@/components/hero/Hero';
import LatestNewsSection from '@/components/news/LatestNewsSection';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import ErrorDisplay from '@/components/common/ErrorDisplay';

export default function Home() {
  const [newsData, setNewsData] = useState<{ breaking: Article[]; featured: Article[]; latest: Article[] }>({ breaking: [], featured: [], latest: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getNewsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [breakingRes, featuredRes, latestRes] = await Promise.all([
        api.get('/news/breaking'),
        api.get('/news/featured'),
        api.get('/news'),
      ]);

      setNewsData({
        breaking: breakingRes.data.data || breakingRes.data,
        featured: featuredRes.data.data || featuredRes.data,
        latest: latestRes.data.news || latestRes.data.data || latestRes.data,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to fetch news data:', err.message);
        setError(`Could not load news: ${err.message}`);
      } else {
        console.error('An unknown error occurred:', err);
        setError('An unknown error occurred while fetching news.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getNewsData();
  }, [getNewsData]);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <ErrorDisplay message={error} onRetry={getNewsData} />
      </div>
    );
  }

  const { breaking, featured, latest } = newsData;


  
  // Extract and deduplicate categories from featured news
  const categories = Array.from(
    new Map(featured.map(article => [article.category._id, article.category])).values()
  ).filter(Boolean);

  return (
    <motion.div 
      className="space-y-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <Hero breaking={breaking} featured={featured} categories={categories} />

      {/* Latest News Section */}
      <LatestNewsSection latest={latest} />
    </motion.div>
  );
}

