'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Locale } from '@/types';
import { Button } from '@/components/ui/button';

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
    
    // Handle both 'kh' and 'km' locale keys for Khmer
    const khmerKey = locale === 'kh' ? 'kh' : 'km';
    
    // Try exact locale match first
    if (typeof text[locale] === 'string' && text[locale]!.trim()) {
      return text[locale]!;
    }
    
    // Try alternative Khmer key
    if (typeof text[khmerKey] === 'string' && text[khmerKey]!.trim()) {
      return text[khmerKey]!;
    }
    
    // Try 'km' key if locale is 'kh'
    if (locale === 'kh' && typeof text['km'] === 'string' && text['km']!.trim()) {
      return text['km']!;
    }
    
    // Fallback to English
    if (typeof text['en'] === 'string' && text['en']!.trim()) {
      return text['en']!;
    }
    
    // Try any available key as last resort
    const availableKeys = Object.keys(text).filter(key => 
      typeof text[key] === 'string' && text[key]!.trim()
    );
    if (availableKeys.length > 0) {
      return text[availableKeys[0]]!;
    }
    
    return '';
  }
  return '';
}

function getCategorySlug(category: Category, lang: string = 'en'): string {
  if (!category.slug) {
    // Fallback to _id if no slug, but ensure it's a string
    return String(category._id || 'unknown');
  }
  
  // Handle localized slug
  if (typeof category.slug === 'string') {
    return category.slug;
  }
  
  // Use the appropriate language slug, fallback to English
  const safeLang = lang === 'km' ? 'kh' : lang;
  return category.slug[safeLang as keyof typeof category.slug] || category.slug.en || String(category._id || 'unknown');
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
    
    // Ensure proper language path for Khmer
    const langPath = lang === 'kh' ? 'kh' : lang;
    const newUrl = `/${langPath}/news?${params.toString()}`;
    router.push(newUrl);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleCategoryClick('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            !currentCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </Button>
        {categories.map((cat: Category, index: number) => {
          const categorySlug = getCategorySlug(cat, lang);
          const categoryName = getLocalizedText(cat.name, locale);
          
          
          return (
            <Button
              key={`${  categorySlug}-${index}`}
              onClick={() => handleCategoryClick(categorySlug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                currentCategory === categorySlug
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {categoryName || String(cat._id || 'Unknown')}
            </Button>
          );
        })}
      </div>
    </div>
  );
} 