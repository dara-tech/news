'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Home, Search, Star, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FloatingNavButtonProps {
  lang: string;
}

const FloatingNavButton = memo(({ lang }: FloatingNavButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Hide/show based on scroll position
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const quickNavItems = [
    { href: `/${lang}`, label: 'Home', icon: Home },
    { href: `/${lang}/news`, label: 'News', icon: FileText },
    { href: `/${lang}/recommendations`, label: 'Recommendations', icon: Star },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 lg:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-2 min-w-[180px] sm:min-w-[200px]"
          >
            <div className="space-y-2">
              {quickNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setIsOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
          isOpen
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/95 backdrop-blur-xl border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground'
        }`}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Plus className="h-5 w-5 sm:h-6 sm:w-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
});

FloatingNavButton.displayName = 'FloatingNavButton';

export default FloatingNavButton;
