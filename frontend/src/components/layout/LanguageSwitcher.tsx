'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = params.lang || 'en';

  const switchLanguage = (newLang: 'en' | 'km') => {
    if (currentLang === newLang) return;

    // The pathname might include the current locale, so we need to create the new path correctly.
    const newPath = pathname.startsWith(`/${currentLang}`) 
      ? pathname.substring(currentLang.length + 1) 
      : pathname;

    router.push(`/${newLang}${newPath}`);
  };

  return (
    <div className="flex items-center space-x-2 text-sm font-medium">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 rounded-md transition-colors ${currentLang === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        EN
      </button>
      <span className="text-gray-300">/</span>
      <button
        onClick={() => switchLanguage('km')}
        className={`px-3 py-1 rounded-md transition-colors ${currentLang === 'km' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        KH
      </button>
    </div>
  );
};

export default LanguageSwitcher;
