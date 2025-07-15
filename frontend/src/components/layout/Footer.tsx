import { FC } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Rss } from 'lucide-react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'RSS', icon: Rss, href: '#' },
  ];

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


  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About & Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-foreground">NewsApp</h3>
            <p className="text-muted-foreground">
              Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.
            </p>
            <div>
                <p className="font-medium mb-2">Subscribe to our newsletter</p>
                <form className="flex gap-2">
                    <Input type="email" placeholder="Enter your email" className="flex-grow" />
                    <Button type="submit">Subscribe</Button>
                </form>
            </div>
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

          {/* Legal & Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
             <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                    <Link href={social.href} key={social.name} className="text-muted-foreground hover:text-primary transition-colors">
                        <social.icon className="h-6 w-6" />
                        <span className="sr-only">{social.name}</span>
                    </Link>
                ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          <p>&copy; {currentYear} NewsApp. All rights reserved. Built with Next.js & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;