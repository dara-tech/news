'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Article, Category } from '@/types';

import { NYTimesLayout } from '@/components/news/NYTimesLayout';

interface HomePageProps {
  lang: 'en' | 'kh';
  newsData: {
    breaking: Article[];
    featured: Article[];
    latest: Article[];
  };
  categories: Category[];
}

export default function HomePage({ lang, newsData, categories }: HomePageProps) {
  // Ensure lang is always a string
  const safeLang = typeof lang === 'string' ? lang : 'en';
  const locale = safeLang;
  const { breaking, featured, latest } = newsData;

  // Transform articles to match NY Times component interface
  const transformArticle = (article: Article) => ({
    id: article._id || article.id || '',
    title: article.title,
    description: article.description,
    thumbnail: article.thumbnail,
    category: {
      name: article.category?.name || 'General',
      color: article.category?.color || '#3b82f6'
    },
    publishedAt: article.publishedAt || article.createdAt || new Date().toISOString(),
    views: article.views || 0,
    author: article.author ? {
      name: article.author.username || article.author.name || 'Staff Writer',
      profileImage: article.author.avatar
    } : undefined,
    isFeatured: (article as any).isFeatured || false,
    isBreaking: (article as any).isBreaking || false,
    slug: article.slug
  });

  // Combine all articles and prioritize breaking/featured
  const allArticles = [
    ...breaking.map(article => ({ ...transformArticle(article), isBreaking: true })),
    ...featured.map(article => ({ ...transformArticle(article), isFeatured: true })),
    ...latest.map(transformArticle)
  ].filter((article, index, self) => 
    // Remove duplicates based on ID
    index === self.findIndex(a => a.id === article.id)
  );

  return (
    <NYTimesLayout 
      articles={allArticles}
      lang={safeLang}
    />
  );
}
