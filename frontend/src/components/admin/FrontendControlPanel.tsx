'use client';

/**
 * Frontend Control Panel
 * Comprehensive frontend management system for admin dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings, Palette, Code, Globe, Zap, Eye, 
  Monitor, Smartphone, Tablet, RefreshCw,
  Save, Upload, Download, TestTube, 
  DollarSign, BarChart3, Shield, Bell
} from 'lucide-react';
import OpenGraphPreview from './OpenGraphPreview';
import LinkPreview from './LinkPreview';

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
  opengraph: {
    enabled: boolean;
    defaultTitle: string;
    defaultDescription: string;
    defaultImage: string;
    imageWidth: number;
    imageHeight: number;
    siteName: string;
    locale: string;
    type: string;
    twitterCard: string;
    twitterSite: string;
    twitterCreator: string;
    facebookAppId: string;
    customTags: string;
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

const FrontendControlPanel: React.FC = () => {
  const [settings, setSettings] = useState<FrontendSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('adsense');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/frontend-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        // Load default settings if API fails
        setSettings(getDefaultSettings());
      }
    } catch (error) {setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/admin/frontend-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        alert('✅ Settings saved successfully!');
      } else {
        alert('❌ Failed to save settings');
      }
    } catch (error) {alert('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testAdSense = async () => {
    try {
      const response = await fetch('/api/admin/frontend-settings/test-adsense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId: settings?.adsense.publisherId })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('✅ AdSense configuration is valid!');
      } else {
        alert('❌ AdSense configuration error: ' + result.message);
      }
    } catch (error) {
      alert('❌ Failed to test AdSense configuration');
    }
  };

  const exportSettings = () => {
    if (!settings) return;
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'razewire-frontend-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        alert('✅ Settings imported successfully!');
      } catch (error) {
        alert('❌ Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  const getDefaultSettings = (): FrontendSettings => ({
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
    opengraph: {
      enabled: true,
      defaultTitle: 'Razewire - Latest News & Updates',
      defaultDescription: 'Stay informed with the latest news in technology, business, and sports from Cambodia and around the world.',
      defaultImage: 'https://www.razewire.online/og-image.svg',
      imageWidth: 1200,
      imageHeight: 630,
      siteName: 'Razewire',
      locale: 'en_US',
      type: 'website',
      twitterCard: 'summary_large_image',
      twitterSite: '@razewire',
      twitterCreator: '@razewire',
      facebookAppId: '',
      customTags: ''
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
  });

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;
    
    const pathArray = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    // Ensure opengraph object exists
    if (pathArray[0] === 'opengraph' && !newSettings.opengraph) {
      newSettings.opengraph = {
        enabled: false,
        defaultTitle: 'Razewire - Latest News & Updates',
        defaultDescription: 'Stay informed with the latest news in technology, business, and sports from Cambodia and around the world.',
        defaultImage: 'https://www.razewire.online/og-image.svg',
        imageWidth: 1200,
        imageHeight: 630,
        siteName: 'Razewire',
        locale: 'en_US',
        type: 'website',
        twitterCard: 'summary_large_image',
        twitterSite: '@razewire',
        twitterCreator: '@razewire',
        facebookAppId: '',
        customTags: '',
      };
    }
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading frontend controls...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load frontend settings. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Frontend Control Panel</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your site's appearance, features, and monetization
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="file"
            accept=".json"
            onChange={importSettings}
            style={{ display: 'none' }}
            id="import-settings"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Control Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="opengraph">OpenGraph</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* AdSense Tab */}
        <TabsContent value="adsense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Google AdSense Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="adsense-enabled">Enable AdSense</Label>
                  <p className="text-sm text-gray-600">Turn on/off Google AdSense ads</p>
                </div>
                <Switch
                  id="adsense-enabled"
                  checked={settings.adsense.enabled}
                  onCheckedChange={(checked) => updateSetting('adsense.enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publisher-id">Publisher ID</Label>
                  <Input
                    id="publisher-id"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXXX"
                    value={settings.adsense.publisherId}
                    onChange={(e) => updateSetting('adsense.publisherId', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Test Mode</Label>
                    <p className="text-xs text-gray-600">Use test ads</p>
                  </div>
                  <Switch
                    checked={settings.adsense.testMode}
                    onCheckedChange={(checked) => updateSetting('adsense.testMode', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="header-slot">Header Ad Slot</Label>
                  <Input
                    id="header-slot"
                    placeholder="1234567890"
                    value={settings.adsense.adSlots.header}
                    onChange={(e) => updateSetting('adsense.adSlots.header', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sidebar-slot">Sidebar Ad Slot</Label>
                  <Input
                    id="sidebar-slot"
                    placeholder="0987654321"
                    value={settings.adsense.adSlots.sidebar}
                    onChange={(e) => updateSetting('adsense.adSlots.sidebar', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="article-slot">Article Ad Slot</Label>
                  <Input
                    id="article-slot"
                    placeholder="1122334455"
                    value={settings.adsense.adSlots.article}
                    onChange={(e) => updateSetting('adsense.adSlots.article', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="footer-slot">Footer Ad Slot</Label>
                  <Input
                    id="footer-slot"
                    placeholder="5566778899"
                    value={settings.adsense.adSlots.footer}
                    onChange={(e) => updateSetting('adsense.adSlots.footer', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testAdSense} variant="outline" className="flex-1">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test AdSense Config
                </Button>
                <Button 
                  onClick={() => window.open('https://www.google.com/adsense/', '_blank')}
                  variant="outline" 
                  className="flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  AdSense Dashboard
                </Button>
              </div>

              {settings.adsense.enabled && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    AdSense is enabled. Revenue tracking available in Enterprise Analytics.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Site Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme-select">Theme</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSetting('appearance.theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance.primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance.primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo-text">Logo Text</Label>
                  <Input
                    id="logo-text"
                    value={settings.appearance.logoText}
                    onChange={(e) => updateSetting('appearance.logoText', e.target.value)}
                    placeholder="Razewire"
                  />
                </div>
                
                <div>
                  <Label htmlFor="logo-image">Logo Image URL</Label>
                  <Input
                    id="logo-image"
                    value={settings.appearance.logoImage}
                    onChange={(e) => updateSetting('appearance.logoImage', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={settings.appearance.favicon}
                  onChange={(e) => updateSetting('appearance.favicon', e.target.value)}
                  placeholder="/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Site Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(settings.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {getFeatureDescription(key)}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateSetting(`features.${key}`, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                SEO & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings.seo.siteName}
                    onChange={(e) => updateSetting('seo.siteName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="twitter-handle">Twitter Handle</Label>
                  <Input
                    id="twitter-handle"
                    value={settings.seo.twitterHandle}
                    onChange={(e) => updateSetting('seo.twitterHandle', e.target.value)}
                    placeholder="@razewire"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={settings.seo.siteDescription}
                  onChange={(e) => updateSetting('seo.siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={settings.seo.keywords}
                  onChange={(e) => updateSetting('seo.keywords', e.target.value)}
                  placeholder="news, Cambodia, technology, business"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ga-id">Google Analytics ID</Label>
                  <Input
                    id="ga-id"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => updateSetting('seo.googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gsc-id">Search Console ID</Label>
                  <Input
                    id="gsc-id"
                    value={settings.seo.googleSearchConsoleId}
                    onChange={(e) => updateSetting('seo.googleSearchConsoleId', e.target.value)}
                    placeholder="google28105ddce768934a"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OpenGraph Tab */}
        <TabsContent value="opengraph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                OpenGraph & Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="opengraph-enabled">Enable OpenGraph</Label>
                  <p className="text-sm text-gray-600">Enable OpenGraph meta tags for social media sharing</p>
                </div>
                <Switch
                  id="opengraph-enabled"
                  checked={settings.opengraph?.enabled || false}
                  onCheckedChange={(checked) => updateSetting('opengraph.enabled', checked)}
                />
              </div>

              {settings.opengraph?.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="og-default-title">Default Title</Label>
                      <Input
                        id="og-default-title"
                        value={settings.opengraph?.defaultTitle || ''}
                        onChange={(e) => updateSetting('opengraph.defaultTitle', e.target.value)}
                        placeholder="Razewire - Latest News & Updates"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="og-site-name">Site Name</Label>
                      <Input
                        id="og-site-name"
                        value={settings.opengraph?.siteName || ''}
                        onChange={(e) => updateSetting('opengraph.siteName', e.target.value)}
                        placeholder="Razewire"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="og-default-description">Default Description</Label>
                    <Textarea
                      id="og-default-description"
                      value={settings.opengraph?.defaultDescription || ''}
                      onChange={(e) => updateSetting('opengraph.defaultDescription', e.target.value)}
                      rows={3}
                      placeholder="Stay informed with the latest news..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="og-default-image">Default Image URL</Label>
                      <div className="space-y-2">
                        <Input
                          id="og-default-image"
                          value={settings.opengraph?.defaultImage || ''}
                          onChange={(e) => updateSetting('opengraph.defaultImage', e.target.value)}
                          placeholder="https://www.razewire.online/og-image.svg"
                        />
                        <LinkPreview
                          onLinkSelect={(linkData) => {
                            updateSetting('opengraph.defaultImage', linkData.image);
                            updateSetting('opengraph.defaultTitle', linkData.title);
                            updateSetting('opengraph.defaultDescription', linkData.description);
                          }}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="og-locale">Locale</Label>
                      <Select
                        value={settings.opengraph?.locale || 'en_US'}
                        onValueChange={(value) => updateSetting('opengraph.locale', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_US">English (US)</SelectItem>
                          <SelectItem value="km_KH">Khmer (Cambodia)</SelectItem>
                          <SelectItem value="en_GB">English (UK)</SelectItem>
                          <SelectItem value="fr_FR">French</SelectItem>
                          <SelectItem value="de_DE">German</SelectItem>
                          <SelectItem value="es_ES">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="og-type">Content Type</Label>
                      <Select
                        value={settings.opengraph?.type || 'website'}
                        onValueChange={(value) => updateSetting('opengraph.type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="og-facebook-app-id">Facebook App ID</Label>
                      <Input
                        id="og-facebook-app-id"
                        value={settings.opengraph?.facebookAppId || ''}
                        onChange={(e) => updateSetting('opengraph.facebookAppId', e.target.value)}
                        placeholder="123456789012345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="og-image-width">Image Width</Label>
                      <Input
                        id="og-image-width"
                        type="number"
                        value={settings.opengraph?.imageWidth || 1200}
                        onChange={(e) => updateSetting('opengraph.imageWidth', parseInt(e.target.value) || 1200)}
                        placeholder="1200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="og-image-height">Image Height</Label>
                      <Input
                        id="og-image-height"
                        type="number"
                        value={settings.opengraph?.imageHeight || 630}
                        onChange={(e) => updateSetting('opengraph.imageHeight', parseInt(e.target.value) || 630)}
                        placeholder="630"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="og-twitter-card">Twitter Card Type</Label>
                      <Select
                        value={settings.opengraph?.twitterCard || 'summary_large_image'}
                        onValueChange={(value) => updateSetting('opengraph.twitterCard', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary</SelectItem>
                          <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                          <SelectItem value="player">Player</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="og-twitter-site">Twitter Site Handle</Label>
                      <Input
                        id="og-twitter-site"
                        value={settings.opengraph?.twitterSite || ''}
                        onChange={(e) => updateSetting('opengraph.twitterSite', e.target.value)}
                        placeholder="@razewire"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="og-twitter-creator">Twitter Creator Handle</Label>
                      <Input
                        id="og-twitter-creator"
                        value={settings.opengraph?.twitterCreator || ''}
                        onChange={(e) => updateSetting('opengraph.twitterCreator', e.target.value)}
                        placeholder="@razewire"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="og-custom-tags">Custom Meta Tags</Label>
                    <Textarea
                      id="og-custom-tags"
                      value={settings.opengraph?.customTags || ''}
                      onChange={(e) => updateSetting('opengraph.customTags', e.target.value)}
                      rows={3}
                      placeholder="<!-- Custom meta tags here -->"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Add custom HTML meta tags (one per line)
                    </p>
                  </div>

                  {/* OpenGraph Preview */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Social Media Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <OpenGraphPreview
                        title={settings.opengraph?.defaultTitle || 'Razewire - Latest News & Updates'}
                        description={settings.opengraph?.defaultDescription || 'Stay informed with the latest news...'}
                        image={settings.opengraph?.defaultImage || 'https://www.razewire.online/og-image.svg'}
                        siteName={settings.opengraph?.siteName || 'Razewire'}
                        url="https://www.razewire.online/news/sample-article"
                        type="facebook"
                      />
                      <OpenGraphPreview
                        title={settings.opengraph?.defaultTitle || 'Razewire - Latest News & Updates'}
                        description={settings.opengraph?.defaultDescription || 'Stay informed with the latest news...'}
                        image={settings.opengraph?.defaultImage || 'https://www.razewire.online/og-image.svg'}
                        siteName={settings.opengraph?.siteName || 'Razewire'}
                        url="https://www.razewire.online/news/sample-article"
                        type="twitter"
                      />
                      <OpenGraphPreview
                        title={settings.opengraph?.defaultTitle || 'Razewire - Latest News & Updates'}
                        description={settings.opengraph?.defaultDescription || 'Stay informed with the latest news...'}
                        image={settings.opengraph?.defaultImage || 'https://www.razewire.online/og-image.svg'}
                        siteName={settings.opengraph?.siteName || 'Razewire'}
                        url="https://www.razewire.online/news/sample-article"
                        type="linkedin"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(settings.performance).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {getPerformanceDescription(key)}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateSetting(`performance.${key}`, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(settings.security).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {getSecurityDescription(key)}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => updateSetting(`security.${key}`, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Live Preview ({previewMode})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className={`mx-auto transition-all duration-300 ${
              previewMode === 'mobile' ? 'max-w-sm' :
              previewMode === 'tablet' ? 'max-w-2xl' : 'max-w-full'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.appearance.primaryColor }}
                    >
                      R
                    </div>
                    <span className="font-bold">{settings.appearance.logoText}</span>
                  </div>
                  <Badge variant={settings.appearance.theme === 'dark' ? 'secondary' : 'default'}>
                    {settings.appearance.theme}
                  </Badge>
                </div>
                
                {settings.adsense.enabled && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-4 text-center text-sm">
                    📢 AdSense Ad Space (Header)
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Sample News Article</h3>
                  <p className="text-sm text-gray-600">
                    This is how your news articles will appear with the current settings.
                  </p>
                  
                  {settings.adsense.enabled && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-2 my-2 text-center text-xs">
                      📢 AdSense Ad Space (Article)
                    </div>
                  )}
                  
                  <div className="flex gap-2 text-xs">
                    {settings.features.likesEnabled && <Badge variant="outline">❤️ Likes</Badge>}
                    {settings.features.commentsEnabled && <Badge variant="outline">💬 Comments</Badge>}
                    {settings.features.socialSharingEnabled && <Badge variant="outline">🔗 Share</Badge>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function getFeatureDescription(key: string): string {
  const descriptions: Record<string, string> = {
    commentsEnabled: 'Allow users to comment on articles',
    likesEnabled: 'Enable article likes and reactions',
    newsletterEnabled: 'Show newsletter subscription forms',
    searchEnabled: 'Enable site-wide search functionality',
    socialSharingEnabled: 'Show social media sharing buttons',
    userRegistrationEnabled: 'Allow new user registrations',
    multiLanguageEnabled: 'Enable English and Khmer languages',
    pwaPushNotifications: 'Enable push notifications for PWA'
  };
  return descriptions[key] || 'Feature toggle';
}

function getPerformanceDescription(key: string): string {
  const descriptions: Record<string, string> = {
    cachingEnabled: 'Enable browser and server-side caching',
    imageOptimization: 'Optimize images for faster loading',
    lazyLoadingEnabled: 'Load images and content as needed',
    compressionEnabled: 'Compress assets for faster delivery',
    cdnEnabled: 'Use Content Delivery Network for global speed'
  };
  return descriptions[key] || 'Performance optimization';
}

function getSecurityDescription(key: string): string {
  const descriptions: Record<string, string> = {
    rateLimitingEnabled: 'Limit API requests to prevent abuse',
    captchaEnabled: 'Require CAPTCHA for forms and registration',
    csrfProtectionEnabled: 'Protect against Cross-Site Request Forgery',
    contentSecurityPolicy: 'Enable Content Security Policy headers',
    httpsRedirectEnabled: 'Force HTTPS redirect for all traffic'
  };
  return descriptions[key] || 'Security feature';
}

export default FrontendControlPanel;
