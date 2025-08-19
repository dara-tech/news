import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter - Razewire',
  description: 'Subscribe to our newsletter and get the latest news delivered directly to your inbox.',
};

export default function NewsletterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Informed
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Subscribe to our newsletter and never miss the latest news
          </p>
        </div>

        {/* Newsletter Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            What you&apos;ll get:
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 mt-1">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Daily News Digest</h3>
                <p className="text-gray-600 dark:text-gray-300">Top stories delivered to your inbox every morning</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 mt-1">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Breaking News Alerts</h3>
                <p className="text-gray-600 dark:text-gray-300">Instant notifications for major breaking news</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 mt-1">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Weekly Roundup</h3>
                <p className="text-gray-600 dark:text-gray-300">Comprehensive summary of the week&apos;s most important stories</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 mt-1">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Exclusive Content</h3>
                <p className="text-gray-600 dark:text-gray-300">Subscriber-only articles and in-depth analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Form */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Subscribe Now
          </h2>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter your full name"
              />
            </div>
            
            {/* Subscription Preferences */}
            <div>
              <label className="block text-sm font-medium mb-3">
                What would you like to receive?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences"
                    value="daily"
                    defaultChecked
                    className="mr-3 rounded"
                  />
                  <span>Daily news digest</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences"
                    value="breaking"
                    defaultChecked
                    className="mr-3 rounded"
                  />
                  <span>Breaking news alerts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences"
                    value="weekly"
                    defaultChecked
                    className="mr-3 rounded"
                  />
                  <span>Weekly roundup</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Subscribe to Newsletter
            </button>
            
            <p className="text-sm text-center opacity-90">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How often will I receive emails?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You can choose your frequency: daily digest, breaking news alerts, or weekly roundup. 
                You have full control over what you receive.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I unsubscribe anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Absolutely! Every email includes an unsubscribe link, and you can opt out at any time 
                with just one click.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you share my email with third parties?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Never. We respect your privacy and will never share, sell, or rent your email address 
                to any third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
