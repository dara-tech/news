'use client';

import { LocalizedText } from '@/components/ui/LocalizedText';
import { useOptimizedLanguage } from '@/hooks/useOptimizedLanguage';

export function FontDemo() {
  const { language } = useOptimizedLanguage();
  const isKhmer = language === 'kh';

  return (
    <div className="p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isKhmer ? 'ការបង្ហាញពុម្ពអក្សរ' : 'Font Demo'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isKhmer 
            ? 'ពុម្ពអក្សរ Kontumruy Pro សម្រាប់អត្ថបទខ្មែរ' 
            : 'Kontumruy Pro font for Khmer text'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isKhmer ? 'អត្ថបទខ្មែរ' : 'Khmer Text'}
          </h3>
          <LocalizedText className="text-base leading-relaxed">
            {isKhmer 
              ? 'សូមស្វាគមន៍មកកាន់ Razwire! យើងជាប្រភពព័ត៌មានប្រចាំថ្ងៃដែលផ្តល់ព័ត៌មានថ្មីៗអំពីបច្ចេកវិទ្យា អាជីវកម្ម និងកីឡា។ សូមអាន សូមដឹង សូមជាប់គាំង។'
              : 'Welcome to Razwire! We are your daily source of news providing the latest information about technology, business, and sports. Stay informed, stay ahead.'
            }
          </LocalizedText>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isKhmer ? 'អត្ថបទអង់គ្លេស' : 'English Text'}
          </h3>
          <LocalizedText className="text-base leading-relaxed">
            {isKhmer 
              ? 'Welcome to Razwire! We are your daily source of news providing the latest information about technology, business, and sports. Stay informed, stay ahead.'
              : 'Welcome to Razwire! We are your daily source of news providing the latest information about technology, business, and sports. Stay informed, stay ahead.'
            }
          </LocalizedText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">
              {isKhmer ? 'ពុម្ពអក្សរ Kontumruy Pro' : 'Kontumruy Pro Font'}
            </h4>
            <div className="space-y-2">
              <LocalizedText weight="light" size="sm">
                {isKhmer ? 'ពុម្ពអក្សរស្រាល' : 'Light weight'}
              </LocalizedText>
              <LocalizedText weight="normal" size="base">
                {isKhmer ? 'ពុម្ពអក្សរធម្មតា' : 'Normal weight'}
              </LocalizedText>
              <LocalizedText weight="bold" size="lg">
                {isKhmer ? 'ពុម្ពអក្សរដិត' : 'Bold weight'}
              </LocalizedText>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              {isKhmer ? 'ពុម្ពអក្សរ Inter' : 'Inter Font'}
            </h4>
            <div className="space-y-2 font-sans">
              <div className="font-light text-sm">
                {isKhmer ? 'ពុម្ពអក្សរស្រាល' : 'Light weight'}
              </div>
              <div className="font-normal text-base">
                {isKhmer ? 'ពុម្ពអក្សរធម្មតា' : 'Normal weight'}
              </div>
              <div className="font-bold text-lg">
                {isKhmer ? 'ពុម្ពអក្សរដិត' : 'Bold weight'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
