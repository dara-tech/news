'use client';

import { useLanguage } from '@/context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const switchLanguage = (lang: 'en' | 'kh') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded-md transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        EN
      </button>
      <span className="text-gray-300">/</span>
      <button
        onClick={() => switchLanguage('kh')}
        className={`px-3 py-1 rounded-md transition-colors ${language === 'kh' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        KH
      </button>
    </div>
  );
};

export default LanguageSwitcher;
