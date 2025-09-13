'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ArticleAnalyticsProps {
  articleId: string;
  articleTitle: string;
  locale: string;
}

interface ReadingSession {
  startTime: number;
  lastActiveTime: number;
  scrollDepth: number;
  timeSpent: number;
  sectionsRead: string[];
  interactions: number;
}

export default function ArticleAnalytics({ articleId, articleTitle, locale }: ArticleAnalyticsProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<ReadingSession>({
    startTime: Date.now(),
    lastActiveTime: Date.now(),
    scrollDepth: 0,
    timeSpent: 0,
    sectionsRead: [],
    interactions: 0
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Track reading time
  useEffect(() => {
    const startTime = Date.now();
    
    const updateTimeSpent = () => {
      if (isActiveRef.current) {
        setSession(prev => ({
          ...prev,
          timeSpent: Date.now() - startTime,
          lastActiveTime: Date.now()
        }));
      }
    };

    intervalRef.current = setInterval(updateTimeSpent, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.min(100, (scrollTop / docHeight) * 100);
      
      setSession(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth)
      }));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      isActiveRef.current = true;
      setSession(prev => ({
        ...prev,
        lastActiveTime: Date.now(),
        interactions: prev.interactions + 1
      }));
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        isActiveRef.current = true;
        setSession(prev => ({
          ...prev,
          lastActiveTime: Date.now()
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Send analytics data
  useEffect(() => {
    const sendAnalytics = async () => {
      if (!user) return;

      try {
        await fetch('/api/recommendations/track-behavior', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'article_reading',
            data: {
              articleId,
              articleTitle,
              locale,
              session: {
                ...session,
                timeSpent: Math.floor(session.timeSpent / 1000), // Convert to seconds
                timestamp: new Date().toISOString()
              }
            }
          })
        });
      } catch (error) {
        console.error('Error sending analytics:', error);
      }
    };

    // Send analytics every 30 seconds
    const analyticsInterval = setInterval(sendAnalytics, 30000);
    
    // Send final analytics on unmount
    return () => {
      clearInterval(analyticsInterval);
      sendAnalytics(); // Send final data
    };
  }, [user, articleId, articleTitle, locale, session]);

  // Track article view
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/recommendations/track-behavior', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'article_view',
            data: {
              articleId,
              articleTitle,
              locale,
              timestamp: new Date().toISOString(),
              referrer: document.referrer,
              userAgent: navigator.userAgent
            }
          })
        });
      } catch (error) {
        console.error('Error tracking article view:', error);
      }
    };

    trackView();
  }, [articleId, articleTitle, locale]);

  // Track reading completion
  useEffect(() => {
    if (session.scrollDepth >= 90 && session.timeSpent > 30000) { // 90% scroll and 30+ seconds
      const trackCompletion = async () => {
        try {
          await fetch('/api/recommendations/track-behavior', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'article_completion',
              data: {
                articleId,
                articleTitle,
                locale,
                completionTime: session.timeSpent,
                scrollDepth: session.scrollDepth,
                timestamp: new Date().toISOString()
              }
            })
          });
        } catch (error) {
          console.error('Error tracking completion:', error);
        }
      };

      trackCompletion();
    }
  }, [session.scrollDepth, session.timeSpent, articleId, articleTitle, locale]);

  return null; // This component doesn't render anything
}
