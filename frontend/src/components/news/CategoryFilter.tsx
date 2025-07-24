'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Locale } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
  locale: Locale;
  lang: string;
}

function getLocalizedText(text: string | { [key: string]: string | undefined } | undefined, locale: Locale): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    if (typeof text[locale] === 'string') return text[locale]!;
    return '';
  }
  return '';
}

function getCategorySlug(category: Category): string {
  if (!category.slug) {
    throw new Error(`Category ${category._id} has no slug defined`);
  }
  return category.slug;
}

export default function CategoryFilter({ categories, currentCategory, locale, lang }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (categorySlug === currentCategory) {
      // If clicking the same category, remove it
      params.delete('category');
    } else {
      // Set the new category
      params.set('category', categorySlug);
    }
    
    // Reset page to 1 when changing category
    params.set('page', '1');
    
    // Remove search when changing category
    params.delete('search');
    
    const newUrl = `/${lang}/news?${params.toString()}`;
    console.log('Navigating to:', newUrl);
    router.push(newUrl);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            !currentCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {categories.map((cat: Category) => {
          try {
            const categorySlug = getCategorySlug(cat);
            const categoryName = getLocalizedText(cat.name, locale);
            
            return (
              <button
                key={categorySlug}
                onClick={() => handleCategoryClick(categorySlug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentCategory === categorySlug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {categoryName || cat._id}
              </button>
            );
          } catch (error) {
            console.error(`Skipping category ${cat._id} due to missing slug:`, error);
            return null;
          }
        }).filter(Boolean)}
      </div>
    </div>
  );
} 