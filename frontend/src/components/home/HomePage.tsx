'use client';

import { motion } from 'framer-motion';
import { Article, Category } from '@/types';

import Hero from '@/components/hero/Hero';
import LatestNewsSection from '@/components/news/LatestNewsSection';

interface HomePageProps {
  lang: 'en' | 'km';
  newsData: {
    breaking: Article[];
    featured: Article[];
    latest: Article[];
  };
  categories: Category[];
}

export default function HomePage({ lang, newsData, categories }: HomePageProps) {
  const locale = lang === 'km' ? 'kh' : 'en';
  const { breaking, featured, latest } = newsData;

  return (
    <motion.div
      className="space-y-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero breaking={breaking} featured={featured} categories={categories} locale={locale} />
      <LatestNewsSection latest={latest} locale={locale} />
    </motion.div>
  );
}
