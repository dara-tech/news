'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Globe, MapPin, Phone, Clock, Users, Newspaper, Target } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About Razewire
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your trusted source for news and information in Cambodia and Southeast Asia
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Razewire is dedicated to providing accurate, timely, and comprehensive news coverage 
              focused on Cambodia and the broader Southeast Asian region. We strive to deliver 
              high-quality journalism that informs, educates, and connects our readers with the 
              stories that matter most to their communities and the world.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              What We Cover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Local News</h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Cambodia politics and government</li>
                  <li>• Business and economy</li>
                  <li>• Technology and innovation</li>
                  <li>• Health and education</li>
                  <li>• Sports and entertainment</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Regional Coverage</h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• ASEAN developments</li>
                  <li>• Southeast Asian relations</li>
                  <li>• Regional business news</li>
                  <li>• Cross-border initiatives</li>
                  <li>• International partnerships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Razewire is powered by a dedicated team of journalists, editors, and technology 
              professionals committed to delivering the highest quality news experience. Our 
              team combines local expertise with international standards to bring you the most 
              relevant and accurate information.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Editorial Team</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Experienced journalists and editors with deep knowledge of Cambodia and 
                  Southeast Asian affairs, ensuring accurate and balanced reporting.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technology Team</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Skilled developers and designers creating a modern, user-friendly platform 
                  that delivers news efficiently across all devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accuracy</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We are committed to factual, verified reporting and strive to correct any 
                  errors promptly and transparently.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Independence</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our editorial decisions are made independently, free from external influence 
                  or commercial pressure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe in open, honest communication with our readers and are transparent 
                  about our sources and methods.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We serve our community by providing information that helps readers make 
                  informed decisions about their lives and society.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">info@razewire.online</p>
                    <p className="text-gray-600 dark:text-gray-300">support@razewire.online</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Website</h3>
                    <p className="text-gray-600 dark:text-gray-300">https://www.razewire.online</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
                    <p className="text-gray-600 dark:text-gray-300">Phnom Penh, Cambodia</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-300">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600 dark:text-gray-300">Saturday: 9:00 AM - 3:00 PM</p>
                    <p className="text-gray-600 dark:text-gray-300">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+855 (0) XX XXX XXX</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy & Legal</h3>
                <div className="flex flex-wrap gap-4 text-blue-600 dark:text-blue-400">
                  <a href="/privacy" className="hover:underline">Privacy Policy</a>
                  <a href="/terms" className="hover:underline">Terms of Service</a>
                  <a href="/cookie-policy" className="hover:underline">Cookie Policy</a>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
