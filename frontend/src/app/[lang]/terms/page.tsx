import { Metadata } from 'next';
import { FileText, Scale, AlertTriangle, Users, Shield, Gavel } from 'lucide-react';

interface TermsPageProps {
  params: Promise<{ lang: string }>;
}

export const metadata: Metadata = {
  title: 'Terms of Service - NewsApp',
  description: 'Read our terms of service to understand your rights and responsibilities when using NewsApp.',
  openGraph: {
    title: 'Terms of Service - NewsApp',
    description: 'Read our terms of service to understand your rights and responsibilities when using NewsApp.',
  },
};

const translations = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: January 2024',
    intro: 'Welcome to NewsApp. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our service, you agree to be bound by these Terms.',
    sections: {
      acceptance: {
        title: 'Acceptance of Terms',
        content: [
          'By accessing and using NewsApp, you accept and agree to be bound by the terms and provision of this agreement.',
          'If you do not agree to abide by the above, please do not use this service.',
          'These terms apply to all visitors, users, and others who access or use the service.',
        ],
      },
      services: {
        title: 'Description of Service',
        content: [
          'NewsApp provides news content, articles, and related information services.',
          'We reserve the right to modify or discontinue the service at any time without notice.',
          'The service is provided "as is" without any warranties, expressed or implied.',
        ],
      },
      accounts: {
        title: 'User Accounts',
        content: [
          'You are responsible for safeguarding your account credentials.',
          'You must provide accurate and complete information when creating an account.',
          'You are responsible for all activities that occur under your account.',
          'We reserve the right to suspend or terminate accounts that violate these terms.',
        ],
      },
      content: {
        title: 'Content and Conduct',
        content: [
          'You may not use our service for any illegal or unauthorized purpose.',
          'You must not transmit any harmful, offensive, or inappropriate content.',
          'We reserve the right to remove content that violates our community guidelines.',
          'All content published on NewsApp remains the property of NewsApp or its content providers.',
        ],
      },
      intellectual: {
        title: 'Intellectual Property',
        content: [
          'All content, trademarks, and intellectual property on NewsApp are owned by us or our licensors.',
          'You may not reproduce, distribute, or create derivative works without permission.',
          'User-generated content remains your property, but you grant us a license to use it.',
        ],
      },
      limitation: {
        title: 'Limitation of Liability',
        content: [
          'NewsApp shall not be liable for any indirect, incidental, or consequential damages.',
          'Our total liability shall not exceed the amount paid by you for the service.',
          'Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability.',
        ],
      },
      termination: {
        title: 'Termination',
        content: [
          'We may terminate or suspend your account immediately for any breach of these Terms.',
          'Upon termination, your right to use the service will cease immediately.',
          'All provisions that should survive termination shall survive.',
        ],
      },
      changes: {
        title: 'Changes to Terms',
        content: [
          'We reserve the right to modify these terms at any time.',
          'Changes will be effective immediately upon posting on this page.',
          'Your continued use of the service constitutes acceptance of the modified terms.',
        ],
      },
      contact: {
        title: 'Contact Information',
        content: 'If you have any questions about these Terms of Service, please contact us at legal@newsapp.com or through our contact page.',
      },
    },
  },
  kh: {
    title: 'លក្ខខណ្ឌនៃសេវាកម្ម',
    lastUpdated: 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: មករា ២០២៤',
    intro: 'សូមស្វាគមន៍មកកាន់ NewsApp។ លក្ខខណ្ឌនៃសេវាកម្មទាំងនេះ ("លក្ខខណ្ឌ") គ្រប់គ្រងការប្រើប្រាស់គេហទំព័រ និងសេវាកម្មរបស់យើង។ ដោយការចូលដំណើរការ ឬប្រើប្រាស់សេវាកម្មរបស់យើង អ្នកយល់ព្រមត្រូវបានកំណត់ដោយលក្ខខណ្ឌទាំងនេះ។',
    sections: {
      acceptance: {
        title: 'ការទទួលយកលក្ខខណ្ឌ',
        content: [
          'ដោយការចូលដំណើរការ និងប្រើប្រាស់ NewsApp អ្នកទទួលយក និងយល់ព្រមត្រូវបានកំណត់ដោយលក្ខខណ្ឌ និងបទប្បញ្ញត្តិនៃកិច្ចព្រមព្រៀងនេះ។',
          'ប្រសិនបើអ្នកមិនយល់ព្រមអនុលោមតាមខាងលើ សូមកុំប្រើសេវាកម្មនេះ។',
          'លក្ខខណ្ឌទាំងនេះអនុវត្តចំពោះអ្នកទស្សនា អ្នកប្រើប្រាស់ និងអ្នកដទៃទៀតដែលចូលដំណើរការ ឬប្រើប្រាស់សេវាកម្ម។',
        ],
      },
      services: {
        title: 'ការពិពណ៌នាអំពីសេវាកម្ម',
        content: [
          'NewsApp ផ្តល់មាតិកាព័ត៌មាន អត្ថបទ និងសេវាកម្មព័ត៌មានពាក់ព័ន្ធ។',
          'យើងរក្សាសិទ្ធិក្នុងការកែប្រែ ឬបញ្ឈប់សេវាកម្មនៅពេលណាក៏បានដោយគ្មានការជូនដំណឹង។',
          'សេវាកម្មត្រូវបានផ្តល់ "ដូចដែលវាជា" ដោយគ្មានការធានាណាមួយ ទាំងដែលបានបញ្ជាក់ ឬបន្យោល។',
        ],
      },
      accounts: {
        title: 'គណនីអ្នកប្រើប្រាស់',
        content: [
          'អ្នកទទួលខុសត្រូវក្នុងការការពារព័ត៌មានសម្ងាត់គណនីរបស់អ្នក។',
          'អ្នកត្រូវតែផ្តល់ព័ត៌មានត្រឹមត្រូវ និងពេញលេញនៅពេលបង្កើតគណនី។',
          'អ្នកទទួលខុសត្រូវចំពោះសកម្មភាពទាំងអស់ដែលកើតឡើងក្រោមគណនីរបស់អ្នក។',
          'យើងរក្សាសិទ្ធិក្នុងការផ្អាក ឬបញ្ឈប់គណនីដែលរំលោភលក្ខខណ្ឌទាំងនេះ។',
        ],
      },
      content: {
        title: 'មាតិកា និងអាកប្បកិរិយា',
        content: [
          'អ្នកមិនអាចប្រើសេវាកម្មរបស់យើងសម្រាប់គោលបំណងខុសច្បាប់ ឬគ្មានការអនុញ្ញាតទេ។',
          'អ្នកមិនត្រូវផ្ទេរមាតិកាដែលបង្កគ្រោះថ្នាក់ គួរឱ្យស្អប់ខ្ពើម ឬមិនសមរម្យទេ។',
          'យើងរក្សាសិទ្ធិក្នុងការដកចេញមាតិកាដែលរំលោភគោលការណ៍សហគមន៍របស់យើង។',
          'មាតិកាទាំងអស់ដែលបានបោះពុម្ពនៅលើ NewsApp នៅតែជាកម្មសិទ្ធិរបស់ NewsApp ឬអ្នកផ្តល់មាតិការបស់វា។',
        ],
      },
      intellectual: {
        title: 'កម្មសិទ្ធិបញ្ញា',
        content: [
          'មាតិកា ម៉ាកយីហោ និងកម្មសិទ្ធិបញ្ញាទាំងអស់នៅលើ NewsApp ជាកម្មសិទ្ធិរបស់យើង ឬអ្នកផ្តល់អាជ្ញាប័ណ្ណរបស់យើង។',
          'អ្នកមិនអាចបន្តផលិត ចែកចាយ ឬបង្កើតស្នាដៃដែលបានកែប្រែដោយគ្មានការអនុញ្ញាតទេ។',
          'មាតិកាដែលបង្កើតដោយអ្នកប្រើប្រាស់នៅតែជាកម្មសិទ្ធិរបស់អ្នក ប៉ុន្តែអ្នកផ្តល់អាជ្ញាប័ណ្ណដល់យើងក្នុងការប្រើប្រាស់វា។',
        ],
      },
      limitation: {
        title: 'ការកំណត់ទំនួលខុសត្រូវ',
        content: [
          'NewsApp នឹងមិនទទួលខុសត្រូវចំពោះការខូចខាតដោយប្រយោល ចៃដន្យ ឬជាលទ្ធផលណាមួយទេ។',
          'ទំនួលខុសត្រូវសរុបរបស់យើងនឹងមិនលើសពីចំនួនទឹកប្រាក់ដែលអ្នកបានបង់សម្រាប់សេវាកម្មទេ។',
          'យុត្តាធិការខ្លះមិនអនុញ្ញាតឱ្យមានការលើកលែងការធានាមួយចំនួន ឬការកំណត់ទំនួលខុសត្រូវទេ។',
        ],
      },
      termination: {
        title: 'ការបញ្ឈប់',
        content: [
          'យើងអាចបញ្ឈប់ ឬផ្អាកគណនីរបស់អ្នកភ្លាមៗសម្រាប់ការរំលោភលក្ខខណ្ឌទាំងនេះ។',
          'បន្ទាប់ពីការបញ្ឈប់ សិទ្ធិរបស់អ្នកក្នុងការប្រើប្រាស់សេវាកម្មនឹងបញ្ឈប់ភ្លាមៗ។',
          'បទប្បញ្ញត្តិទាំងអស់ដែលគួរតែបន្តបន្ទាប់ពីការបញ្ឈប់នឹងបន្ត។',
        ],
      },
      changes: {
        title: 'ការផ្លាស់ប្តូរលក្ខខណ្ឌ',
        content: [
          'យើងរក្សាសិទ្ធិក្នុងការកែប្រែលក្ខខណ្ឌទាំងនេះនៅពេលណាក៏បាន។',
          'ការផ្លាស់ប្តូរនឹងមានប្រសិទ្ធភាពភ្លាមៗបន្ទាប់ពីការបោះពុម្ពនៅលើទំព័រនេះ។',
          'ការប្រើប្រាស់សេវាកម្មបន្តរបស់អ្នកបង្កើតការទទួលយកលក្ខខណ្ឌដែលបានកែប្រែ។',
        ],
      },
      contact: {
        title: 'ព័ត៌មានទំនាក់ទំនង',
        content: 'ប្រសិនបើអ្នកមានសំណួរណាមួយអំពីលក្ខខណ្ឌនៃសេវាកម្មទាំងនេះ សូមទាក់ទងយើងតាមរយៈ legal@newsapp.com ឬតាមរយៈទំព័រទាក់ទងរបស់យើង។',
      },
    },
  },
};

export default async function TermsPage({ params }: TermsPageProps) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations] || translations.en;

  const iconMap = {
    acceptance: FileText,
    services: Scale,
    accounts: Users,
    content: AlertTriangle,
    intellectual: Shield,
    limitation: Gavel,
    termination: AlertTriangle,
    changes: FileText,
    contact: Scale,
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
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6">
            <Scale className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              {lang === 'kh' 
                ? 'ដោយការប្រើប្រាស់សេវាកម្មរបស់យើង អ្នកយល់ព្រមអនុលោមតាមលក្ខខណ្ឌទាំងនេះ។'
                : 'By using our service, you agree to comply with these terms and conditions.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
