'use client';

/**
 * Google AdSense Integration Component
 * Handles AdSense script loading and ad display
 */

import { useEffect } from 'react';
import Script from 'next/script';

interface AdSenseScriptProps {
  adSenseId?: string;
}

export default function AdSenseScript({ adSenseId }: AdSenseScriptProps) {
  const ADSENSE_ID = adSenseId || process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-XXXXXXXXXXXXXXXXX';

  useEffect(() => {
    // Initialize AdSense when component mounts
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    }
  }, []);

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('AdSense script loaded successfully');
        }}
        onError={(error) => {
          console.error('AdSense script failed to load:', error);
        }}
      />
      
      {/* AdSense Auto Ads (Recommended for new publishers) */}
      <Script
        id="adsense-auto-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${ADSENSE_ID}",
              enable_page_level_ads: true
            });
          `
        }}
      />
    </>
  );
}

// Declare global adsbygoogle for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
