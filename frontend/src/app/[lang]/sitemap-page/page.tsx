import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sitemap - NewsApp',
  description: 'Navigate through all pages and sections of NewsApp easily with our comprehensive sitemap.',
};

interface SitemapPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SitemapPage({ params }: SitemapPageProps) {
  const { lang } = await params;

  const siteStructure = [
    {
      title: 'Main Pages',
      links: [
        { name: 'Home', href: `/${lang}` },
        { name: 'All News', href: `/${lang}/news` },
        { name: 'Search', href: `/${lang}/search` },
        { name: 'Archive', href: `/${lang}/archive` },
        { name: 'About Us', href: `/${lang}/about` },
        { name: 'Contact', href: `/${lang}/contact` },
        { name: 'FAQ', href: `/${lang}/faq` },
        { name: 'Newsletter', href: `/${lang}/newsletter` },
      ]
    },
    {
      title: 'News Categories',
      links: [
        { name: 'Technology', href: `/${lang}/category/technology` },
        { name: 'Business', href: `/${lang}/category/business` },
        { name: 'Sports', href: `/${lang}/category/sports` },
        { name: 'Politics', href: `/${lang}/category/politics` },
        { name: 'Entertainment', href: `/${lang}/category/entertainment` },
        { name: 'Health', href: `/${lang}/category/health` },
      ]
    },
    {
      title: 'User Account',
      links: [
        { name: 'Login', href: `/${lang}/login` },
        { name: 'Profile', href: `/${lang}/profile` },
      ]
    },
    {
      title: 'Legal & Policies',
      links: [
        { name: 'Privacy Policy', href: `/${lang}/privacy` },
        { name: 'Terms of Service', href: `/${lang}/terms` },
      ]
    },
    {
      title: 'Admin (Authorized Users)',
      links: [
        { name: 'Admin Dashboard', href: `/${lang}/admin/dashboard` },
        { name: 'Manage News', href: `/${lang}/admin/news` },
        { name: 'Create News', href: `/${lang}/admin/news/create` },
        { name: 'Manage Users', href: `/${lang}/admin/users` },
        { name: 'Create User', href: `/${lang}/admin/users/create` },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sitemap
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Navigate through all pages and sections of NewsApp
          </p>
        </div>

        {/* Language Toggle */}
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <Link
              href="/en/sitemap-page"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                lang === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              English
            </Link>
            <Link
              href="/km/sitemap-page"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                lang === 'km'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ខ្មែរ (Khmer)
            </Link>
          </div>
        </div>

        {/* Sitemap Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {siteStructure.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Additional Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Dynamic Content
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Individual news articles: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">/{lang}/news/[article-slug]</code></li>
                <li>• User profiles: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">/{lang}/profile</code></li>
                <li>• Admin edit pages: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">/{lang}/admin/news/edit/[id]</code></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Special Pages
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 404 Error Page</li>
                <li>• Unauthorized Access Page</li>
                <li>• XML Sitemap: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">/sitemap.xml</code></li>
                <li>• Robots.txt: <code className="text-sm bg-gray-200 dark:bg-gray-700 px-1 rounded">/robots.txt</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Site Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">25+</div>
                <div className="text-gray-600 dark:text-gray-300">Static Pages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">6</div>
                <div className="text-gray-600 dark:text-gray-300">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
                <div className="text-gray-600 dark:text-gray-300">Languages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">∞</div>
                <div className="text-gray-600 dark:text-gray-300">News Articles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
