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
  Globe, 
  Mail, 
  Settings, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Info,
  Shield,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  contactEmail: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  commentsEnabled: boolean;
  moderationRequired: boolean;
}

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    siteUrl: '',
    adminEmail: '',
    contactEmail: '',
    allowRegistration: true,
    maintenanceMode: false,
    analyticsEnabled: true,
    commentsEnabled: true,
    moderationRequired: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user has permission to manage maintenance mode
  const canManageMaintenance = user?.role === 'admin';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrors({});
      const { data } = await api.get('/admin/settings/general');
      if (data.success) {
        setSettings(data.settings);
        setHasChanges(false);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load settings';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!settings.siteName?.trim()) {
      newErrors.siteName = 'Site name is required';
    }
    if (!settings.siteDescription?.trim()) {
      newErrors.siteDescription = 'Site description is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.adminEmail && !emailRegex.test(settings.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    if (settings.contactEmail && !emailRegex.test(settings.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SiteSettings, value: string | boolean) => {
    // Prevent non-admin users from changing maintenance mode
    if (field === 'maintenanceMode' && !canManageMaintenance) {
      toast.error('Only administrators can manage maintenance mode');
      return;
    }
    
    setSettings(prev => ({ ...(prev || {}), [field]: value }));
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...(prev || {}), [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    // Prevent non-admin users from saving maintenance mode changes
    if (!canManageMaintenance) {
      // Remove maintenance mode from settings for non-admin users
      const settingsToSave = { ...settings };
      delete (settingsToSave as Record<string, unknown>).maintenanceMode;
      
      try {
        setSaving(true);
        const response = await api.put('/admin/settings/general', { settings: settingsToSave });
        
        if (response.data.success) {
          setHasChanges(false);
          setErrors({});
          toast.success('Settings saved successfully!');
          
          // Update settings with the response data to ensure consistency
          if (response.data.settings) {
            setSettings(response.data.settings);
          }
        }
      } catch (error: unknown) {
        const typedError = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
        const errorMessage = typedError?.response?.data?.message || 'Failed to save settings';
        toast.error(errorMessage);
        
        // Show field-specific errors if available
        if (typedError.response?.data?.errors) {
          setErrors(typedError.response.data.errors);
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/admin/settings/general', { settings });
      
      if (response.data.success) {
        setHasChanges(false);
        setErrors({});
        toast.success('Settings saved successfully!');
        
        // Update settings with the response data to ensure consistency
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      }
    } catch (error: unknown) {
      const typedError = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
      const errorMessage = typedError?.response?.data?.message || 'Failed to save settings';
      toast.error(errorMessage);
      
      // Show field-specific errors if available
      if (typedError.response?.data?.errors) {
        setErrors(typedError.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600">Manage your site&apos;s basic configuration and preferences</p>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {user.role === 'admin' ? 'Administrator' : 'Editor'}
              </Badge>
              {!canManageMaintenance && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Limited Permissions
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave} 
            disabled={!hasChanges || saving || Object.keys(errors).length > 0}
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
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Information
            </CardTitle>
            <CardDescription>
              Basic information about your news website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input
                  id="siteName"
                  placeholder="Your News Site"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className={errors.siteName ? 'border-red-500' : ''}
                />
                {errors.siteName && (
                  <p className="text-sm text-red-500">{errors.siteName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  placeholder="https://your-site.com"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                  className={errors.siteUrl ? 'border-red-500' : ''}
                />
                {errors.siteUrl && (
                  <p className="text-sm text-red-500">{errors.siteUrl}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description *</Label>
              <Textarea
                id="siteDescription"
                placeholder="A brief description of your news website..."
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={3}
                className={errors.siteDescription ? 'border-red-500' : ''}
              />
              {errors.siteDescription && (
                <p className="text-sm text-red-500">{errors.siteDescription}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Email addresses for administration and contact purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@your-site.com"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className={errors.adminEmail ? 'border-red-500' : ''}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-red-500">{errors.adminEmail}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@your-site.com"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Site Features
            </CardTitle>
            <CardDescription>
              Control various features and functionality of your site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>User Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Comments System</Label>
                  <p className="text-sm text-gray-600">Enable comments on articles</p>
                </div>
                <Switch
                  checked={settings.commentsEnabled}
                  onCheckedChange={(checked) => handleInputChange('commentsEnabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Comment Moderation</Label>
                  <p className="text-sm text-gray-600">Require approval before comments are published</p>
                </div>
                <Switch
                  checked={settings.moderationRequired}
                  onCheckedChange={(checked) => handleInputChange('moderationRequired', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Analytics</Label>
                  <p className="text-sm text-gray-600">Enable site analytics and tracking</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => handleInputChange('analyticsEnabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Control system-wide settings and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManageMaintenance ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    Maintenance Mode
                    {settings.maintenanceMode && (
                      <Badge variant="destructive" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-gray-600">
                    Put the site in maintenance mode (only admins can access)
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    Maintenance Mode
                    {settings.maintenanceMode && (
                      <Badge variant="destructive" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-gray-600">
                    Only administrators can manage maintenance mode
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Admin Only</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Status Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Settings Status
            </CardTitle>
            <CardDescription>
              Information about your settings storage and persistence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Settings are stored in the database and persist across server restarts
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}