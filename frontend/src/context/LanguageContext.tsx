'use client';

import { createContext, useState, useContext, ReactNode, useEffect, use, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

type Language = 'en' | 'kh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language storage key
const LANGUAGE_STORAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [language, setLanguageState] = useState<Language>('en');
  const [isChanging, setIsChanging] = useState(false);

  // Initialize language from localStorage or URL
  useEffect(() => {
    const initializeLanguage = () => {
      // First, try to get from localStorage for instant UI update
      if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang === 'en' || storedLang === 'kh') {
          setLanguageState(storedLang as Language);
          return;
        }
      }

      // Fallback to URL params
      let currentLang = 'en';
      if (params && typeof params === 'object' && 'lang' in params) {
        if (typeof params.lang === 'string') {
          currentLang = params.lang;
        } else if (params.lang && typeof params.lang === 'object' && 'then' in params.lang) {
          // It's a Promise, extract from pathname
          const pathSegments = pathname.split('/');
          currentLang = pathSegments[1] || 'en';
        }
      }
      
      if (currentLang === 'en' || currentLang === 'kh') {
        setLanguageState(currentLang as Language);
        // Store in localStorage for next time
        if (typeof window !== 'undefined') {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
        }
      }
    };

    initializeLanguage();
  }, [params, pathname]);

  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) return;

    // Show loading state immediately
    setIsChanging(true);

    // Optimistic update - change UI immediately
    setLanguageState(newLanguage);

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }

    // Update URL in the background
    const newPath = pathname.replace(`/${language}`, `/${newLanguage}`);
    const finalPath = newPath.startsWith(`/${newLanguage}`) ? newPath : `/${newLanguage}${pathname}`;
    
    // Use replace instead of push to avoid adding to history
    router.replace(finalPath);
    
    // Reset changing state after navigation completes
    setTimeout(() => setIsChanging(false), 500);
  }, [language, pathname, router]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'en' ? 'kh' : 'en';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    isChanging
  }), [language, setLanguage, toggleLanguage, isChanging]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
