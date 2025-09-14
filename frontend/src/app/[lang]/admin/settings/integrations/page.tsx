'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Mail, 
  Zap, 
  BarChart3, 
  Bell,
  AlertCircle,
  CheckCircle,
  ExternalLink,

  Cloud
} from 'lucide-react';

interface IntegrationSettings {
  // Email Integration
  emailProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  emailEnabled: boolean;
  
  // Analytics Integration  
  googleAnalyticsId: string;
  analyticsEnabled: boolean;
  
  // Social Media
  facebookAppId: string;
  twitterApiKey: string;
  
  // Storage Integration
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryEnabled: boolean;
  
  // Push Notifications
  firebaseServerKey: string;
  pushNotificationsEnabled: boolean;
  
  // Webhook Settings
  webhookUrl: string;
  webhookSecret: string;
  webhookEnabled: boolean;
}

export default function IntegrationsSettingsPage() {
  const [settings, setSettings] = useState<IntegrationSettings>({
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    emailEnabled: false,
    
    googleAnalyticsId: '',
    analyticsEnabled: false,
    
    facebookAppId: '',
    twitterApiKey: '',
    
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    cloudinaryEnabled: false,
    
    firebaseServerKey: '',
    pushNotificationsEnabled: false,
    
    webhookUrl: '',
    webhookSecret: '',
    webhookEnabled: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings/integrations');
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IntegrationSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings/integrations', { settings });
      setHasChanges(false);
      toast.success('Integration settings saved successfully!');
    } catch (error) {toast.error('Failed to save integration settings');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
    try {
      setTestingEmail(true);
      await api.post('/admin/integrations/test-email');
      toast.success('Test email sent successfully!');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const testWebhookConfiguration = async () => {
    try {
      setTestingWebhook(true);
      await api.post('/admin/integrations/test-webhook');
      toast.success('Webhook test successful!');
    } catch (error) {
      toast.error('Webhook test failed');
    } finally {
      setTestingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
          <p className="text-gray-600">Configure external services and API connections</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Email Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Integration
              {settings.emailEnabled && (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for sending emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Email Integration</Label>
                <p className="text-sm text-gray-600">Enable email notifications and transactional emails</p>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => handleInputChange('emailEnabled', checked)}
              />
            </div>

            {settings.emailEnabled && (
              <>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      value={settings.smtpHost}
                      onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                      value={settings.smtpPort}
                      onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      placeholder="your-email@gmail.com"
                      value={settings.smtpUsername}
                      onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="Your app password"
                      value={settings.smtpPassword}
                      onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Use Secure Connection (TLS)</Label>
                    <p className="text-sm text-gray-600">Use encrypted connection for SMTP</p>
                  </div>
                  <Switch
                    checked={settings.smtpSecure}
                    onCheckedChange={(checked) => handleInputChange('smtpSecure', checked)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={testEmailConfiguration}
                    disabled={testingEmail}
                    className="flex items-center gap-2"
                  >
                    {testingEmail ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Test Email Configuration
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Analytics Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Integration
              {settings.analyticsEnabled && (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Connect Google Analytics for detailed site analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Analytics Integration</Label>
                <p className="text-sm text-gray-600">Enable Google Analytics tracking</p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => handleInputChange('analyticsEnabled', checked)}
              />
            </div>

            {settings.analyticsEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    placeholder="GA-XXXXXXXXX-X"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Find your Google Analytics ID in your GA dashboard
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cloud Storage Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Storage Integration
              {settings.cloudinaryEnabled && (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure Cloudinary for image and media storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Cloudinary Integration</Label>
                <p className="text-sm text-gray-600">Use Cloudinary for media storage and optimization</p>
              </div>
              <Switch
                checked={settings.cloudinaryEnabled}
                onCheckedChange={(checked) => handleInputChange('cloudinaryEnabled', checked)}
              />
            </div>

            {settings.cloudinaryEnabled && (
              <>
                <Separator />
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                    <Input
                      id="cloudinaryCloudName"
                      placeholder="your-cloud-name"
                      value={settings.cloudinaryCloudName}
                      onChange={(e) => handleInputChange('cloudinaryCloudName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiKey">API Key</Label>
                    <Input
                      id="cloudinaryApiKey"
                      placeholder="123456789012345"
                      value={settings.cloudinaryApiKey}
                      onChange={(e) => handleInputChange('cloudinaryApiKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
                    <Input
                      id="cloudinaryApiSecret"
                      type="password"
                      placeholder="Your API secret"
                      value={settings.cloudinaryApiSecret}
                      onChange={(e) => handleInputChange('cloudinaryApiSecret', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
              {settings.pushNotificationsEnabled && (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure Firebase for push notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Push Notifications</Label>
                <p className="text-sm text-gray-600">Send push notifications to users via Firebase</p>
              </div>
              <Switch
                checked={settings.pushNotificationsEnabled}
                onCheckedChange={(checked) => handleInputChange('pushNotificationsEnabled', checked)}
              />
            </div>

            {settings.pushNotificationsEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="firebaseServerKey">Firebase Server Key</Label>
                  <Textarea
                    id="firebaseServerKey"
                    placeholder="Your Firebase server key..."
                    value={settings.firebaseServerKey}
                    onChange={(e) => handleInputChange('firebaseServerKey', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    Get this from your Firebase project settings
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Webhooks
              {settings.webhookEnabled && (
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure webhooks for external integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Webhooks</Label>
                <p className="text-sm text-gray-600">Send webhook notifications for events</p>
              </div>
              <Switch
                checked={settings.webhookEnabled}
                onCheckedChange={(checked) => handleInputChange('webhookEnabled', checked)}
              />
            </div>

            {settings.webhookEnabled && (
              <>
                <Separator />
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-site.com/webhook"
                      value={settings.webhookUrl}
                      onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="Your webhook secret"
                      value={settings.webhookSecret}
                      onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={testWebhookConfiguration}
                    disabled={testingWebhook}
                    className="flex items-center gap-2"
                  >
                    {testingWebhook ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    Test Webhook
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Social Media Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Social Media Integration
            </CardTitle>
            <CardDescription>
              Configure social media platform integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebookAppId">Facebook App ID</Label>
                <Input
                  id="facebookAppId"
                  placeholder="123456789012345"
                  value={settings.facebookAppId}
                  onChange={(e) => handleInputChange('facebookAppId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterApiKey">Twitter API Key</Label>
                <Input
                  id="twitterApiKey"
                  placeholder="Your Twitter API key"
                  value={settings.twitterApiKey}
                  onChange={(e) => handleInputChange('twitterApiKey', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}