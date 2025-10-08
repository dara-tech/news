'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageFontProvider() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update the HTML lang attribute based on current language
    document.documentElement.lang = language;
    
    // Also update the body class for additional styling control
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    if (language === 'kh') {
      document.body.classList.add('font-khmer');
    } else {
      document.body.classList.add('font-sans');
    }
  }, [language]);

  return null;
}
