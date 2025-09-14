'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Save } from 'lucide-react';
import { Facebook, Twitter, Instagram, MessageCircle, Linkedin } from 'lucide-react';

// Import smaller components
import QuickStats from './auto-posting/QuickStats';
import GlobalSettings from './auto-posting/GlobalSettings';
import PlatformStatus from './auto-posting/PlatformStatus';
import PlatformConfig from './auto-posting/PlatformConfig';
import LinkedInConfig from './auto-posting/LinkedInConfig';
import TelegramConfig from './auto-posting/TelegramConfig';
import TestingPanel from './auto-posting/TestingPanel';
import TokenHealthMonitor from './auto-posting/TokenHealthMonitor';
import TokenMonitoringDashboard from './auto-posting/TokenMonitoringDashboard';

interface AutoPostingSettings {
  autoPostEnabled: boolean;
  autoPostDelay: number;
  autoPostSchedule: 'immediate' | 'scheduled' | 'manual';
  
  facebook: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    pageId: string;
    pageAccessToken: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  
  twitter: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    bearerToken: string;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  
  instagram: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    pageId: string;
    accessToken: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  
  threads: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    pageId: string;
    accessToken: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  
  linkedin: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    organizationId: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  
  telegram: {
    enabled: boolean;
    botToken: string;
    channelId: string;
    channelUsername: string;
    status: 'connected' | 'disconnected' | 'error';
  };
}

export default function AutoPostingManager() {
  const [settings, setSettings] = useState<AutoPostingSettings>({
    autoPostEnabled: false,
    autoPostDelay: 0,
    autoPostSchedule: 'immediate',
    facebook: {
      enabled: false,
      appId: '',
      appSecret: '',
      pageId: '',
      pageAccessToken: '',
      status: 'disconnected'
    },
    twitter: {
      enabled: false,
      apiKey: '',
      apiSecret: '',
      bearerToken: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      accessTokenSecret: '',
      status: 'disconnected'
    },
    instagram: {
      enabled: false,
      appId: '',
      appSecret: '',
      pageId: '',
      accessToken: '',
      status: 'disconnected'
    },
    threads: {
      enabled: false,
      appId: '',
      appSecret: '',
      pageId: '',
      accessToken: '',
      status: 'disconnected'
    },
    linkedin: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      organizationId: '',
      status: 'disconnected'
    },
    telegram: {
      enabled: false,
      botToken: '',
      channelId: '',
      channelUsername: '',
      status: 'disconnected'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/social-media');
      
      if (response.data.success && response.data.settings) {
        const apiSettings = response.data.settings;
        
        setSettings(prev => ({
          ...prev,
          autoPostEnabled: apiSettings.autoPostEnabled || false,
          autoPostDelay: apiSettings.autoPostDelay || 0,
          autoPostSchedule: apiSettings.autoPostSchedule || 'immediate',
          facebook: {
            ...prev.facebook,
            enabled: apiSettings.facebookEnabled || false,
            appId: apiSettings.facebookAppId || '',
            appSecret: apiSettings.facebookAppSecret || '',
            pageId: apiSettings.facebookPageId || '',
            pageAccessToken: apiSettings.facebookPageAccessToken || '',
            status: apiSettings.facebookPageAccessToken ? 'connected' : 'disconnected'
          },
          twitter: {
            ...prev.twitter,
            enabled: apiSettings.twitterEnabled || false,
            apiKey: apiSettings.twitterApiKey || '',
            apiSecret: apiSettings.twitterApiSecret || '',
            bearerToken: apiSettings.twitterBearerToken || '',
            clientId: apiSettings.twitterClientId || '',
            clientSecret: apiSettings.twitterClientSecret || '',
            accessToken: apiSettings.twitterAccessToken || '',
            accessTokenSecret: apiSettings.twitterAccessTokenSecret || '',
            status: apiSettings.twitterAccessToken ? 'connected' : 'disconnected'
          },
          instagram: {
            ...prev.instagram,
            enabled: apiSettings.instagramEnabled || false,
            appId: apiSettings.instagramAppId || '',
            appSecret: apiSettings.instagramAppSecret || '',
            pageId: apiSettings.instagramPageId || '',
            accessToken: apiSettings.instagramAccessToken || '',
            status: apiSettings.instagramAccessToken ? 'connected' : 'disconnected'
          },
          threads: {
            ...prev.threads,
            enabled: apiSettings.threadsEnabled || false,
            appId: apiSettings.threadsAppId || '',
            appSecret: apiSettings.threadsAppSecret || '',
            pageId: apiSettings.threadsPageId || '',
            accessToken: apiSettings.threadsAccessToken || '',
            status: apiSettings.threadsAccessToken ? 'connected' : 'disconnected'
          },
          linkedin: {
            ...prev.linkedin,
            enabled: apiSettings.linkedinEnabled || false,
            clientId: apiSettings.linkedinClientId || '',
            clientSecret: apiSettings.linkedinClientSecret || '',
            accessToken: apiSettings.linkedinAccessToken || '',
            refreshToken: apiSettings.linkedinRefreshToken || '',
            organizationId: apiSettings.linkedinOrganizationId || '',
            status: apiSettings.linkedinAccessToken ? 'connected' : 'disconnected'
          },
          telegram: {
            ...prev.telegram,
            enabled: apiSettings.telegramEnabled || false,
            botToken: apiSettings.telegramBotToken || '',
            channelId: apiSettings.telegramChannelId || '',
            channelUsername: apiSettings.telegramChannelUsername || '',
            status: apiSettings.telegramBotToken && apiSettings.telegramChannelId ? 'connected' : 'disconnected'
          }
        }));
      }
    } catch (error: any) {toast.error('Failed to load auto-posting settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const apiSettings = {
        autoPostEnabled: settings.autoPostEnabled,
        autoPostDelay: settings.autoPostDelay,
        autoPostSchedule: settings.autoPostSchedule,
        facebookEnabled: settings.facebook.enabled,
        facebookAppId: settings.facebook.appId,
        facebookAppSecret: settings.facebook.appSecret,
        facebookPageId: settings.facebook.pageId,
        facebookPageAccessToken: settings.facebook.pageAccessToken,
        twitterEnabled: settings.twitter.enabled,
        twitterApiKey: settings.twitter.apiKey,
        twitterApiSecret: settings.twitter.apiSecret,
        twitterBearerToken: settings.twitter.bearerToken,
        twitterClientId: settings.twitter.clientId,
        twitterClientSecret: settings.twitter.clientSecret,
        twitterAccessToken: settings.twitter.accessToken,
        twitterAccessTokenSecret: settings.twitter.accessTokenSecret,
        instagramEnabled: settings.instagram.enabled,
        instagramAppId: settings.instagram.appId,
        instagramAppSecret: settings.instagram.appSecret,
        instagramPageId: settings.instagram.pageId,
        instagramAccessToken: settings.instagram.accessToken,
        threadsEnabled: settings.threads.enabled,
        threadsAppId: settings.threads.appId,
        threadsAppSecret: settings.threads.appSecret,
        threadsPageId: settings.threads.pageId,
        threadsAccessToken: settings.threads.accessToken,
        linkedinEnabled: settings.linkedin.enabled,
        linkedinClientId: settings.linkedin.clientId,
        linkedinClientSecret: settings.linkedin.clientSecret,
        linkedinAccessToken: settings.linkedin.accessToken,
        linkedinRefreshToken: settings.linkedin.refreshToken,
        linkedinOrganizationId: settings.linkedin.organizationId,
        telegramEnabled: settings.telegram.enabled,
        telegramBotToken: settings.telegram.botToken,
        telegramChannelId: settings.telegram.channelId,
        telegramChannelUsername: settings.telegram.channelUsername
      };
      
      await api.put('/admin/settings/social-media', { settings: apiSettings });
      toast.success('Auto-posting settings saved successfully!');
    } catch (error: any) {toast.error('Failed to save auto-posting settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (platform: string) => {
    try {
      setTesting(platform);
      const response = await api.post('/admin/settings/social-media/test', { platform });
      
      if (response.data.success) {
        toast.success(`${platform} connection test successful!`);
        
        setSettings(prev => ({
          ...prev,
          [platform]: {
            ...(prev[platform as keyof AutoPostingSettings] as any),
            status: 'connected'
          }
        }));
      } else {
        toast.error(`${platform} connection test failed: ${response.data.message}`);
        
        setSettings(prev => ({
          ...prev,
          [platform]: {
            ...(prev[platform as keyof AutoPostingSettings] as any),
            status: 'error'
          }
        }));
      }
    } catch (error: any) {toast.error(`Failed to test ${platform} connection: ${error.response?.data?.message || error.message}`);
      
      setSettings(prev => ({
        ...prev,
        [platform]: {
          ...(prev[platform as keyof AutoPostingSettings] as any),
          status: 'error'
        }
      }));
    } finally {
      setTesting(null);
    }
  };

  const handleManualPost = async () => {
    try {
      const response = await api.post('/admin/settings/social-media/post', {
        test: true,
        message: '🧪 Manual test post from RazeWire Auto-Posting System - ' + new Date().toLocaleString()
      });
      
      if (response.data.success) {
        toast.success(`Posted to ${response.data.successfulPosts}/${response.data.totalPlatforms} platforms successfully!`);
      } else {
        toast.error(`Manual posting failed: ${response.data.message}`);
      }
    } catch (error: any) {toast.error(`Manual posting failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSettingChange = (platform: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [platform]: {
        ...(prev[platform as keyof AutoPostingSettings] as any),
        [field]: value
      }
    }));
  };

  const handleGlobalSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <QuickStats settings={settings} />
          <PlatformStatus settings={settings} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <GlobalSettings 
            settings={{
              autoPostEnabled: settings.autoPostEnabled,
              autoPostDelay: settings.autoPostDelay,
              autoPostSchedule: settings.autoPostSchedule
            }} 
            onSettingChange={handleGlobalSettingChange} 
          />
          
          {/* Platform-specific configurations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformConfig
              platform="facebook"
              name="Facebook"
              icon={Facebook}
              color="text-blue-600"
              settings={{
                enabled: settings.facebook.enabled,
                appId: settings.facebook.appId,
                appSecret: settings.facebook.appSecret,
                pageId: settings.facebook.pageId,
                accessToken: settings.facebook.pageAccessToken,
                status: settings.facebook.status
              }}
              showSecrets={showSecrets}
              testing={testing}
              onSettingChange={(field, value) => handleSettingChange('facebook', field, value)}
              onTestConnection={() => handleTestConnection('facebook')}
              onToggleSecrets={() => setShowSecrets(!showSecrets)}
              onCopyToClipboard={copyToClipboard}
            />
            
            <PlatformConfig
              platform="twitter"
              name="Twitter/X"
              icon={Twitter}
              color="text-sky-500"
              settings={{
                enabled: settings.twitter.enabled,
                appId: settings.twitter.apiKey,
                appSecret: settings.twitter.apiSecret,
                pageId: settings.twitter.clientId,
                accessToken: settings.twitter.accessToken,
                status: settings.twitter.status
              }}
              showSecrets={showSecrets}
              testing={testing}
              onSettingChange={(field, value) => handleSettingChange('twitter', field, value)}
              onTestConnection={() => handleTestConnection('twitter')}
              onToggleSecrets={() => setShowSecrets(!showSecrets)}
              onCopyToClipboard={copyToClipboard}
            />
            
            <LinkedInConfig
              settings={{
                enabled: settings.linkedin.enabled,
                clientId: settings.linkedin.clientId,
                clientSecret: settings.linkedin.clientSecret,
                accessToken: settings.linkedin.accessToken,
                refreshToken: settings.linkedin.refreshToken,
                organizationId: settings.linkedin.organizationId,
                status: settings.linkedin.status
              }}
              showSecrets={showSecrets}
              testing={testing}
              onSettingChange={(field, value) => handleSettingChange('linkedin', field, value)}
              onTestConnection={() => handleTestConnection('linkedin')}
              onToggleSecrets={() => setShowSecrets(!showSecrets)}
              onCopyToClipboard={copyToClipboard}
            />
            
            {/* Debug logging */}
            {(() => {return null; })()}
            
            <TelegramConfig
              settings={{
                enabled: settings.telegram.enabled,
                botToken: settings.telegram.botToken,
                channelId: settings.telegram.channelId,
                channelUsername: settings.telegram.channelUsername,
                status: settings.telegram.status
              }}
              onUpdate={(updates) => {
                Object.entries(updates).forEach(([field, value]) => {
                  handleSettingChange('telegram', field, value);
                });
              }}
              onTestConnection={() => handleTestConnection('telegram')}
              testing={testing === 'telegram'}
              loading={loading}
            />
            
            <PlatformConfig
              platform="instagram"
              name="Instagram"
              icon={Instagram}
              color="text-pink-600"
              settings={{
                enabled: settings.instagram.enabled,
                appId: settings.instagram.appId,
                appSecret: settings.instagram.appSecret,
                pageId: settings.instagram.pageId,
                accessToken: settings.instagram.accessToken,
                status: settings.instagram.status
              }}
              showSecrets={showSecrets}
              testing={testing}
              onSettingChange={(field, value) => handleSettingChange('instagram', field, value)}
              onTestConnection={() => handleTestConnection('instagram')}
              onToggleSecrets={() => setShowSecrets(!showSecrets)}
              onCopyToClipboard={copyToClipboard}
            />
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <TestingPanel 
            onManualPost={handleManualPost}
            onRefreshSettings={fetchSettings}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <TokenMonitoringDashboard settings={settings} onRefresh={fetchSettings} />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Posting Controls</CardTitle>
                <CardDescription>
                  Master controls for auto-posting functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Auto-Posting</Label>
                    <p className="text-sm text-muted-foreground">
                      Master switch for all auto-posting functionality
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoPostEnabled}
                    onCheckedChange={(checked) => handleGlobalSettingChange('autoPostEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Sensitive Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Display API keys and tokens
                    </p>
                  </div>
                  <Switch
                    checked={showSecrets}
                    onCheckedChange={setShowSecrets}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={fetchSettings}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Settings
                </Button>
                
                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save All Settings'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
