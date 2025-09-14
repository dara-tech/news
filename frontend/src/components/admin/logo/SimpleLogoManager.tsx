'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Type,
  Save,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

interface SimpleLogoSettings {
  logoText: string;
  logoTextColor: string;
  logoBackgroundColor: string;
  logoFontSize: number;
  logoFontWeight: string;
}

interface SimpleLogoManagerProps {
  onLogoChange?: (logoText: string) => void;
}

export function SimpleLogoManager({ onLogoChange }: SimpleLogoManagerProps) {
  const [settings, setSettings] = useState<SimpleLogoSettings>({
    logoText: 'Newsly',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
    logoFontWeight: 'bold',
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
      }
    } catch (error) {toast.error('Failed to load logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings/logo', { settings });
      onLogoChange?.(settings.logoText);
      toast.success('Logo settings saved successfully!');
    } catch (error) {toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SimpleLogoSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logo Settings</h2>
          <p className="text-muted-foreground">Configure your logo text and appearance</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Logo Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoText">Logo Text</Label>
            <Input
              id="logoText"
              value={settings.logoText}
              onChange={(e) => handleInputChange('logoText', e.target.value)}
              placeholder="Enter your logo text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={settings.logoTextColor}
                  onChange={(e) => handleInputChange('logoTextColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.logoTextColor}
                  onChange={(e) => handleInputChange('logoTextColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.logoBackgroundColor}
                  onChange={(e) => handleInputChange('logoBackgroundColor', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.logoBackgroundColor}
                  onChange={(e) => handleInputChange('logoBackgroundColor', e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={settings.logoFontSize}
                onChange={(e) => handleInputChange('logoFontSize', parseInt(e.target.value))}
                min="12"
                max="72"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontWeight">Font Weight</Label>
              <Select
                value={settings.logoFontWeight}
                onValueChange={(value) => handleInputChange('logoFontWeight', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="semibold">Semibold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="extrabold">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Logo Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-center">
              <span
                style={{
                  fontSize: `${settings.logoFontSize}px`,
                  fontWeight: settings.logoFontWeight,
                  color: settings.logoTextColor,
                  backgroundColor: settings.logoBackgroundColor,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {settings.logoText || 'Your Logo'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 