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
    } catch (error: any) {
      console.error('Error fetching social media settings:', error);
      // Use default settings if API fails
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
    } catch (error: any) {
      console.error('Error saving social media settings:', error);
      toast.error('Failed to save social media settings');
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

  const handleTestConnection = async (platform: string) => {
    try {
      setTestingConnection(platform);
      const response = await api.post('/admin/settings/social-media/test', { platform });
      
      if (response.data.success) {
        toast.success(`Connection to ${platform} successful!`);
      } else {
        toast.error(`Connection to ${platform} failed: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast.error(`Failed to test ${platform} connection: ${error.response?.data?.message || error.message}`);
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
    } catch (error: any) {
      console.error('Get stats error:', error);
      toast.error('Failed to get posting statistics');
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
    } catch (error: any) {
      console.error('Manual post error:', error);
      toast.error(`Manual posting failed: ${error.response?.data?.message || error.message}`);
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