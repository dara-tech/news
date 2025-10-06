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
  const { breaking, featured, latest, categories } = newsData;

  // Ensure arrays are always arrays, even if undefined or null
  const safeBreaking = Array.isArray(breaking) ? breaking : [];
  const safeFeatured = Array.isArray(featured) ? featured : [];
  const safeLatest = Array.isArray(latest) ? latest : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <ErrorBoundary>
      <div >
        {/* Main Hero Component with Infinite Scroll */}
        <Hero
          breaking={safeBreaking}
          featured={safeFeatured}
          latest={safeLatest}
          categories={safeCategories}
          locale={safeLang}
          useTwitterLayout={true}
        />
      </div>
    </ErrorBoundary>
  );
}
