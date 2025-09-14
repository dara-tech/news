'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette,
  Image,
  Type,
  Settings,
  Upload,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LogoSettings {
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoUrl?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

interface LogoManagementProps {
  compact?: boolean;
  onSettingsChange?: (settings: LogoSettings) => void;
}

export default function LogoManagement({ compact = false, onSettingsChange }: LogoManagementProps) {
  const [settings, setSettings] = useState<LogoSettings>({
    logoDisplayMode: 'text',
    logoText: 'Newsly',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/logo');
      
      if (response.data.success && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
        onSettingsChange?.(response.data.settings);
      }
    } catch (error: any) {toast.error('Failed to load logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: LogoSettings) => {
    try {
      setSaving(true);
      await api.put('/admin/settings/logo', { settings: newSettings });
      setSettings(newSettings);
      onSettingsChange?.(newSettings);
      toast.success('Logo settings updated successfully!');
    } catch (error: any) {toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    const defaultSettings = {
      logoDisplayMode: 'text' as const,
      logoText: 'Newsly',
      logoTextColor: '#000000',
      logoBackgroundColor: '#ffffff',
      logoFontSize: 24,
    };
    handleSaveSettings(defaultSettings);
  };

  const handleApplyDarkTheme = () => {
    const darkSettings = {
      ...settings,
      logoTextColor: '#ffffff',
      logoBackgroundColor: '#000000',
    };
    handleSaveSettings(darkSettings);
  };

  const handleApplyLightTheme = () => {
    const lightSettings = {
      ...settings,
      logoTextColor: '#000000',
      logoBackgroundColor: '#ffffff',
    };
    handleSaveSettings(lightSettings);
  };

  const renderLogoPreview = () => {
    if (settings.logoDisplayMode === 'image' && settings.logoUrl) {
      return (
        <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
          <img
            src={settings.logoUrl}
            alt="Logo Preview"
            className="max-h-16 max-w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
        <span
          style={{
            fontSize: `${settings.logoFontSize || 24}px`,
            color: settings.logoTextColor || '#000000',
            backgroundColor: settings.logoBackgroundColor || '#ffffff',
            padding: '8px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {settings.logoText || 'Razewire'}
        </span>
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
            <Palette className="h-5 w-5" />
            Logo Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Mode:</span>
            <Badge variant={settings.logoDisplayMode === 'image' ? 'default' : 'secondary'}>
              {settings.logoDisplayMode || 'text'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="outline">
              {settings.logoDisplayMode === 'image' && settings.logoUrl ? 'Active' : 'Text Mode'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/admin/settings/logo', '_blank')}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetToDefault}
              disabled={saving}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Logo Preview
          </CardTitle>
          <CardDescription>
            See how your logo appears on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderLogoPreview()}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('/admin/settings/logo', '_blank')}
            >
              <Palette className="h-4 w-4 mr-2" />
              Full Logo Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleResetToDefault}
              disabled={saving}
            >
              <Type className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleApplyDarkTheme}
              disabled={saving}
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Dark Theme
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleApplyLightTheme}
              disabled={saving}
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Light Theme
            </Button>
          </CardContent>
        </Card>

        {/* Logo Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Logo Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Display Mode:</span>
                <Badge variant={settings.logoDisplayMode === 'image' ? 'default' : 'secondary'}>
                  {settings.logoDisplayMode || 'text'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant="outline">
                  {settings.logoDisplayMode === 'image' && settings.logoUrl ? 'Active' : 'Text Mode'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Text:</span>
                <span className="text-sm font-medium">{settings.logoText || 'Newsly'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Font Size:</span>
                <span className="text-sm font-medium">{settings.logoFontSize || 24}px</span>
              </div>
            </div>

            {settings.logoDisplayMode === 'image' && settings.logoUrl && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Image URL:</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Text Color:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: settings.logoTextColor || '#000000' }}
                  />
                  <span>{settings.logoTextColor || '#000000'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Background Color:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: settings.logoBackgroundColor || '#ffffff' }}
                  />
                  <span>{settings.logoBackgroundColor || '#ffffff'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Display Mode:</span>
                <Badge variant={settings.logoDisplayMode === 'image' ? 'default' : 'secondary'}>
                  {settings.logoDisplayMode || 'text'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Font Size:</span>
                <span className="font-medium">{settings.logoFontSize || 24}px</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 