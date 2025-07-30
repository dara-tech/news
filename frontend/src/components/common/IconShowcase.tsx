'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FaFacebook, 
  FaLinkedin, 
  FaWhatsapp,
  FaTelegram,
  FaReddit,
  FaPinterest,
  FaEnvelope,
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaTiktok,
  FaSnapchat,
  FaSpotify
} from 'react-icons/fa';
import { 
  SiX, 
  SiThreads,
  SiMastodon,
  SiBluesky
} from 'react-icons/si';

export default function IconShowcase() {
  const socialIcons = [
    { name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { name: 'Twitter/X', icon: SiX, color: 'text-black dark:text-white' },
    { name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700' },
    { name: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-600' },
    { name: 'Telegram', icon: FaTelegram, color: 'text-blue-500' },
    { name: 'Reddit', icon: FaReddit, color: 'text-orange-600' },
    { name: 'Pinterest', icon: FaPinterest, color: 'text-red-600' },
    { name: 'Email', icon: FaEnvelope, color: 'text-gray-600' },
    { name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
    { name: 'YouTube', icon: FaYoutube, color: 'text-red-600' },
    { name: 'Discord', icon: FaDiscord, color: 'text-indigo-600' },
    { name: 'TikTok', icon: FaTiktok, color: 'text-black dark:text-white' },
    { name: 'Snapchat', icon: FaSnapchat, color: 'text-yellow-500' },
    { name: 'Spotify', icon: FaSpotify, color: 'text-green-500' },
    { name: 'Threads', icon: SiThreads, color: 'text-black dark:text-white' },
    { name: 'Mastodon', icon: SiMastodon, color: 'text-purple-600' },
    { name: 'Bluesky', icon: SiBluesky, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          React Icons Showcase
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          All the social media icons used in our share components
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Social Media Icons
            <Badge variant="secondary">React Icons</Badge>
          </CardTitle>
          <CardDescription>
            Icons from react-icons library used in share components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {socialIcons.map(({ name, icon: Icon, color }) => (
              <div
                key={name}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Icon className={`w-8 h-8 mb-2 ${color}`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Icon Libraries Used</CardTitle>
          <CardDescription>
            Different icon libraries available in react-icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Font Awesome (react-icons/fa)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used for most social media icons: Facebook, Twitter, LinkedIn, WhatsApp, etc.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Simple Icons (react-icons/si)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used for newer platforms: X (Twitter), Threads, Mastodon, Bluesky
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Lucide React
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used for UI icons: Share, Copy, Check, Link, X (close)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits of React Icons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Advantages
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Huge icon library (10,000+ icons)</li>
                <li>• Multiple icon sets in one package</li>
                <li>• Tree-shaking support</li>
                <li>• TypeScript support</li>
                <li>• Consistent API across all icons</li>
                <li>• Small bundle size</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Icon Sets Available
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Font Awesome (fa)</li>
                <li>• Simple Icons (si)</li>
                <li>• Material Design (md)</li>
                <li>• Feather Icons (fi)</li>
                <li>• Heroicons (hi)</li>
                <li>• And many more...</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 