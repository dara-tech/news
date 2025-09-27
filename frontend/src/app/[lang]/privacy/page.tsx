import { Metadata } from 'next';
import { Shield, Eye, Lock, Users, Database, Globe } from 'lucide-react';

interface PrivacyPageProps {
  params: Promise<{ lang: string }>;
}

export const metadata: Metadata = {
  title: 'Privacy Policy - Razewire',
  description: 'Learn how Razewire collects, uses, and protects your personal information. Your privacy is important to us.',
  openGraph: {
    title: 'Privacy Policy - Razewire',
    description: 'Learn how Razewire collects, uses, and protects your personal information. Your privacy is important to us.',
  },
};

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 2024',
    intro: 'At Razewire, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.',
    sections: {
      collection: {
        title: 'Information We Collect',
        content: [
          'Personal Information: When you register for an account, subscribe to our newsletter, or contact us, we may collect personal information such as your name, email address, and contact details.',
          'Usage Data: We automatically collect information about how you interact with our website, including pages visited, time spent, and browser information.',
          'Cookies: We use cookies and similar technologies to enhance your browsing experience and analyze website traffic.',
        ],
      },
      usage: {
        title: 'How We Use Your Information',
        content: [
          'To provide and maintain our news service',
          'To send you newsletters and updates (with your consent)',
          'To respond to your inquiries and provide customer support',
          'To analyze website usage and improve our services',
          'To comply with legal obligations',
        ],
      },
      sharing: {
        title: 'Information Sharing',
        content: [
          'We do not sell, trade, or rent your personal information to third parties.',
          'We may share information with trusted service providers who assist us in operating our website.',
          'We may disclose information when required by law or to protect our rights and safety.',
        ],
      },
      security: {
        title: 'Data Security',
        content: [
          'We implement appropriate security measures to protect your personal information.',
          'All data transmission is encrypted using SSL technology.',
          'We regularly update our security practices to protect against unauthorized access.',
        ],
      },
      rights: {
        title: 'Your Rights',
        content: [
          'Access: You can request access to your personal information.',
          'Correction: You can request correction of inaccurate information.',
          'Deletion: You can request deletion of your personal information.',
          'Opt-out: You can unsubscribe from our communications at any time.',
        ],
      },
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@razewire.online or through our contact page.',
      },
    },
  },
  kh: {
    title: 'គោលការណ៍ភាពឯកជន',
    lastUpdated: 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មករា ២០២៤',
    intro: 'នៅ Razewire យើងប្តេជ្ញាចិត្តក្នុងការការពារភាពឯកជនរបស់អ្នក និងធានាសុវត្ថិភាពនៃព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។ គោលការណ៍ភាពឯកជននេះពន្យល់អំពីរបៀបដែលយើងប្រមូល ប្រើប្រាស់ បង្ហាញ និងការពារព័ត៌មានរបស់អ្នកនៅពេលអ្នកចូលមើលគេហទំព័ររបស់យើង។',
    sections: {
      collection: {
        title: 'ព័ត៌មានដែលយើងប្រមូល',
        content: [
          'ព័ត៌មានផ្ទាល់ខ្លួន៖ នៅពេលអ្នកចុះឈ្មោះសម្រាប់គណនី ជាវព្រឹត្តិប័ត្រព័ត៌មាន ឬទាក់ទងយើង យើងអាចប្រមូលព័ត៌មានផ្ទាល់ខ្លួនដូចជាឈ្មោះ អាសយដ្ឋានអ៊ីមែល និងព័ត៌មានទំនាក់ទំនង។',
          'ទិន្នន័យការប្រើប្រាស់៖ យើងប្រមូលព័ត៌មានដោយស្វ័យប្រវត្តិអំពីរបៀបដែលអ្នកប្រើប្រាស់គេហទំព័ររបស់យើង រួមទាំងទំព័រដែលបានមើល ពេលវេលាដែលចំណាយ និងព័ត៌មានកម្មវិធីរុករក។',
          'ខូគី៖ យើងប្រើខូគី និងបច្ចេកវិទ្យាស្រដៀងគ្នាដើម្បីបង្កើនបទពិសោធន៍រុករករបស់អ្នក និងវិភាគចរាចរណ៍គេហទំព័រ។',
        ],
      },
      usage: {
        title: 'របៀបដែលយើងប្រើព័ត៌មានរបស់អ្នក',
        content: [
          'ដើម្បីផ្តល់ និងរក្សាសេវាកម្មព័ត៌មានរបស់យើង',
          'ដើម្បីផ្ញើព្រឹត្តិប័ត្រព័ត៌មាន និងការធ្វើបច្ចុប្បន្នភាព (ជាមួយការយល់ព្រមរបស់អ្នក)',
          'ដើម្បីឆ្លើយតបចំពោះសំណួររបស់អ្នក និងផ្តល់ការគាំទ្រអតិថិជន',
          'ដើម្បីវិភាគការប្រើប្រាស់គេហទំព័រ និងកែលម្អសេវាកម្មរបស់យើង',
          'ដើម្បីអនុលោមតាមកាតព្វកិច្ចផ្លូវច្បាប់',
        ],
      },
      sharing: {
        title: 'ការចែករំលែកព័ត៌មាន',
        content: [
          'យើងមិនលក់ ដូរ ឬជួលព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកទៅភាគីទីបីទេ។',
          'យើងអាចចែករំលែកព័ត៌មានជាមួយអ្នកផ្តល់សេវាកម្មដែលអាចទុកចិត្តបាន ដែលជួយយើងក្នុងការដំណើរការគេហទំព័ររបស់យើង។',
          'យើងអាចបង្ហាញព័ត៌មាននៅពេលដែលច្បាប់តម្រូវ ឬដើម្បីការពារសិទ្ធិ និងសុវត្ថិភាពរបស់យើង។',
        ],
      },
      security: {
        title: 'សុវត្ថិភាពទិន្នន័យ',
        content: [
          'យើងអនុវត្តវិធានការសុវត្ថិភាពសមស្របដើម្បីការពារព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។',
          'ការផ្ទេរទិន្នន័យទាំងអស់ត្រូវបានអ៊ិនគ្រីបដោយប្រើបច្ចេកវិទ្យា SSL។',
          'យើងធ្វើបច្ចុប្បន្នភាពការអនុវត្តសុវត្ថិភាពរបស់យើងជាទៀងទាត់ដើម្បីការពារការចូលដំណើរការដោយគ្មានការអនុញ្ញាត។',
        ],
      },
      rights: {
        title: 'សិទ្ធិរបស់អ្នក',
        content: [
          'ការចូលដំណើរការ៖ អ្នកអាចស្នើសុំការចូលដំណើរការព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។',
          'ការកែតម្រូវ៖ អ្នកអាចស្នើសុំការកែតម្រូវព័ត៌មានមិនត្រឹមត្រូវ។',
          'ការលុបចោល៖ អ្នកអាចស្នើសុំការលុបព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។',
          'ការលែងចូលរួម៖ អ្នកអាចលែងជាវការទំនាក់ទំនងរបស់យើងនៅពេលណាក៏បាន។',
        ],
      },
      contact: {
        title: 'ទាក់ទងយើង',
        content: 'ប្រសិនបើអ្នកមានសំណួរណាមួយអំពីគោលការណ៍ភាពឯកជននេះ សូមទាក់ទងយើងតាមរយៈ privacy@razewire.online ឬតាមរយៈទំព័រទាក់ទងរបស់យើង។',
      },
    },
  },
};

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations] || translations.en;

  const iconMap = {
    collection: Database,
    usage: Eye,
    sharing: Users,
    security: Lock,
    rights: Shield,
    contact: Globe,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t.lastUpdated}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.intro}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {Object.entries(t.sections).map(([key, section]) => {
            const IconComponent = iconMap[key as keyof typeof iconMap];
            return (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                
                {Array.isArray(section.content) ? (
                  <ul className="space-y-4">
                    {section.content.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              {lang === 'kh' 
                ? 'ភាពឯកជនរបស់អ្នកមានសារៈសំខាន់សម្រាប់យើង។ យើងប្តេជ្ញាចិត្តក្នុងការការពារព័ត៌មានរបស់អ្នកដោយសុវត្ថិភាព។'
                : 'Your privacy matters to us. We are committed to protecting your information with the highest security standards.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
