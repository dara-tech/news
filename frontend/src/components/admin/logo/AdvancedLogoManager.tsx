'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Settings, 
  History, 
  BarChart3, 
  Download, 
  Zap,
  Eye,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { LogoUpload } from './LogoUpload';
import { LogoGenerator } from './LogoGenerator';
import { EnhancedLogoSettings } from './EnhancedLogoSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogoVersion {
  id: string;
  url: string;
  version: number;
  createdAt: string;
  changes: string;
  isActive: boolean;
}

interface LogoAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  performance: number;
  lastUpdated: string;
}

interface AdvancedLogoManagerProps {
  onLogoChange?: (logoUrl: string) => void;
}

export function AdvancedLogoManager({ onLogoChange }: AdvancedLogoManagerProps) {
  const [activeTab, setActiveTab] = useState('generator');
  const [currentLogo, setCurrentLogo] = useState<any>(null);
  const [logoVersions, setLogoVersions] = useState<LogoVersion[]>([]);
  const [logoAnalytics, setLogoAnalytics] = useState<LogoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogoData();
  }, []);

  const fetchLogoData = async () => {
    try {
      setLoading(true);
      
      const logoResponse = await api.get('/admin/settings/logo');
      if (logoResponse.data.success) {
        setCurrentLogo(logoResponse.data.logo);
      }

      const versionsResponse = await api.get('/admin/settings/logo/versions');
      if (versionsResponse.data.success) {
        setLogoVersions(versionsResponse.data.versions || []);
      }

      const analyticsResponse = await api.get('/admin/settings/logo/analytics');
      if (analyticsResponse.data.success) {
        setLogoAnalytics(analyticsResponse.data.analytics);
      }

    } catch (error) {toast.error('Failed to load logo data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = useCallback((logoUrl: string) => {
    setCurrentLogo({ url: logoUrl });
    onLogoChange?.(logoUrl);
    
    const newVersion: LogoVersion = {
      id: `version-${Date.now()}`,
      url: logoUrl,
      version: logoVersions.length + 1,
      createdAt: new Date().toISOString(),
      changes: 'Logo uploaded',
      isActive: true,
    };
    
    setLogoVersions(prev => [newVersion, ...prev]);
    toast.success('Logo uploaded and version created!');
  }, [logoVersions.length, onLogoChange]);

  const handleLogoGenerated = useCallback((logoUrl: string) => {
    setCurrentLogo({ url: logoUrl });
    onLogoChange?.(logoUrl);
    toast.success('AI-generated logo applied!');
  }, [onLogoChange]);

  const handleVersionRestore = async (version: LogoVersion) => {
    try {
      await api.post(`/admin/settings/logo/versions/${version.id}/restore`);
      setCurrentLogo({ url: version.url });
      onLogoChange?.(version.url);
      toast.success(`Restored to version ${version.version}`);
    } catch (error) {toast.error('Failed to restore version');
    }
  };

  const handleLogoOptimize = async () => {
    try {
      const response = await api.post('/admin/settings/logo/optimize');
      if (response.data.success) {
        setCurrentLogo(response.data.logo);
        onLogoChange?.(response.data.logo.url);
        toast.success('Logo optimized successfully!');
      }
    } catch (error) {toast.error('Failed to optimize logo');
    }
  };

  const handleLogoExport = async (format: 'svg' | 'png' | 'jpg' | 'webp') => {
    try {
      const response = await api.get(`/admin/settings/logo/export?format=${format}`);
      const blob = new Blob([response.data], { type: `image/${format}` });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logo-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Logo exported as ${format.toUpperCase()}`);
    } catch (error) {toast.error('Failed to export logo');
    }
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
          <h2 className="text-2xl font-bold">Advanced Logo Management</h2>
          <p className="text-muted-foreground">Professional logo management with AI generation, version control, and analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogoOptimize}
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
          
          <Select onValueChange={(value) => handleLogoExport(value as 'svg' | 'png' | 'jpg' | 'webp')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="svg">SVG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {logoAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Views</p>
                  <p className="text-2xl font-bold">{logoAnalytics.views.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                  <p className="text-2xl font-bold">{logoAnalytics.clicks.toLocaleString()}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">{logoAnalytics.conversions.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Performance</p>
                  <p className="text-2xl font-bold">{logoAnalytics.performance}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <LogoGenerator onLogoGenerated={handleLogoGenerated} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <LogoUpload 
            onUploadSuccess={handleLogoUpload}
            currentLogo={currentLogo}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <EnhancedLogoSettings 
            settings={{
              displayMode: 'responsive',
              logoText: 'Newsly',
              logoTextColor: '#000000',
              logoBackgroundColor: '#ffffff',
              logoFontSize: 24,
              logoFontWeight: 'bold',
              logoPadding: 8,
              logoBorderRadius: 4,
              logoShadow: true,
              logoHoverEffect: true,
              logoAnimation: false,
              mobileScale: 0.8,
              tabletScale: 0.9,
              desktopScale: 1.0,
              logoOpacity: 100,
              lazyLoading: true,
              optimizeImages: true,
              trackLogoViews: true,
              trackLogoClicks: true,
            }}
            onSettingsChange={() => {}}
            onSave={() => {}}
            saving={false}
            hasChanges={false}
          />
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Logo Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logoVersions.length > 0 ? (
                <div className="space-y-4">
                  {logoVersions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={version.url}
                          alt={`Version ${version.version}`}
                          className="h-12 w-12 object-contain border rounded"
                        />
                        <div>
                          <p className="font-medium">Version {version.version}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{version.changes}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {version.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVersionRestore(version)}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No version history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 