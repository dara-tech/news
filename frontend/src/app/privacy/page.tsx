'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1.1 Personal Information</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Register for an account</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us through our contact forms</li>
                <li>Comment on articles</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                This information may include your name, email address, username, and any other information you choose to provide.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">1.2 Automatically Collected Information</h3>
              <p className="text-gray-600 dark:text-gray-300">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on each page</li>
                <li>Referring website</li>
                <li>Device information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Provide and maintain our news service</li>
              <li>Personalize your experience</li>
              <li>Send you newsletters and updates (with your consent)</li>
              <li>Respond to your comments and inquiries</li>
              <li>Analyze website usage and improve our services</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic.
            </p>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">3.1 Types of Cookies We Use</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Advertising Cookies:</strong> Used by Google AdSense to display relevant ads</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.2 Google AdSense</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Display personalized advertisements</li>
                <li>Analyze ad performance</li>
                <li>Prevent fraud</li>
                <li>Improve ad relevance</li>
              </ul>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                You can opt out of personalized advertising by visiting{' '}
                <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline">
                  Google Ads Settings
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may use third-party services that collect, monitor, and analyze data:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Google AdSense:</strong> Advertising services</li>
              <li><strong>Cloudinary:</strong> Image hosting and optimization</li>
              <li><strong>Social Media Platforms:</strong> Social sharing and integration</li>
            </ul>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              These third-party services have their own privacy policies, and we encourage you to review them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>To prevent fraud or abuse</li>
              <li>With trusted third-party service providers who assist us in operating our website</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your personal information</li>
              <li>Restrict processing of your information</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
