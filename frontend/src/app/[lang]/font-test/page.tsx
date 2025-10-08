'use client';

import { useLanguage } from '@/context/LanguageContext';
import { LocalizedText } from '@/components/ui/LocalizedText';

export default function FontTestPage() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'kh' ? 'ការធ្វើតេស្តពុម្ពអក្សរ' : 'Font Test Page'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {language === 'kh' 
              ? 'ទំព័រនេះសម្រាប់ធ្វើតេស្តពុម្ពអក្សរ Kontumruy Pro សម្រាប់អត្ថបទខ្មែរ'
              : 'This page is for testing Kontumruy Pro font for Khmer text'
            }
          </p>
          <button
            onClick={toggleLanguage}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'kh' ? 'Switch to English' : 'ប្តូរទៅខ្មែរ'}
          </button>
        </div>

        {/* Font Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Khmer Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {language === 'kh' ? 'អត្ថបទខ្មែរ' : 'Khmer Text'}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {language === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {language === 'kh' 
                    ? 'សូមស្វាគមន៍មកកាន់ Razwire! យើងជាប្រភពព័ត៌មានប្រចាំថ្ងៃដែលផ្តល់ព័ត៌មានថ្មីៗអំពីបច្ចេកវិទ្យា អាជីវកម្ម និងកីឡា។ សូមអាន សូមដឹង សូមជាប់គាំង។'
                    : 'Welcome to Razwire! We are your daily source of news providing the latest information about technology, business, and sports. Stay informed, stay ahead.'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {language === 'kh' ? 'ពុម្ពអក្សរផ្សេងៗ' : 'Different Font Weights'}
                </h3>
                <div className="space-y-2">
                  <p className="font-light text-sm text-gray-600 dark:text-gray-400">
                    {language === 'kh' ? 'ពុម្ពអក្សរស្រាល (Light)' : 'Light weight text'}
                  </p>
                  <p className="font-normal text-base text-gray-700 dark:text-gray-300">
                    {language === 'kh' ? 'ពុម្ពអក្សរធម្មតា (Normal)' : 'Normal weight text'}
                  </p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    {language === 'kh' ? 'ពុម្ពអក្សរដិត (Bold)' : 'Bold weight text'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* English Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {language === 'kh' ? 'អត្ថបទអង់គ្លេស' : 'English Text'}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {language === 'kh' ? 'ព័ត៌មានថ្មីៗ' : 'Latest News'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Welcome to Razwire! We are your daily source of news providing the latest information about technology, business, and sports. Stay informed, stay ahead.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {language === 'kh' ? 'ពុម្ពអក្សរផ្សេងៗ' : 'Different Font Weights'}
                </h3>
                <div className="space-y-2">
                  <p className="font-light text-sm text-gray-600 dark:text-gray-400">
                    Light weight text
                  </p>
                  <p className="font-normal text-base text-gray-700 dark:text-gray-300">
                    Normal weight text
                  </p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    Bold weight text
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Using LocalizedText Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {language === 'kh' ? 'ប្រើ LocalizedText Component' : 'Using LocalizedText Component'}
          </h2>
          <div className="space-y-4">
            <LocalizedText as="h3" weight="bold" size="lg" className="text-gray-800 dark:text-gray-200">
              {language === 'kh' ? 'ចំណងជើងដោយប្រើ LocalizedText' : 'Heading using LocalizedText'}
            </LocalizedText>
            <LocalizedText as="p" className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'kh' 
                ? 'អត្ថបទនេះប្រើ LocalizedText component ដែលអាចប្តូរពុម្ពអក្សរដោយស្វ័យប្រវត្តិដោយផ្អែកលើភាសាបច្ចុប្បន្ន។'
                : 'This text uses LocalizedText component which can automatically switch fonts based on the current language.'
              }
            </LocalizedText>
          </div>
        </div>

        {/* Current Language Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
            {language === 'kh' ? 'ព័ត៌មានភាសាបច្ចុប្បន្ន' : 'Current Language Info'}
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            {language === 'kh' 
              ? `ភាសាបច្ចុប្បន្ន: ខ្មែរ (${language}) - ពុម្ពអក្សរ: Kontumruy Pro`
              : `Current Language: English (${language}) - Font: Inter`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
