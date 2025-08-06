'use client';

import { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Eye, 
  Zap, 
  Smartphone, 
  Tablet, 
  Monitor,
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AdvancedLogoSettings {
  displayMode: 'image' | 'text' | 'hybrid' | 'responsive';
  logoText: string;
  logoTextColor: string;
  logoBackgroundColor: string;
  logoFontSize: number;
  logoFontWeight: string;
  logoPadding: number;
  logoBorderRadius: number;
  logoShadow: boolean;
  logoHoverEffect: boolean;
  logoAnimation: boolean;
  mobileScale: number;
  tabletScale: number;
  desktopScale: number;
  logoOpacity: number;
  lazyLoading: boolean;
  optimizeImages: boolean;
  trackLogoViews: boolean;
  trackLogoClicks: boolean;
}

interface AdvancedLogoSettingsProps {
  settings: AdvancedLogoSettings;
  onSettingsChange: (settings: AdvancedLogoSettings) => void;
  onSave: () => void;
  saving: boolean;
  hasChanges: boolean;
}

export function AdvancedLogoSettings({ 
  settings, 
  onSettingsChange, 
  onSave, 
  saving, 
  hasChanges 
}: AdvancedLogoSettingsProps) {
  const [activeTab, setActiveTab] = useState<'display' | 'responsive' | 'performance' | 'analytics'>('display');

  const handleInputChange = (field: keyof AdvancedLogoSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave();
    toast.success('Advanced logo settings saved successfully!');
  };

  const getPerformanceScore = () => {
    let score = 0;
    if (settings.lazyLoading) score += 30;
    if (settings.optimizeImages) score += 30;
    if (settings.logoOpacity === 100) score += 20;
    if (settings.logoShadow) score += 10;
    if (settings.logoHoverEffect) score += 10;
    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-blue-600">{getPerformanceScore()}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Responsive</p>
                <p className="text-2xl font-bold text-green-600">
                  {settings.displayMode === 'responsive' ? '100%' : '75%'}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-purple-600">
                  {hasChanges ? 'Modified' : 'Saved'}
                </p>
              </div>
              {hasChanges ? (
                <AlertCircle className="h-8 w-8 text-orange-500" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'display' | 'responsive' | 'performance' | 'analytics')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Responsive
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayMode">Display Mode</Label>
                <Select
                  value={settings.displayMode}
                  onValueChange={(value) => handleInputChange('displayMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image Only</SelectItem>
                    <SelectItem value="text">Text Only</SelectItem>
                    <SelectItem value="hybrid">Image + Text</SelectItem>
                    <SelectItem value="responsive">Responsive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoText">Logo Text</Label>
                <Input
                  id="logoText"
                  value={settings.logoText}
                  onChange={(e) => handleInputChange('logoText', e.target.value)}
                  placeholder="Enter logo text..."
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
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.logoFontSize]}
                      onValueChange={([value]) => handleInputChange('logoFontSize', value)}
                      max={72}
                      min={12}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.logoFontSize}px
                    </span>
                  </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="padding">Padding</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.logoPadding]}
                      onValueChange={([value]) => handleInputChange('logoPadding', value)}
                      max={32}
                      min={0}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.logoPadding}px
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.logoBorderRadius]}
                      onValueChange={([value]) => handleInputChange('logoBorderRadius', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.logoBorderRadius}px
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shadow Effect</Label>
                    <p className="text-sm text-gray-500">Add shadow</p>
                  </div>
                  <Switch
                    checked={settings.logoShadow}
                    onCheckedChange={(checked) => handleInputChange('logoShadow', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hover Effect</Label>
                    <p className="text-sm text-gray-500">Interactive hover</p>
                  </div>
                  <Switch
                    checked={settings.logoHoverEffect}
                    onCheckedChange={(checked) => handleInputChange('logoHoverEffect', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animation</Label>
                    <p className="text-sm text-gray-500">Entrance animation</p>
                  </div>
                  <Switch
                    checked={settings.logoAnimation}
                    onCheckedChange={(checked) => handleInputChange('logoAnimation', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Responsive Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <Label>Mobile Scale</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.mobileScale]}
                      onValueChange={([value]) => handleInputChange('mobileScale', value)}
                      max={1.2}
                      min={0.5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.mobileScale}x
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-5 w-5 text-green-500" />
                    <Label>Tablet Scale</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.tabletScale]}
                      onValueChange={([value]) => handleInputChange('tabletScale', value)}
                      max={1.2}
                      min={0.5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.tabletScale}x
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-500" />
                    <Label>Desktop Scale</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.desktopScale]}
                      onValueChange={([value]) => handleInputChange('desktopScale', value)}
                      max={1.2}
                      min={0.5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {settings.desktopScale}x
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Smartphone className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <p className="font-medium">Mobile</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(settings.logoFontSize * settings.mobileScale)}px
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Tablet className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="font-medium">Tablet</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(settings.logoFontSize * settings.tabletScale)}px
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Monitor className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p className="font-medium">Desktop</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(settings.logoFontSize * settings.desktopScale)}px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lazy Loading</Label>
                    <p className="text-sm text-gray-500">Load on demand</p>
                  </div>
                  <Switch
                    checked={settings.lazyLoading}
                    onCheckedChange={(checked) => handleInputChange('lazyLoading', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Optimize Images</Label>
                    <p className="text-sm text-gray-500">Compress automatically</p>
                  </div>
                  <Switch
                    checked={settings.optimizeImages}
                    onCheckedChange={(checked) => handleInputChange('optimizeImages', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opacity">Opacity</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.logoOpacity]}
                    onValueChange={([value]) => handleInputChange('logoOpacity', value)}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500 w-12">
                    {settings.logoOpacity}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Score</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPerformanceScore()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getPerformanceScore()}/100 - {getPerformanceScore() >= 80 ? 'Excellent' : getPerformanceScore() >= 60 ? 'Good' : 'Needs improvement'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Logo Views</Label>
                    <p className="text-sm text-gray-500">Monitor visibility</p>
                  </div>
                  <Switch
                    checked={settings.trackLogoViews}
                    onCheckedChange={(checked) => handleInputChange('trackLogoViews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Logo Clicks</Label>
                    <p className="text-sm text-gray-500">Monitor interactions</p>
                  </div>
                  <Switch
                    checked={settings.trackLogoClicks}
                    onCheckedChange={(checked) => handleInputChange('trackLogoClicks', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analytics Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Logo Views</span>
                    <Badge variant={settings.trackLogoViews ? "default" : "secondary"}>
                      {settings.trackLogoViews ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Logo Clicks</span>
                    <Badge variant={settings.trackLogoClicks ? "default" : "secondary"}>
                      {settings.trackLogoClicks ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="min-w-[120px]"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 