'use client';

import { useState } from 'react';
import { Settings, Palette, Type, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface LogoSettings {
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
}

interface LogoSettingsProps {
  settings: LogoSettings;
  onSettingsChange: (settings: LogoSettings) => void;
  onSave: () => void;
  saving: boolean;
  hasChanges: boolean;
}

export function LogoSettings({ 
  settings, 
  onSettingsChange, 
  onSave, 
  saving, 
  hasChanges 
}: LogoSettingsProps) {
  const [activeTab, setActiveTab] = useState<'display' | 'colors' | 'effects'>('display');

  const handleInputChange = (field: keyof LogoSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave();
    toast.success('Logo settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'display'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Eye className="h-4 w-4" />
          Display
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'colors'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          Colors
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'effects'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          Effects
        </button>
      </div>

      {/* Display Settings */}
      {activeTab === 'display' && (
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

            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.logoFontSize]}
                  onValueChange={([value]) => handleInputChange('logoFontSize', value)}
                  max={48}
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
          </CardContent>
        </Card>
      )}

      {/* Color Settings */}
      {activeTab === 'colors' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="h-20 rounded-lg border flex items-center justify-center"
                  style={{
                    backgroundColor: settings.logoBackgroundColor,
                    padding: `${settings.logoPadding}px`,
                    borderRadius: `${settings.logoBorderRadius}px`,
                  }}
                >
                  <span
                    style={{
                      color: settings.logoTextColor,
                      fontSize: `${settings.logoFontSize}px`,
                      fontWeight: settings.logoFontWeight,
                    }}
                  >
                    {settings.logoText || 'Logo'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dark Mode Preview</Label>
                <div
                  className="h-20 rounded-lg border flex items-center justify-center bg-gray-900"
                  style={{
                    backgroundColor: settings.logoBackgroundColor === '#ffffff' ? '#1f2937' : settings.logoBackgroundColor,
                    padding: `${settings.logoPadding}px`,
                    borderRadius: `${settings.logoBorderRadius}px`,
                  }}
                >
                  <span
                    style={{
                      color: settings.logoTextColor === '#000000' ? '#ffffff' : settings.logoTextColor,
                      fontSize: `${settings.logoFontSize}px`,
                      fontWeight: settings.logoFontWeight,
                    }}
                  >
                    {settings.logoText || 'Logo'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Effects Settings */}
      {activeTab === 'effects' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Effects Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Shadow Effect</Label>
                <p className="text-sm text-gray-500">
                  Add a subtle shadow to the logo
                </p>
              </div>
              <Switch
                checked={settings.logoShadow}
                onCheckedChange={(checked) => handleInputChange('logoShadow', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hover Effect</Label>
                <p className="text-sm text-gray-500">
                  Add hover animation to the logo
                </p>
              </div>
              <Switch
                checked={settings.logoHoverEffect}
                onCheckedChange={(checked) => handleInputChange('logoHoverEffect', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animation</Label>
                <p className="text-sm text-gray-500">
                  Add entrance animation to the logo
                </p>
              </div>
              <Switch
                checked={settings.logoAnimation}
                onCheckedChange={(checked) => handleInputChange('logoAnimation', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
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