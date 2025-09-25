'use client';

import { Article, Category } from '@/types';
import Hero from '../hero/Hero';
import ErrorBoundary from '../ErrorBoundary';


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
    ...safeBreaking.map(article => ({ ...transformArticle(article), isBreaking: true })),
    ...safeFeatured.map(article => ({ ...transformArticle(article), isFeatured: true })),
    ...safeLatest.map(transformArticle)
  ].filter((article, index, self) => 
    // Remove duplicates based on ID
    index === self.findIndex(a => a.id === article.id)
  );

  return (
    <ErrorBoundary>
      <Hero
        breaking={safeBreaking}
        featured={safeFeatured}
        categories={safeCategories}
        locale={safeLang}
      />
    </ErrorBoundary>
  );
}
