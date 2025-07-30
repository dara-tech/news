'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ShareComponent from './ShareComponent';

interface FloatingShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  showOnScroll?: boolean;
  scrollThreshold?: number;
}

export default function FloatingShareButton({
  url,
  title,
  description = '',
  image = '',
  className,
  showOnScroll = true,
  scrollThreshold = 300
}: FloatingShareButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!showOnScroll) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll, scrollThreshold]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 transition-all duration-300',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      className
    )}>
      <div className="relative">
        {/* Share Component */}
        <ShareComponent
          url={url}
          title={title}
          description={description}
          image={image}
          variant="floating"
          size="lg"
          showSocialCounts={true}
          showQRCode={true}
        />
        
        {/* Close Button (appears when share is open) */}
        {isShareOpen && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg"
            onClick={() => setIsShareOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 