'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Upload,
  Type,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LogoSettings {
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoUrl?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

export default function LogoSettingsPage() {
  const [settings, setSettings] = useState<LogoSettings>({
    logoDisplayMode: 'text',
    logoText: 'Newsly',
    logoTextColor: '#000000',
    logoBackgroundColor: '#ffffff',
    logoFontSize: 24,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/logo');
      
      if (response.data.success && response.data.settings) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch {
      toast.error('Failed to load logo settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      
      const response = await api.post('/admin/settings/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const logoUrl = response.data.logo.url;
        const updatedSettings = {
          ...settings,
          logoUrl: logoUrl,
          logoDisplayMode: 'image' as const,
        };
        
        await api.put('/admin/settings/logo', { settings: updatedSettings });
        setSettings(updatedSettings);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success('Logo uploaded successfully!');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings/logo', { settings });
      toast.success('Logo settings saved successfully!');
    } catch {
      toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.delete('/admin/settings/logo');
      setSettings(prev => ({
        ...prev,
        logoUrl: undefined,
        logoDisplayMode: 'text' as const,
      }));
      toast.success('Logo deleted successfully!');
    } catch {
      toast.error('Failed to delete logo');
    } finally {
      setSaving(false);
    }
  };

  const renderLogoPreview = () => {
    if (settings.logoDisplayMode === 'image' && settings.logoUrl) {
      return (
        <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
          <Image
            src={settings.logoUrl}
            alt="Logo Preview"
            width={128}
            height={64}
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
          {settings.logoText || 'Newsly'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logo Settings</h1>
          <p className="text-muted-foreground">Manage your site logo and branding</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Logo</TabsTrigger>
          <TabsTrigger value="settings">Text Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Logo
              </CardTitle>
              <CardDescription>
                Upload a new logo image. Supported formats: JPEG, PNG, SVG (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Choose Logo File</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Logo Preview"
                      width={128}
                      height={64}
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || saving}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {saving ? 'Uploading...' : 'Upload Logo'}
                </Button>
                {settings.logoUrl && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Logo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Text Logo Settings
              </CardTitle>
              <CardDescription>
                Configure text logo appearance and styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-text">Logo Text</Label>
                  <Input
                    id="logo-text"
                    value={settings.logoText || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoText: e.target.value }))}
                    placeholder="Enter logo text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-font-size">Font Size (px)</Label>
                  <Input
                    id="logo-font-size"
                    type="number"
                    value={settings.logoFontSize || 24}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoFontSize: parseInt(e.target.value) || 24 }))}
                    min="12"
                    max="72"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-text-color">Text Color</Label>
                  <Input
                    id="logo-text-color"
                    type="color"
                    value={settings.logoTextColor || '#000000'}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoTextColor: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-bg-color">Background Color</Label>
                  <Input
                    id="logo-bg-color"
                    type="color"
                    value={settings.logoBackgroundColor || '#ffffff'}
                    onChange={(e) => setSettings(prev => ({ ...prev, logoBackgroundColor: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-display-mode">Display Mode</Label>
                  <Select
                    value={settings.logoDisplayMode || 'text'}
                    onValueChange={(value: 'image' | 'text') => 
                      setSettings(prev => ({ ...prev, logoDisplayMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="image">Image Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Logo Preview
              </CardTitle>
              <CardDescription>
                See how your logo will appear on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Current Logo</Label>
                  {renderLogoPreview()}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Display Mode:</strong> {settings.logoDisplayMode || 'text'}</p>
                  {settings.logoDisplayMode === 'text' && (
                    <>
                      <p><strong>Text:</strong> {settings.logoText || 'Newsly'}</p>
                      <p><strong>Font Size:</strong> {settings.logoFontSize || 24}px</p>
                      <p><strong>Text Color:</strong> {settings.logoTextColor || '#000000'}</p>
                      <p><strong>Background:</strong> {settings.logoBackgroundColor || '#ffffff'}</p>
                    </>
                  )}
                  {settings.logoDisplayMode === 'image' && settings.logoUrl && (
                    <p><strong>Image URL:</strong> {settings.logoUrl}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 