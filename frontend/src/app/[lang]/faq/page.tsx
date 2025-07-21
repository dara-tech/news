import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - NewsApp',
  description: 'Find answers to common questions about NewsApp, our services, and how to use our platform.',
};

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is NewsApp?',
        answer: 'NewsApp is a comprehensive news platform that delivers the latest news across various categories including technology, business, sports, politics, entertainment, and health. We provide timely, accurate, and relevant news to keep you informed.'
      },
      {
        question: 'Is NewsApp free to use?',
        answer: 'Yes, NewsApp is completely free to use. You can read articles, browse categories, and access most of our content without any subscription fees.'
      },
      {
        question: 'How often is the content updated?',
        answer: 'Our content is updated continuously throughout the day. We publish new articles as news breaks and ensure our readers have access to the most current information.'
      }
    ]
  },
  {
    category: 'Account & Profile',
    questions: [
      {
        question: 'Do I need to create an account?',
        answer: 'Creating an account is optional. You can browse and read articles without an account, but having one allows you to save articles, customize your news feed, and receive personalized recommendations.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click on the "Login" button in the top navigation, then select "Sign Up". Fill in your details including name, email, and password to create your account.'
      },
      {
        question: 'I forgot my password. How can I reset it?',
        answer: 'On the login page, click "Forgot Password" and enter your email address. We\'ll send you a reset link to create a new password.'
      }
    ]
  },
  {
    category: 'Content & Categories',
    questions: [
      {
        question: 'What categories of news do you cover?',
        answer: 'We cover a wide range of categories including Technology, Business, Sports, Politics, Entertainment, and Health. Each category is regularly updated with the latest news and insights.'
      },
      {
        question: 'Can I search for specific topics?',
        answer: 'Yes! Use the search function to find articles on specific topics, keywords, or phrases. You can also filter search results by category and date.'
      },
      {
        question: 'How do I find older articles?',
        answer: 'Visit our Archive section where you can browse articles by date, category, or use our advanced search filters to find specific content from the past.'
      }
    ]
  },
  {
    category: 'Newsletter & Notifications',
    questions: [
      {
        question: 'How do I subscribe to the newsletter?',
        answer: 'Visit our Newsletter page and enter your email address. You can choose to receive daily digests, breaking news alerts, or weekly roundups based on your preferences.'
      },
      {
        question: 'Can I customize what news I receive?',
        answer: 'Yes, when subscribing to our newsletter, you can select your preferred categories and frequency of updates. You can also modify these preferences anytime.'
      },
      {
        question: 'How do I unsubscribe from the newsletter?',
        answer: 'Every newsletter email contains an unsubscribe link at the bottom. Click it to instantly unsubscribe, or manage your subscription preferences from your account settings.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        question: 'The website is loading slowly. What should I do?',
        answer: 'Try refreshing the page or clearing your browser cache. If the problem persists, check your internet connection or try accessing the site from a different browser.'
      },
      {
        question: 'I found an error or broken link. How do I report it?',
        answer: 'Please contact us through our Contact page with details about the error, including the page URL and what you were trying to do. We appreciate your help in improving our site.'
      },
      {
        question: 'Is NewsApp mobile-friendly?',
        answer: 'Yes! NewsApp is fully responsive and optimized for mobile devices. You can access all features and content seamlessly on your smartphone or tablet.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'How do you protect my personal information?',
        answer: 'We take privacy seriously. Please read our Privacy Policy for detailed information about how we collect, use, and protect your personal data.'
      },
      {
        question: 'Do you use cookies?',
        answer: 'Yes, we use cookies to improve your browsing experience, remember your preferences, and analyze site traffic. You can manage cookie preferences in your browser settings.'
      },
      {
        question: 'Can I delete my account and data?',
        answer: 'Yes, you can delete your account and associated data at any time from your account settings. This action is permanent and cannot be undone.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about NewsApp
          </p>
        </div>

        {/* Quick Search */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {category.category}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.questions.map((faq, faqIndex) => (
                  <details key={faqIndex} className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      <svg 
                        className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Contact Support
              </Link>
              <a
                href="mailto:support@newsapp.com"
                className="inline-block px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors duration-200"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
