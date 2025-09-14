'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationEvent {
  path: string;
  timestamp: number;
  referrer?: string;
  userAgent?: string;
}

const NavigationAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track navigation events
    const trackNavigation = () => {
      const event: NavigationEvent = {
        path: pathname,
        timestamp: Date.now(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      };

      // Store in localStorage for analytics
      const existingData = localStorage.getItem('navigationAnalytics');
      const analyticsData = existingData ? JSON.parse(existingData) : [];
      
      // Keep only last 100 navigation events
      const updatedData = [...analyticsData, event].slice(-100);
      localStorage.setItem('navigationAnalytics', JSON.stringify(updatedData));

      // Track popular navigation patterns
      const popularPaths = updatedData.reduce((acc: Record<string, number>, item: NavigationEvent) => {
        acc[item.path] = (acc[item.path] || 0) + 1;
        return acc;
      }, {});

      // Store popular paths for smart navigation
      localStorage.setItem('popularPaths', JSON.stringify(popularPaths));
    };

    trackNavigation();
  }, [pathname]);

  // Track user interaction patterns
  useEffect(() => {
    const trackInteractions = () => {
      const startTime = Date.now();
      
      const trackTimeOnPage = () => {
        const timeSpent = Date.now() - startTime;
        const pageData = {
          path: pathname,
          timeSpent,
          timestamp: Date.now(),
        };

        const existingData = localStorage.getItem('pageAnalytics');
        const analyticsData = existingData ? JSON.parse(existingData) : [];
        
        const updatedData = [...analyticsData, pageData].slice(-50);
        localStorage.setItem('pageAnalytics', JSON.stringify(updatedData));
      };

      // Track time on page when user leaves
      const handleBeforeUnload = () => {
        trackTimeOnPage();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        trackTimeOnPage();
      };
    };

    const cleanup = trackInteractions();
    return cleanup;
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default NavigationAnalytics;
