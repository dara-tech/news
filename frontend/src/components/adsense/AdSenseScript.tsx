'use client';

/**
 * Google AdSense Integration Component
 * Handles AdSense script loading and ad display
 * Simplified version without page-level ads to avoid conflicts
 */

import Script from 'next/script';

// Global flag to ensure script is only loaded once
declare global {
  interface Window {
    __adsenseScriptLoaded?: boolean;
  }
}

interface AdSenseScriptProps {
  adSenseId?: string;
}

export default function AdSenseScript({ adSenseId }: AdSenseScriptProps) {
  const ADSENSE_ID = adSenseId || process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-8955989254579960';

  // Don't load if already loaded
  if (typeof window !== 'undefined' && window.__adsenseScriptLoaded) {
    return null;
  }

  return (
    <>
      {/* Google AdSense Script - Simplified without page-level ads */}
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.__adsenseScriptLoaded = true;
          }
        }}
        onError={(error) => {}}
      />
    </>
  );
}

