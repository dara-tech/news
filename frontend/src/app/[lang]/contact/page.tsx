import { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

interface ContactPageProps {
  params: Promise<{ lang: string }>;
}

export const metadata: Metadata = {
  title: 'Contact Us - Razewire',
  description: 'Get in touch with our news team. Send us your story tips, feedback, or general inquiries.',
  openGraph: {
    title: 'Contact Us - Razewire',
    description: 'Get in touch with our news team. Send us your story tips, feedback, or general inquiries.',
  },
};

const translations = {
  en: {
    title: 'Contact Us',
    subtitle: 'Get in touch with our news team',
    description: 'Have a story tip, feedback, or general inquiry? We\'d love to hear from you.',
    contactInfo: 'Contact Information',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    hours: 'Business Hours',
    hoursValue: 'Monday - Friday: 9:00 AM - 6:00 PM',
    form: {
      title: 'Send us a message',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Message',
      namePlaceholder: 'Enter your full name',
      emailPlaceholder: 'Enter your email address',
      subjectPlaceholder: 'What is this about?',
      messagePlaceholder: 'Tell us more about your inquiry...',
    },
    addressValue: '123 News Street, Media City, MC 12345',
    phoneValue: '+1 (555) 123-4567',
    emailValue: 'contact@razewire.online',
  },
  kh: {
    title: 'ទាក់ទងយើង',
    subtitle: 'ទាក់ទងជាមួយក្រុមការងារព័ត៌មានរបស់យើង',
    description: 'មានព័ត៌មានសំខាន់ ការឆ្លើយតប ឬសំណួរទូទៅ? យើងចង់ស្តាប់ពីអ្នក។',
    contactInfo: 'ព័ត៌មានទំនាក់ទំនង',
    address: 'អាសយដ្ឋាន',
    phone: 'ទូរស័ព្ទ',
    email: 'អ៊ីមែល',
    hours: 'ម៉ោងធ្វើការ',
    hoursValue: 'ច័ន្ទ - សុក្រ: ម៉ោង ៩:០០ ព្រឹក - ៦:០០ ល្ងាច',
    form: {
      title: 'ផ្ញើសារមកយើង',
      name: 'ឈ្មោះពេញ',
      email: 'អាសយដ្ឋានអ៊ីមែល',
      subject: 'ប្រធានបទ',
      message: 'សារ',
      send: 'ផ្ញើសារ',
      namePlaceholder: 'បញ្ចូលឈ្មោះពេញរបស់អ្នក',
      emailPlaceholder: 'បញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក',
      subjectPlaceholder: 'នេះជាអំពីអ្វី?',
      messagePlaceholder: 'ប្រាប់យើងបន្ថែមអំពីសំណួររបស់អ្នក...',
    },
    addressValue: '១២៣ ផ្លូវព័ត៌មាន, ទីក្រុងមេឌៀ, MC 12345',
    phoneValue: '+1 (555) 123-4567',
    emailValue: 'contact@razewire.online',
  },
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {t.subtitle}
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t.contactInfo}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.address}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t.addressValue}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.phone}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t.phoneValue}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.email}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t.emailValue}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t.hours}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t.hoursValue}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t.form.title}
            </h2>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.form.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={t.form.namePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.form.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t.form.emailPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.form.subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder={t.form.subjectPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder={t.form.messagePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{t.form.send}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
