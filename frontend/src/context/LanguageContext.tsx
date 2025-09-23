'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

type Language = 'en' | 'kh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [language, setLanguageState] = useState<Language>('en');

  // Get current language from URL params
  useEffect(() => {
    const currentLang = (params.lang as string) || 'en';
    if (currentLang === 'en' || currentLang === 'kh') {
      setLanguageState(currentLang as Language);
    }
  }, [params.lang]);

  const setLanguage = (newLanguage: Language) => {
    // Update URL to reflect language change
    const newPath = pathname.replace(`/${language}`, `/${newLanguage}`);
    const finalPath = newPath.startsWith(`/${newLanguage}`) ? newPath : `/${newLanguage}${pathname}`;
    router.push(finalPath);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'kh' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
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
