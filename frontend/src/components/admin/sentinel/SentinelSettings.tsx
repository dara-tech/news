'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface SentinelSettingsProps {
  config: any;
  onUpdate: () => void;
}

export default function SentinelSettings({ config, onUpdate }: SentinelSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enabled: config?.enabled || false,
    autoPersist: config?.autoPersist || false,
    frequencyMs: config?.frequencyMs || 1800000, // 30 minutes
    maxItemsPerRun: config?.maxItemsPerRun || 10,
    qualityThreshold: config?.qualityThreshold || 0.7,
    enableAIContentGeneration: config?.enableAIContentGeneration || true,
    enableDataQualityCheck: config?.enableDataQualityCheck || true,
    enableAutoPublish: config?.enableAutoPublish || false,
    enableNotifications: config?.enableNotifications || true,
    notificationEmail: config?.notificationEmail || '',
    customPrompt: config?.customPrompt || '',
    apiSettings: {
      geminiModel: config?.apiSettings?.geminiModel || 'gemini-2.5-flash',
      maxTokens: config?.apiSettings?.maxTokens || 2000,
      temperature: config?.apiSettings?.temperature || 0.7,
      timeout: config?.apiSettings?.timeout || 30000
    }
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/admin/system/sentinel', settings);
      
      if (response.data?.success) {
        toast.success('Settings saved successfully');
        onUpdate();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      enabled: config?.enabled || false,
      autoPersist: config?.autoPersist || false,
      frequencyMs: config?.frequencyMs || 1800000,
      maxItemsPerRun: config?.maxItemsPerRun || 10,
      qualityThreshold: config?.qualityThreshold || 0.7,
      enableAIContentGeneration: config?.enableAIContentGeneration || true,
      enableDataQualityCheck: config?.enableDataQualityCheck || true,
      enableAutoPublish: config?.enableAutoPublish || false,
      enableNotifications: config?.enableNotifications || true,
      notificationEmail: config?.notificationEmail || '',
      customPrompt: config?.customPrompt || '',
      apiSettings: {
        geminiModel: config?.apiSettings?.geminiModel || 'gemini-2.5-flash',
        maxTokens: config?.apiSettings?.maxTokens || 2000,
        temperature: config?.apiSettings?.temperature || 0.7,
        timeout: config?.apiSettings?.timeout || 30000
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>General Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Enable Sentinel</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically process news sources
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoPersist">Auto Persist</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save generated content
                </p>
              </div>
              <Switch
                id="autoPersist"
                checked={settings.autoPersist}
                onCheckedChange={(checked) => setSettings({ ...settings, autoPersist: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Run Frequency (minutes)</Label>
              <Input
                id="frequency"
                type="number"
                value={Math.round(settings.frequencyMs / 60000)}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  frequencyMs: Number(e.target.value) * 60000 
                })}
                min="1"
                max="1440"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxItems">Max Items Per Run</Label>
              <Input
                id="maxItems"
                type="number"
                value={settings.maxItemsPerRun}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  maxItemsPerRun: Number(e.target.value) 
                })}
                min="1"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>AI Content Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAI">Enable AI Content Generation</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to generate article content
              </p>
            </div>
            <Switch
              id="enableAI"
              checked={settings.enableAIContentGeneration}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                enableAIContentGeneration: checked 
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="geminiModel">Gemini Model</Label>
              <Select
                value={settings.apiSettings.geminiModel}
                onValueChange={(value) => setSettings({ 
                  ...settings, 
                  apiSettings: { ...settings.apiSettings, geminiModel: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={settings.apiSettings.maxTokens}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  apiSettings: { ...settings.apiSettings, maxTokens: Number(e.target.value) }
                })}
                min="100"
                max="8000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                value={settings.apiSettings.temperature}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  apiSettings: { ...settings.apiSettings, temperature: Number(e.target.value) }
                })}
                min="0"
                max="2"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={settings.apiSettings.timeout}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  apiSettings: { ...settings.apiSettings, timeout: Number(e.target.value) }
                })}
                min="5000"
                max="120000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Prompt</Label>
            <Textarea
              id="customPrompt"
              value={settings.customPrompt}
              onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
              placeholder="Enter custom prompt for AI content generation..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Quality & Publishing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableQualityCheck">Enable Data Quality Check</Label>
              <p className="text-sm text-muted-foreground">
                Validate content quality before processing
              </p>
            </div>
            <Switch
              id="enableQualityCheck"
              checked={settings.enableDataQualityCheck}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                enableDataQualityCheck: checked 
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableAutoPublish">Enable Auto Publish</Label>
              <p className="text-sm text-muted-foreground">
                Automatically publish generated content
              </p>
            </div>
            <Switch
              id="enableAutoPublish"
              checked={settings.enableAutoPublish}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                enableAutoPublish: checked 
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityThreshold">Quality Threshold (0-1)</Label>
            <Input
              id="qualityThreshold"
              type="number"
              value={settings.qualityThreshold}
              onChange={(e) => setSettings({ 
                ...settings, 
                qualityThreshold: Number(e.target.value) 
              })}
              min="0"
              max="1"
              step="0.1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications for important events
              </p>
            </div>
            <Switch
              id="enableNotifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                enableNotifications: checked 
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Notification Email</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={settings.notificationEmail}
              onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
              placeholder="admin@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
