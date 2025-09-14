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
  MapPin,
  Send
} from 'lucide-react';
import Logo from "@/components/layout/Logo";
import api from "@/lib/api";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch logo settings (public endpoint)
        const logoResponse = await api.get('/settings/public/logo');
        if (logoResponse.data.success && logoResponse.data.settings) {
          setLogoSettings(prev => ({ ...prev, ...logoResponse.data.settings }));
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

  const renderSocialIcon = (link: SocialMediaLink) => {
    const IconComponent = platformIconMap[link.platform];
    
    if (IconComponent) {
      return (
        <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group">
          <IconComponent className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group">
        <Globe className="h-5 w-5 text-foreground transition-transform group-hover:scale-110" />
      </div>
    );
  };

  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* About & Newsletter */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <Logo lang="en" />
            </div>
            <p className="text-muted-foreground/80 leading-relaxed max-w-md">
              {footerSettings.companyDescription}
            </p>
            {footerSettings.newsletterEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Stay Updated</h4>
                  <p className="text-sm text-muted-foreground/70">
                    Get the latest news and updates delivered to your inbox.
                  </p>
                </div>
                <form className="flex gap-2 max-w-sm">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 h-10 bg-background/50 border-border/40 focus-visible:border-border transition-colors" 
                  />
                  <Button type="submit" size="sm" className="px-4 h-10 gap-2">
                    <Send className="h-4 w-4" />
                    Subscribe
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Site Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground/70 hover:text-foreground text-sm hover:translate-x-1 transform transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground/70 hover:text-foreground text-sm hover:translate-x-1 transform transition-all duration-200 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              {socialMediaSettings.contactInfo.email && (
                <div className="flex items-center gap-3 text-muted-foreground/70 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground/50" />
                  <span>{socialMediaSettings.contactInfo.email}</span>
                </div>
              )}
              {socialMediaSettings.contactInfo.phone && (
                <div className="flex items-center gap-3 text-muted-foreground/70 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground/50" />
                  <span>{socialMediaSettings.contactInfo.phone}</span>
                </div>
              )}
              {socialMediaSettings.contactInfo.address && (
                <div className="flex items-center gap-3 text-muted-foreground/70 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground/50" />
                  <span>{socialMediaSettings.contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Social Media & Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Social Links */}
            {activeSocialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground/60 mr-2">Follow us:</span>
                {activeSocialLinks.map((link, index) => (
                  <Link 
                    href={link.url} 
                    key={index} 
                    className="text-muted-foreground/60 hover:text-foreground transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderSocialIcon(link)}
                    <span className="sr-only">{link.displayName || link.platform}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-muted-foreground/60 text-sm">
                &copy; {currentYear} {footerSettings.companyName || 'Razewire'}. All rights reserved.
              </p>
              <p className="text-muted-foreground/40 text-xs mt-1">
                Built with Next.js & Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;