'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  BarChart3
} from 'lucide-react';

interface SocialMediaLink {
  platform: string;
  url: string;
  isActive: boolean;
  displayName?: string;
  icon?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  website: string;
}

interface SocialMediaSettings {
  socialLinks: SocialMediaLink[];
  contactInfo: ContactInfo;
  socialSharingEnabled: boolean;
  socialLoginEnabled: boolean;
  socialAnalyticsEnabled: boolean;
  autoPostEnabled: boolean;
  socialPreviewEnabled: boolean;
  // Facebook Auto-Posting Configuration
  facebookAppId?: string;
  facebookAppSecret?: string;
  facebookPageId?: string;
  facebookPageAccessToken?: string;
  facebookEnabled?: boolean;
  // Twitter/X Auto-Posting Configuration
  twitterApiKey?: string;
  twitterApiSecret?: string;
  twitterBearerToken?: string;
  twitterClientId?: string;
  twitterClientSecret?: string;
  twitterAccessToken?: string;
  twitterAccessTokenSecret?: string;
  twitterEnabled?: boolean;
  // Instagram Auto-Posting Configuration
  instagramAppId?: string;
  instagramAppSecret?: string;
  instagramPageId?: string;
  instagramAccessToken?: string;
  instagramEnabled?: boolean;
  // Threads Auto-Posting Configuration
  threadsAppId?: string;
  threadsAppSecret?: string;
  threadsPageId?: string;
  threadsAccessToken?: string;
  threadsEnabled?: boolean;
}

interface SocialMediaManagementProps {
  compact?: boolean;
  onSettingsChange?: (settings: SocialMediaSettings) => void;
}

const defaultSocialPlatforms = [
  { platform: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { platform: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
  { platform: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { platform: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
  { platform: 'threads', name: 'Threads', icon: Instagram, color: 'bg-black' },
  { platform: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
  { platform: 'github', name: 'GitHub', icon: Github, color: 'bg-gray-800' },
  { platform: 'website', name: 'Website', icon: Globe, color: 'bg-green-600' },
];

export default function SocialMediaManagement({ compact = false, onSettingsChange }: SocialMediaManagementProps) {
  const [settings, setSettings] = useState<SocialMediaSettings>({
    socialLinks: [],
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      website: '',
    },
    socialSharingEnabled: true,
    socialLoginEnabled: false,
    socialAnalyticsEnabled: false,
    autoPostEnabled: false,
    socialPreviewEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [postingStats, setPostingStats] = useState<any>(null);

  useEffect(() => {
    fetchSocialMediaSettings();
  }, []);

  const fetchSocialMediaSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/social-media');
      
      if (response.data.success && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
        onSettingsChange?.(response.data.settings);
      }
    } catch (error: any) {// Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: SocialMediaSettings) => {
    try {
      setSaving(true);
      await api.put('/admin/settings/social-media', { settings: newSettings });
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
      toast.success('Social media settings updated successfully!');
    } catch (error: any) {toast.error('Failed to save social media settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialMediaLink = {
      platform: 'facebook',
      url: '',
      isActive: true,
      displayName: '',
    };
    setSettings(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }));
    setEditingLink(newLink);
  };

  const handleUpdateSocialLink = (index: number, updatedLink: SocialMediaLink) => {
    const newLinks = [...settings.socialLinks];
    newLinks[index] = updatedLink;
    setSettings(prev => ({
      ...prev,
      socialLinks: newLinks
    }));
  };

  const handleDeleteSocialLink = (index: number) => {
    const newLinks = settings.socialLinks.filter((_, i) => i !== index);
    setSettings(prev => ({
      ...prev,
      socialLinks: newLinks
    }));
  };

  const handleToggleSocialLink = (index: number) => {
    const newLinks = [...settings.socialLinks];
    newLinks[index].isActive = !newLinks[index].isActive;
    setSettings(prev => ({
      ...prev,
      socialLinks: newLinks
    }));
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setSettings(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const handleToggleSetting = (setting: keyof SocialMediaSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSettingChange = (setting: keyof SocialMediaSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTestConnection = async (platform: string) => {
    try {
      setTestingConnection(platform);
      const response = await api.post('/admin/settings/social-media/test', { platform });
      
      if (response.data.success) {
        toast.success(`Connection to ${platform} successful!`);
      } else {
        toast.error(`Connection to ${platform} failed: ${response.data.message}`);
      }
    } catch (error: any) {toast.error(`Failed to test ${platform} connection: ${error.response?.data?.message || error.message}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleGetStats = async () => {
    try {
      const response = await api.get('/admin/settings/social-media/stats');
      if (response.data.success) {
        setPostingStats(response.data.stats);
      }
    } catch (error: any) {toast.error('Failed to get posting statistics');
    }
  };

  const handleManualPost = async (newsId: string) => {
    try {
      const response = await api.post('/admin/settings/social-media/post', { newsId });
      
      if (response.data.success) {
        toast.success(`Posted to ${response.data.successfulPosts}/${response.data.totalPlatforms} platforms successfully!`);
      } else {
        toast.error(`Manual posting failed: ${response.data.message}`);
      }
    } catch (error: any) {toast.error(`Manual posting failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const renderSocialLinkPreview = (link: SocialMediaLink) => {
    const platform = defaultSocialPlatforms.find(p => p.platform === link.platform);
    if (!platform) return null;

    const Icon = platform.icon;
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border">
        <Icon className={`h-4 w-4 ${platform.color} text-white rounded p-0.5`} />
        <span className="text-sm font-medium">{platform.name}</span>
        {link.isActive ? (
          <Badge variant="outline" className="text-xs">Active</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Inactive</Badge>
        )}
      </div>
    );
  };

  const renderContactPreview = () => {
    return (
      <div className="space-y-3">
        {settings.contactInfo.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{settings.contactInfo.email}</span>
          </div>
        )}
        {settings.contactInfo.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{settings.contactInfo.phone}</span>
          </div>
        )}
        {settings.contactInfo.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{settings.contactInfo.website}</span>
          </div>
        )}
        {settings.contactInfo.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{settings.contactInfo.address}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5" />
            Social Media & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Links:</span>
            <Badge variant="outline">
              {settings.socialLinks.filter(link => link.isActive).length}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Social Sharing:</span>
            <Badge variant={settings.socialSharingEnabled ? 'default' : 'secondary'}>
              {settings.socialSharingEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/admin/settings/social-media', '_blank')}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSaveSettings(settings)}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="social" className="space-y-6">
                <TabsList>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Manage your social media profiles and links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Social Media Platforms</h4>
                <Button onClick={handleAddSocialLink} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </div>

              <div className="space-y-4">
                {settings.socialLinks.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderSocialLinkPreview(link)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link.isActive}
                          onCheckedChange={() => handleToggleSocialLink(index)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLink(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSocialLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editingLink === link && (
                      <div className="space-y-3 pt-3 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Platform</Label>
                            <Select
                              value={link.platform}
                              onValueChange={(value) => handleUpdateSocialLink(index, {
                                ...link,
                                platform: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                {defaultSocialPlatforms.map(platform => (
                                  <SelectItem key={platform.platform} value={platform.platform}>
                                    {platform.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Display Name (Optional)</Label>
                            <Input
                              value={link.displayName || ''}
                              onChange={(e) => handleUpdateSocialLink(index, {
                                ...link,
                                displayName: e.target.value
                              })}
                              placeholder="Custom display name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => handleUpdateSocialLink(index, {
                              ...link,
                              url: e.target.value
                            })}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingLink(null)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLink(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {settings.socialLinks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No social media links configured</p>
                    <p className="text-sm">Click "Add Platform" to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Manage your contact information and business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email Address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-website">Website</Label>
                  <Input
                    id="contact-website"
                    type="url"
                    value={settings.contactInfo.website}
                    onChange={(e) => handleContactInfoChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-address">Address</Label>
                  <Input
                    id="contact-address"
                    value={settings.contactInfo.address}
                    onChange={(e) => handleContactInfoChange('address', e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Social Media Settings
              </CardTitle>
              <CardDescription>
                Configure social media features and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Social Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to share content on social media
                    </p>
                  </div>
                  <Switch
                    checked={settings.socialSharingEnabled}
                    onCheckedChange={(checked) => handleToggleSetting('socialSharingEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Social Login</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to login with social media accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.socialLoginEnabled}
                    onCheckedChange={(checked) => handleToggleSetting('socialLoginEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Social Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Track social media engagement and sharing
                    </p>
                  </div>
                  <Switch
                    checked={settings.socialAnalyticsEnabled}
                    onCheckedChange={(checked) => handleToggleSetting('socialAnalyticsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto Post</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically post new content to social media
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoPostEnabled}
                    onCheckedChange={(checked) => handleToggleSetting('autoPostEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Social Preview</Label>
                    <p className="text-sm text-muted-foreground">
                      Show social media preview when sharing
                    </p>
                  </div>
                  <Switch
                    checked={settings.socialPreviewEnabled}
                    onCheckedChange={(checked) => handleToggleSetting('socialPreviewEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facebook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook Auto-Posting Configuration
              </CardTitle>
              <CardDescription>
                Configure Facebook credentials for automatic posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Facebook Auto-Posting</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically post new content to Facebook
                  </p>
                </div>
                <Switch
                  checked={settings.facebookEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting('facebookEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook-app-id">Facebook App ID</Label>
                  <Input
                    id="facebook-app-id"
                    type="text"
                    value={settings.facebookAppId || ''}
                    onChange={(e) => handleSettingChange('facebookAppId', e.target.value)}
                    placeholder="2017594075645280"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Facebook App ID from Meta for Developers
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-app-secret">Facebook App Secret</Label>
                  <Input
                    id="facebook-app-secret"
                    type="password"
                    value={settings.facebookAppSecret || ''}
                    onChange={(e) => handleSettingChange('facebookAppSecret', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Facebook App Secret (will be masked)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-page-id">Facebook Page ID</Label>
                  <Input
                    id="facebook-page-id"
                    type="text"
                    value={settings.facebookPageId || ''}
                    onChange={(e) => handleSettingChange('facebookPageId', e.target.value)}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">
                    The ID of your Facebook page (optional, defaults to 'me')
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-page-token">Page Access Token</Label>
                  <Input
                    id="facebook-page-token"
                    type="password"
                    value={settings.facebookPageAccessToken || ''}
                    onChange={(e) => handleSettingChange('facebookPageAccessToken', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Facebook Page Access Token (will be masked)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={() => handleTestConnection('facebook')}
                  disabled={testingConnection === 'facebook'}
                  className="w-full"
                >
                  {testingConnection === 'facebook' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Facebook Connection...
                    </>
                  ) : (
                    <>
                      <Facebook className="h-4 w-4 mr-2" />
                      Test Facebook Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. Create a Facebook App at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Meta for Developers</a></li>
                  <li>2. Add the "Pages" product to your app</li>
                  <li>3. Generate a Page Access Token with "publish_pages" permission</li>
                  <li>4. Enter your App ID, App Secret, and Page Access Token above</li>
                  <li>5. Test the connection to verify everything works</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-sky-500" />
                Twitter/X Auto-Posting Configuration
              </CardTitle>
              <CardDescription>
                Configure Twitter credentials for automatic posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Twitter Auto-Posting</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically post new content to Twitter/X
                  </p>
                </div>
                <Switch
                  checked={settings.twitterEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting('twitterEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter-api-key">Twitter API Key</Label>
                  <Input
                    id="twitter-api-key"
                    type="text"
                    value={settings.twitterApiKey || ''}
                    onChange={(e) => handleSettingChange('twitterApiKey', e.target.value)}
                    placeholder="8Di2tnKyDp9w9PSXwuknlVG2f"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twitter API Key from Twitter Developer Portal
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-api-secret">Twitter API Secret</Label>
                  <Input
                    id="twitter-api-secret"
                    type="password"
                    value={settings.twitterApiSecret || ''}
                    onChange={(e) => handleSettingChange('twitterApiSecret', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twitter API Secret (will be masked)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-access-token">Access Token</Label>
                  <Input
                    id="twitter-access-token"
                    type="password"
                    value={settings.twitterAccessToken || ''}
                    onChange={(e) => handleSettingChange('twitterAccessToken', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twitter Access Token (OAuth 1.0a)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter-access-token-secret">Access Token Secret</Label>
                  <Input
                    id="twitter-access-token-secret"
                    type="password"
                    value={settings.twitterAccessTokenSecret || ''}
                    onChange={(e) => handleSettingChange('twitterAccessTokenSecret', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Twitter Access Token Secret (OAuth 1.0a)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={() => handleTestConnection('twitter')}
                  disabled={testingConnection === 'twitter'}
                  className="w-full"
                >
                  {testingConnection === 'twitter' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Twitter Connection...
                    </>
                  ) : (
                    <>
                      <Twitter className="h-4 w-4 mr-2" />
                      Test Twitter Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                <h4 className="font-medium text-sky-900 dark:text-sky-100 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-sky-800 dark:text-sky-200 space-y-1">
                  <li>1. Create a Twitter App at <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="underline">Twitter Developer Portal</a></li>
                  <li>2. Generate Access Token and Access Token Secret (OAuth 1.0a)</li>
                  <li>3. Ensure your app has "Read and Write" permissions</li>
                  <li>4. Enter your API Key, API Secret, Access Token, and Access Token Secret above</li>
                  <li>5. Test the connection to verify everything works</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                Instagram Auto-Posting Configuration
              </CardTitle>
              <CardDescription>
                Configure Instagram credentials for automatic posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Instagram Auto-Posting</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically post new content to Instagram
                  </p>
                </div>
                <Switch
                  checked={settings.instagramEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting('instagramEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram-app-id">Instagram App ID</Label>
                  <Input
                    id="instagram-app-id"
                    type="text"
                    value={settings.instagramAppId || ''}
                    onChange={(e) => handleSettingChange('instagramAppId', e.target.value)}
                    placeholder="2017594075645280"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Instagram App ID (same as Facebook App ID)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram-app-secret">Instagram App Secret</Label>
                  <Input
                    id="instagram-app-secret"
                    type="password"
                    value={settings.instagramAppSecret || ''}
                    onChange={(e) => handleSettingChange('instagramAppSecret', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Instagram App Secret (same as Facebook App Secret)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram-page-id">Instagram Page ID</Label>
                  <Input
                    id="instagram-page-id"
                    type="text"
                    value={settings.instagramPageId || ''}
                    onChange={(e) => handleSettingChange('instagramPageId', e.target.value)}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Instagram Business Account ID
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram-access-token">Access Token</Label>
                  <Input
                    id="instagram-access-token"
                    type="password"
                    value={settings.instagramAccessToken || ''}
                    onChange={(e) => handleSettingChange('instagramAccessToken', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Instagram Access Token with Instagram permissions
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={() => handleTestConnection('instagram')}
                  disabled={testingConnection === 'instagram'}
                  className="w-full"
                >
                  {testingConnection === 'instagram' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Instagram Connection...
                    </>
                  ) : (
                    <>
                      <Instagram className="h-4 w-4 mr-2" />
                      Test Instagram Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <h4 className="font-medium text-pink-900 dark:text-pink-100 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                  <li>1. Convert your Instagram to a Business account</li>
                  <li>2. Connect Instagram to your Facebook Page (RizeWaire)</li>
                  <li>3. Add Instagram Graph API to your Meta app</li>
                  <li>4. Get Instagram permissions: instagram_basic, instagram_content_publish</li>
                  <li>5. Generate Access Token with Instagram permissions</li>
                  <li>6. Enter your credentials above and test the connection</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-black" />
                Threads Auto-Posting Configuration
              </CardTitle>
              <CardDescription>
                Configure Threads credentials for automatic posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Threads Auto-Posting</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically post new content to Threads
                  </p>
                </div>
                <Switch
                  checked={settings.threadsEnabled || false}
                  onCheckedChange={(checked) => handleToggleSetting('threadsEnabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threads-app-id">Threads App ID</Label>
                  <Input
                    id="threads-app-id"
                    type="text"
                    value={settings.threadsAppId || ''}
                    onChange={(e) => handleSettingChange('threadsAppId', e.target.value)}
                    placeholder="2017594075645280"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Threads App ID (same as Instagram/Facebook App ID)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threads-app-secret">Threads App Secret</Label>
                  <Input
                    id="threads-app-secret"
                    type="password"
                    value={settings.threadsAppSecret || ''}
                    onChange={(e) => handleSettingChange('threadsAppSecret', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Threads App Secret (same as Instagram/Facebook App Secret)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threads-page-id">Threads Page ID</Label>
                  <Input
                    id="threads-page-id"
                    type="text"
                    value={settings.threadsPageId || ''}
                    onChange={(e) => handleSettingChange('threadsPageId', e.target.value)}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Threads Page ID (same as Instagram Page ID)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threads-access-token">Access Token</Label>
                  <Input
                    id="threads-access-token"
                    type="password"
                    value={settings.threadsAccessToken || ''}
                    onChange={(e) => handleSettingChange('threadsAccessToken', e.target.value)}
                    placeholder="••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Threads Access Token (same as Instagram Access Token)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={() => handleTestConnection('threads')}
                  disabled={testingConnection === 'threads'}
                  className="w-full"
                >
                  {testingConnection === 'threads' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Threads Connection...
                    </>
                  ) : (
                    <>
                      <Instagram className="h-4 w-4 mr-2" />
                      Test Threads Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                  <li>1. Threads uses the same credentials as Instagram</li>
                  <li>2. Configure Instagram first (Threads will auto-configure)</li>
                  <li>3. Ensure your Instagram is connected to your Facebook Page</li>
                  <li>4. Threads API is still in development</li>
                  <li>5. Posts may require media (images/videos)</li>
                  <li>6. Test the connection to verify everything works</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Test Connections
                </CardTitle>
                <CardDescription>
                  Test your social media platform connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {defaultSocialPlatforms.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <platform.icon className={`h-5 w-5 ${platform.color} text-white rounded p-1`} />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(platform.platform)}
                        disabled={testingConnection === platform.platform}
                      >
                        {testingConnection === platform.platform ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Posting Statistics
                </CardTitle>
                <CardDescription>
                  View your social media posting statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleGetStats}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Statistics
                </Button>
                
                {postingStats && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{postingStats.totalPosts}</div>
                        <div className="text-blue-600">Total Posts</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{postingStats.successfulPosts}</div>
                        <div className="text-green-600">Successful</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Platform Statistics</h4>
                      {Object.entries(postingStats.platforms).map(([platform, stats]: [string, any]) => (
                        <div key={platform} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{platform}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">{stats.success}</span>
                            <span className="text-gray-400">/</span>
                            <span>{stats.posts}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.socialLinks.filter(link => link.isActive).map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      {renderSocialLinkPreview(link)}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {settings.socialLinks.filter(link => link.isActive).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active social media links
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Info Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContactPreview()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => handleSaveSettings(settings)}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 