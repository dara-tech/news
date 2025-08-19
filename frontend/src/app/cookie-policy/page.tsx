'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiePolicyPage() {
  const t = useTranslations('CookiePolicy');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Cookie Policy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies cannot be used to run programs or deliver viruses to your computer.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use cookies for several purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>To provide you with a better user experience</li>
              <li>To analyze how our website is used</li>
              <li>To remember your preferences and settings</li>
              <li>To display personalized advertisements</li>
              <li>To ensure the security of our website</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3.1 Essential Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and form submissions. The website cannot function properly without these cookies.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.2 Analytics Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and user experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.3 Preference Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                These cookies allow our website to remember information that changes the way the website behaves or looks, such as your preferred language or the region you are in.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.4 Advertising Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same advertisement from continuously reappearing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Google AdSense Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Our website uses Google AdSense to display advertisements. Google AdSense uses cookies to:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Display personalized advertisements based on your interests</li>
              <li>Analyze the performance of advertisements</li>
              <li>Prevent fraud and ensure ad quality</li>
              <li>Limit the number of times you see a particular ad</li>
              <li>Remember your preferences for ad personalization</li>
            </ul>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Google AdSense Cookie Types:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li><strong>__gads:</strong> Used to track user interactions with ads</li>
                <li><strong>_gac:</strong> Contains campaign information for Google Analytics</li>
                <li><strong>_gid:</strong> Used to distinguish users for Google Analytics</li>
                <li><strong>_ga:</strong> Used to distinguish unique users</li>
                <li><strong>IDE:</strong> Used by Google DoubleClick to register and report user actions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may also use third-party cookies from the following services:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Google AdSense:</strong> Advertising services</li>
              <li><strong>Cloudinary:</strong> Image hosting and optimization</li>
              <li><strong>Social Media Platforms:</strong> Social sharing and integration</li>
            </ul>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              These third-party services have their own privacy policies and cookie practices. We encourage you to review their policies for more information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies on our website may be:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
            </ul>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              The specific duration of each cookie depends on its purpose and the service that sets it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">7.1 Browser Settings</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Most web browsers allow you to control cookies through their settings preferences. You can:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Delete existing cookies</li>
                <li>Block cookies from being set</li>
                <li>Set your browser to notify you when cookies are being set</li>
                <li>Choose which types of cookies to accept</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7.2 Google AdSense Opt-Out</h3>
              <p className="text-gray-600 dark:text-gray-300">
                To opt out of personalized advertising from Google AdSense, you can:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Visit <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline">Google Ads Settings</a></li>
                <li>Use the Google Analytics opt-out browser add-on</li>
                <li>Configure your browser to block third-party cookies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7.3 Impact of Disabling Cookies</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Please note that disabling certain cookies may affect the functionality of our website. Essential cookies cannot be disabled as they are necessary for the website to function properly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Updates to This Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p><strong>Email:</strong> privacy@razewire.online</p>
              <p><strong>Website:</strong> https://www.razewire.online</p>
              <p><strong>Address:</strong> Phnom Penh, Cambodia</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
