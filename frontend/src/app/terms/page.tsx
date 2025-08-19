'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
         
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              By accessing and using Razewire ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Razewire is a news and information website that provides:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>News articles and updates</li>
              <li>Category-based content organization</li>
              <li>User registration and profiles</li>
              <li>Comment and interaction features</li>
              <li>Newsletter subscriptions</li>
              <li>Search functionality</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3.1 Account Registration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                To access certain features of the Website, you may be required to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.2 Account Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3.3 Account Termination</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to terminate or suspend your account at any time for violations of these Terms of Service or for any other reason at our sole discretion.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. User Conduct</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You agree not to use the Website to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Post or transmit any unlawful, threatening, abusive, defamatory, obscene, vulgar, pornographic, profane, or indecent information</li>
              <li>Post or transmit any information that infringes on any patent, trademark, copyright, trade secret, or other proprietary rights</li>
              <li>Post or transmit any information that contains a virus, worm, or other harmful component</li>
              <li>Post or transmit any unsolicited advertising, promotional materials, or other forms of solicitation</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Interfere with or disrupt the Website or servers or networks connected to the Website</li>
              <li>Attempt to gain unauthorized access to any portion of the Website or any systems or networks</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">5.1 Our Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All content on the Website, including but not limited to text, graphics, images, logos, and software, is the property of Razewire or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5.2 User-Generated Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                By posting content on the Website, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, adapt, publish, translate, and distribute such content.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5.3 Third-Party Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The Website may contain links to third-party websites and content. We are not responsible for the content or privacy practices of such third-party sites.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Advertising and Monetization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">6.1 Google AdSense</h3>
              <p className="text-gray-600 dark:text-gray-300">
                This Website uses Google AdSense to display advertisements. By using our Website, you acknowledge that:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1">
                <li>Google AdSense may use cookies to display personalized advertisements</li>
                <li>Advertisements may be based on your browsing history and interests</li>
                <li>You can opt out of personalized advertising through Google Ads Settings</li>
                <li>We may receive compensation for advertisements displayed on our Website</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">6.2 Ad Blocking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                While we understand that some users may use ad blockers, we encourage you to disable them on our Website to support our content creation and maintenance efforts.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Website, to understand our practices regarding the collection and use of your personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">8.1 Content Accuracy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                While we strive to provide accurate and up-to-date information, we make no warranties about the accuracy, completeness, or reliability of any content on the Website.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">8.2 Service Availability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We do not guarantee that the Website will be available at all times. We may modify, suspend, or discontinue the Website at any time without notice.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">8.3 Limitation of Liability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                In no event shall Razewire be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Website.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              You agree to indemnify and hold harmless Razewire, its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Website or violation of these Terms of Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              These Terms of Service shall be governed by and construed in accordance with the laws of Cambodia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Phnom Penh, Cambodia.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms of Service on this page. Your continued use of the Website after such changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p><strong>Email:</strong> legal@razewire.online</p>
              <p><strong>Website:</strong> https://www.razewire.online</p>
              <p><strong>Address:</strong> Phnom Penh, Cambodia</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
