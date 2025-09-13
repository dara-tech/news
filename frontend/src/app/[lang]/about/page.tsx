import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About Razewire
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your trusted source for reliable news and information
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Razewire is committed to delivering accurate, timely, and comprehensive news coverage 
            that keeps our readers informed about the events that matter most. We strive to provide 
            unbiased reporting that empowers our community to make informed decisions.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <p><strong>Email:</strong> <a href="mailto:contact@razewire.online" className="text-blue-600 hover:underline">contact@razewire.online</a></p>
            <p><strong>Support:</strong> <a href="mailto:support@razewire.online" className="text-blue-600 hover:underline">support@razewire.online</a></p>
            <p><strong>Corrections:</strong> <a href="mailto:corrections@razewire.online" className="text-blue-600 hover:underline">corrections@razewire.online</a></p>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Legal Information
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy & Legal</h3>
              <div className="flex flex-wrap gap-4 text-blue-600 dark:text-blue-400">
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link href="/terms" className="hover:underline">Terms of Service</Link>
                <Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Advertising</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Razewire uses Google AdSense to display advertisements. For information about 
                our advertising practices, please see our Privacy Policy and Cookie Policy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Corrections</h3>
              <p className="text-gray-600 dark:text-gray-300">
                If you notice an error in our reporting, please contact us at 
                <a href="mailto:corrections@razewire.online" className="text-blue-600 hover:underline ml-1">
                  corrections@razewire.online
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}