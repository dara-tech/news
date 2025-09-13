'use client';

/**
 * Google AdSense Ad Component
 * Displays individual AdSense ads
 */

import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

export default function AdSenseAd({ 
  adSlot, 
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  fullWidthResponsive = true
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-8955989254579960';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
      try {
        // Only push if the ad hasn't been initialized
        if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error('AdSense ad initialization error:', error);
      }
    }
  }, [adSlot]); // Add adSlot as dependency to prevent re-initialization

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Common ad slot components for easy use
export function HeaderAd() {
  return (
    <AdSenseAd
      adSlot="1234567890"
      adFormat="horizontal"
      className="mb-4"
      adStyle={{ display: 'block', height: '90px' }}
    />
  );
}

export function SidebarAd() {
  return (
    <AdSenseAd
      adSlot="0987654321"
      adFormat="vertical"
      className="mb-4"
      adStyle={{ display: 'block', width: '300px', height: '250px' }}
    />
  );
}

export function ArticleAd() {
  return (
    <AdSenseAd
      adSlot="1122334455"
      adFormat="rectangle"
      className="my-6"
      adStyle={{ display: 'block', textAlign: 'center' }}
    />
  );
}

export function FooterAd() {
  return (
    <AdSenseAd
      adSlot="5566778899"
      adFormat="horizontal"
      className="mt-4"
      adStyle={{ display: 'block', height: '90px' }}
    />
  );
}
