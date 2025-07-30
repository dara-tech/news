'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Link,
  X,
} from 'lucide-react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaWhatsapp,
  FaTelegram,
  FaReddit,
  FaPinterest,
  FaEnvelope
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-mobile';

interface AdvancedShareComponentProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'minimal' | 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSocialCounts?: boolean;
  showQRCode?: boolean;
  showAnalytics?: boolean;
  platforms?: string[];
  onShare?: (platform: string) => void;
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  url: string;
  shareCount?: number;
  mobileUrl?: string;
}

export default function AdvancedShareComponent({
  url,
  title,
  description = '',
  variant = 'default',
  size = 'md',
  className,
  showSocialCounts = false,
  showQRCode = false,
  showAnalytics = false,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy'],
  onShare
}: AdvancedShareComponentProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [shareAnalytics, setShareAnalytics] = useState<Record<string, number>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const allSocialPlatforms: Record<string, SocialPlatform> = {
    facebook: {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      shareCount: 1250
    },
    twitter: {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      shareCount: 890
    },
    linkedin: {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      shareCount: 456
    },
    whatsapp: {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      mobileUrl: `whatsapp://send?text=${encodedTitle}%20${encodedUrl}`
    },
    telegram: {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    email: {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    },
    pinterest: {
      name: 'Pinterest',
      icon: FaPinterest,
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`
    },
    reddit: {
      name: 'Reddit',
      icon: FaReddit,
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    }
  };

  const selectedPlatforms = platforms
    .map(platform => allSocialPlatforms[platform])
    .filter(Boolean);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (platform: SocialPlatform) => {
    // Track share analytics
    setShareCount(prev => prev + 1);
    setShareAnalytics(prev => ({
      ...prev,
      [platform.name]: (prev[platform.name] || 0) + 1
    }));
    
    // Call onShare callback
    onShare?.(platform.name);
    
    // Handle mobile-specific sharing
    if (isMobile && platform.mobileUrl) {
      window.location.href = platform.mobileUrl;
    } else {
      // Open social platform in new window
      window.open(platform.url, '_blank', 'width=600,height=400');
    }
    
    // Close popover after a short delay
    setTimeout(() => setIsOpen(false), 500);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-2';
      case 'lg':
        return 'text-lg px-6 py-4';
      default:
        return 'text-base px-4 py-3';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-0';
      case 'floating':
        return 'fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300';
      case 'inline':
        return 'inline-flex items-center';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700';
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const ShareContent = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Share this article
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Social Platforms */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {selectedPlatforms.map((platform) => (
            <Tooltip key={platform.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSocialShare(platform)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 h-20 rounded-lg transition-all duration-200 hover:scale-105',
                    platform.color,
                    'text-white hover:text-white'
                  )}
                >
                  <platform.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{platform.name}</span>
                  {showSocialCounts && platform.shareCount && (
                    <span className="text-xs opacity-75 mt-1">
                      {platform.shareCount.toLocaleString()}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on {platform.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Or copy link
            </span>
            {showAnalytics && shareCount > 0 && (
              <span className="text-xs text-gray-500">
                {shareCount} shares
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <Link className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className={cn(
                    'transition-all duration-200',
                    isCopied && 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                  )}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? 'Copied!' : 'Copy link'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && Object.keys(shareAnalytics).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Analytics
            </h4>
            <div className="space-y-2">
              {Object.entries(shareAnalytics).map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{platform}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Section (if enabled) */}
        {showQRCode && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Scan to share
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size={size as 'sm' | 'lg' | 'default' | 'icon' | null | undefined}
              className={cn(
                'transition-all duration-200 group',
                getSizeClasses(),
                getVariantClasses(),
                className
              )}
            >
              <Share2 className={cn(
                'mr-2 transition-transform duration-200',
                size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
              {variant !== 'minimal' && 'Share'}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Share this article</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ShareContent />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size={size as 'sm' | 'lg' | 'default' | 'icon' | null | undefined}
              className={cn(
                'transition-all duration-200 group',
                getSizeClasses(),
                getVariantClasses(),
                className
              )}
            >
              <Share2 className={cn(
                'mr-2 transition-transform duration-200',
                size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
              {variant !== 'minimal' && 'Share'}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-80 p-0 border-0 shadow-xl"
            align="end"
          >
            <ShareContent />
          </PopoverContent>
        </Popover>
      )}
    </TooltipProvider>
  );
} 