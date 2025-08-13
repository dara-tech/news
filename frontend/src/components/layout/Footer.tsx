'use client'

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Rss,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import api from "@/lib/api";

interface LogoSettings {
  logoUrl?: string;
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

interface SocialMediaLink {
  platform: string;
  url: string;
  isActive: boolean;
  displayName?: string;
  icon?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  website: string;
}

interface SocialMediaSettings {
  socialLinks: SocialMediaLink[];
  contactInfo: ContactInfo;
  socialSharingEnabled: boolean;
  socialLoginEnabled: boolean;
  socialAnalyticsEnabled: boolean;
  autoPostEnabled: boolean;
  socialPreviewEnabled: boolean;
}

interface FooterSettings {
  companyName?: string;
  companyDescription?: string;
  contactEmail?: string;
  newsletterEnabled?: boolean;
}

const platformIconMap: { [key: string]: any } = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
  website: Globe,
  rss: Rss,
};

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logoDisplayMode: 'text',
    logoText: 'Razewire',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'Razewire',
    companyDescription: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    contactEmail: 'contact@razewire.online',
    newsletterEnabled: true,
  });
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>({
    socialLinks: [],
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      website: '',
    },
    socialSharingEnabled: true,
    socialLoginEnabled: false,
    socialAnalyticsEnabled: false,
    autoPostEnabled: false,
    socialPreviewEnabled: true,
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch logo settings (public endpoint)
        const logoResponse = await api.get('/settings/public/logo');
        if (logoResponse.data.success && logoResponse.data.settings) {
          setLogoSettings(prev => ({ ...prev, ...logoResponse.data.settings }));
          setImageError(false);
        }

        // Fetch footer/company settings (public endpoint)
        const footerResponse = await api.get('/settings/public/footer');
        if (footerResponse.data.success && footerResponse.data.settings) {
          setFooterSettings(prev => ({ ...prev, ...footerResponse.data.settings }));
        }

        // Fetch social media settings (public endpoint)
        const socialResponse = await api.get('/settings/public/social-media');
        if (socialResponse.data.success && socialResponse.data.settings) {
          setSocialMediaSettings(prev => ({ ...prev, ...socialResponse.data.settings }));
        }
      } catch (error) {
        // Silently use default settings if API calls fail
        console.log('Using default footer settings');
      }
    };

    fetchSettings();
  }, []);

  const activeSocialLinks = (socialMediaSettings.socialLinks || [])
    .filter(link => link.isActive)
    .map(link => ({
      ...link,
      url: link.url && link.url.trim() ? link.url : '#',
    }));

  const mainLinks = [
    { name: 'Home', href: '/' },
    { name: 'Technology', href: '/category/technology' },
    { name: 'Business', href: '/category/business' },
    { name: 'Sports', href: '/category/sports' },
  ];

  const legalLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const renderLogoContent = () => {
    // If we have an image logo and URL, and no image error, display it
    if (logoSettings.logoDisplayMode === 'image' && logoSettings.logoUrl && !imageError) {
      return (
        <img
          src={logoSettings.logoUrl}
          alt="Logo"
          className="h-6 w-auto object-contain"
          onError={() => {
            setImageError(true);
          }}
        />
      );
    }

    // Display text logo (fallback or default)
    return (
      <span
        style={{
          color: logoSettings.logoTextColor,
          fontSize: `${(logoSettings.logoFontSize || 24) * 0.75}px`, // Smaller for footer
        }}
        className="font-bold"
      >
        {logoSettings.logoText || footerSettings.companyName || 'NewsApp'}
      </span>
    );
  };

  const renderSocialIcon = (link: SocialMediaLink) => {
    const IconComponent = platformIconMap[link.platform];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6" />;
    }
    return <Globe className="h-6 w-6" />;
  };

  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About & Newsletter */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {renderLogoContent()}
            </div>
            <p className="text-muted-foreground">
              {footerSettings.companyDescription}
            </p>
            {footerSettings.newsletterEnabled && (
              <div>
                <p className="font-medium mb-2">Subscribe to our newsletter</p>
                <form className="flex gap-2">
                  <Input type="email" placeholder="Enter your email" className="flex-grow" />
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            )}
          </div>

          {/* Site Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Sitemap</h4>
            <ul className="space-y-2">
              {mainLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {socialMediaSettings.contactInfo.email && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{socialMediaSettings.contactInfo.email}</span>
                </li>
              )}
              {socialMediaSettings.contactInfo.phone && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{socialMediaSettings.contactInfo.phone}</span>
                </li>
              )}
              {socialMediaSettings.contactInfo.address && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{socialMediaSettings.contactInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
            <div className="flex items-center gap-4">
              {activeSocialLinks.map((link, index) => (
                <Link 
                  href={link.url} 
                  key={index} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {renderSocialIcon(link)}
                  <span className="sr-only">{link.displayName || link.platform}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} {footerSettings.companyName || 'Razewire'}. All rights reserved. Built with Next.js & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;