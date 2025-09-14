/**
 * Frontend Settings Hook
 * Manages frontend configuration state and API interactions
 */

import { useState, useEffect, useCallback } from 'react';

interface FrontendSettings {
  adsense: {
    enabled: boolean;
    publisherId: string;
    autoAdsEnabled: boolean;
    adSlots: {
      header: string;
      sidebar: string;
      article: string;
      footer: string;
    };
    testMode: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoText: string;
    logoImage: string;
    favicon: string;
  };
  features: {
    commentsEnabled: boolean;
    likesEnabled: boolean;
    newsletterEnabled: boolean;
    searchEnabled: boolean;
    socialSharingEnabled: boolean;
    userRegistrationEnabled: boolean;
    multiLanguageEnabled: boolean;
    pwaPushNotifications: boolean;
  };
  seo: {
    siteName: string;
    siteDescription: string;
    keywords: string;
    ogImage: string;
    twitterHandle: string;
    googleAnalyticsId: string;
    googleSearchConsoleId: string;
  };
  performance: {
    cachingEnabled: boolean;
    imageOptimization: boolean;
    lazyLoadingEnabled: boolean;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
  };
  security: {
    rateLimitingEnabled: boolean;
    captchaEnabled: boolean;
    csrfProtectionEnabled: boolean;
    contentSecurityPolicy: boolean;
    httpsRedirectEnabled: boolean;
  };
}

export function useFrontendSettings() {
  const [settings, setSettings] = useState<FrontendSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/frontend-settings');
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        throw new Error(data.message || 'Failed to load settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);} finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: FrontendSettings) => {
    try {
      const response = await fetch('/api/admin/frontend-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: newSettings })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSettings(newSettings);
        return { success: true, message: 'Settings saved successfully' };
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';return { success: false, message: errorMessage };
    }
  }, []);

  const updateSetting = useCallback((path: string, value: any) => {
    if (!settings) return;
    
    const pathArray = path.split('.');
    const newSettings = JSON.parse(JSON.stringify(settings)); // Deep clone
    let current: any = newSettings;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setSettings(newSettings);
  }, [settings]);

  const testAdSense = useCallback(async (publisherId?: string) => {
    try {
      const response = await fetch('/api/admin/frontend-settings/test-adsense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publisherId: publisherId || settings?.adsense.publisherId 
        })
      });
      
      const result = await response.json();
      return result;
    } catch (err) {return { 
        success: false, 
        message: 'Failed to test AdSense configuration' 
      };
    }
  }, [settings]);

  const applyTheme = useCallback(async (theme: string, primaryColor: string) => {
    try {
      const response = await fetch('/api/admin/frontend-settings/apply-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, primaryColor })
      });
      
      const result = await response.json();
      if (result.success && settings) {
        updateSetting('appearance.theme', theme);
        updateSetting('appearance.primaryColor', primaryColor);
      }
      return result;
    } catch (err) {return { 
        success: false, 
        message: 'Failed to apply theme' 
      };
    }
  }, [settings, updateSetting]);

  const resetToDefaults = useCallback(() => {
    const defaultSettings: FrontendSettings = {
      adsense: {
        enabled: false,
        publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX',
        autoAdsEnabled: true,
        adSlots: {
          header: '1234567890',
          sidebar: '0987654321',
          article: '1122334455',
          footer: '5566778899'
        },
        testMode: true
      },
      appearance: {
        theme: 'auto',
        primaryColor: '#3b82f6',
        logoText: 'Razewire',
        logoImage: '',
        favicon: '/favicon.ico'
      },
      features: {
        commentsEnabled: true,
        likesEnabled: true,
        newsletterEnabled: true,
        searchEnabled: true,
        socialSharingEnabled: true,
        userRegistrationEnabled: true,
        multiLanguageEnabled: true,
        pwaPushNotifications: false
      },
      seo: {
        siteName: 'Razewire',
        siteDescription: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
        keywords: 'news, Cambodia, technology, business, sports, politics',
        ogImage: 'https://www.razewire.online/og-image.svg',
        twitterHandle: '@razewire',
        googleAnalyticsId: '',
        googleSearchConsoleId: 'google28105ddce768934a'
      },
      performance: {
        cachingEnabled: true,
        imageOptimization: true,
        lazyLoadingEnabled: true,
        compressionEnabled: true,
        cdnEnabled: false
      },
      security: {
        rateLimitingEnabled: true,
        captchaEnabled: false,
        csrfProtectionEnabled: true,
        contentSecurityPolicy: true,
        httpsRedirectEnabled: true
      }
    };
    
    setSettings(defaultSettings);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    saveSettings,
    loadSettings,
    testAdSense,
    applyTheme,
    resetToDefaults
  };
}
