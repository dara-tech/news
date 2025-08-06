'use client';

import { useState, useEffect } from 'react';
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
  Image,
  Type,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { SimpleLogoManager } from '@/components/admin/logo/SimpleLogoManager';

interface LogoSettings {
  logoDisplayMode?: 'image' | 'text';
  logoText?: string;
  logoUrl?: string;
  logoTextColor?: string;
  logoBackgroundColor?: string;
  logoFontSize?: number;
}

export default function LogoSettingsPage() {
  const { user } = useAuth();
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
    } catch (error: any) {
      console.error('Error fetching logo settings:', error);
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
    } catch (error: any) {
      console.error('Upload error:', error);
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
    } catch (error: any) {
      console.error('Error saving logo settings:', error);
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
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete logo');
    } finally {
      setSaving(false);
    }
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
 <div>
            <SimpleLogoManager 
        onLogoChange={(logoText) => {
          setSettings(prev => ({ ...prev, logoText }));
          toast.success('Logo text updated successfully!');
        }}
      />
    </div>
  );
} 