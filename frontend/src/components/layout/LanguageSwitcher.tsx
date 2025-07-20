'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Language {
  code: 'en' | 'km';
  label: string;
  nativeLabel: string;
  flag: string;
}

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = (params.lang as 'en' | 'km') || 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const languages: Language[] = [
    { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
    { code: 'km', label: 'Khmer', nativeLabel: 'ខ្មែរ', flag: '🇰🇭' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];
  const otherLanguage = languages.find(lang => lang.code !== currentLang) || languages[1];

  const switchLanguage = async (newLang: 'en' | 'km') => {
    if (currentLang === newLang || isAnimating) return;

    setIsAnimating(true);
    setIsOpen(false);

    // Create new path
    const newPath = pathname.startsWith(`/${currentLang}`) 
      ? pathname.substring(currentLang.length + 1) 
      : pathname;

    // Add a small delay for smooth animation
    setTimeout(() => {
      router.push(`/${newLang}${newPath}`);
      setIsAnimating(false);
    }, 150);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isAnimating}
        className={`
          group relative flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
          border border-gray-200/50 dark:border-gray-700/50
          hover:bg-white dark:hover:bg-gray-800
          hover:border-gray-300 dark:hover:border-gray-600
          hover:shadow-md dark:hover:shadow-gray-900/20
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          min-w-[80px]
        `}
        aria-label={`Current language: ${currentLanguage.label}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Flag and Language Code */}
        <span className="text-lg leading-none" role="img" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {currentLanguage.code}
        </span>
        
        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        {/* Loading Indicator */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="
            bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50
            backdrop-blur-sm overflow-hidden min-w-[140px]
          ">
            {/* Current Language (for reference) */}
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Current:</span>
                <span className="text-lg" role="img" aria-hidden="true">{currentLanguage.flag}</span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {currentLanguage.nativeLabel}
                </span>
              </div>
            </div>

            {/* Other Language Option */}
            <button
              onClick={() => switchLanguage(otherLanguage.code)}
              disabled={isAnimating}
              className="
                w-full flex items-center gap-3 px-3 py-3
                hover:bg-gray-50 dark:hover:bg-gray-700/50
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50
              "
              role="option"
              aria-selected="false"
            >
              <span className="text-lg" role="img" aria-hidden="true">{otherLanguage.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {otherLanguage.nativeLabel}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {otherLanguage.label}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
