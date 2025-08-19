'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface AutoPublishSettingsProps {
  settings: {
    enabled: boolean;
    autoPublishEnabled: boolean;
    telegramNotifications: boolean;
    minContentLength: number;
    maxDraftsPerRun: number;
    delayBetweenArticles: number;
    requireManualApproval: boolean;
    publishSchedule: 'immediate' | 'scheduled' | 'manual';
    scheduleTime?: string;
  };
  onUpdate: (settings: any) => void;
}

export default function AutoPublishSettings({ settings, onUpdate }: AutoPublishSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(localSettings);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure the basic auto-publish system behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Auto-Publish System</Label>
              <p className="text-sm text-muted-foreground">
                Master switch to enable or disable the entire auto-publish system
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Publish Articles</Label>
              <p className="text-sm text-muted-foreground">
                Automatically publish Sentinel-generated drafts without manual intervention
              </p>
            </div>
            <Switch
              checked={localSettings.autoPublishEnabled}
              onCheckedChange={(checked) => handleSettingChange('autoPublishEnabled', checked)}
              disabled={!localSettings.enabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Require Manual Approval</Label>
              <p className="text-sm text-muted-foreground">
                Require manual approval before publishing articles
              </p>
            </div>
            <Switch
              checked={localSettings.requireManualApproval}
              onCheckedChange={(checked) => handleSettingChange('requireManualApproval', checked)}
              disabled={!localSettings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishing Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Publishing Schedule
          </CardTitle>
          <CardDescription>
            Configure when and how often articles should be published
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Publishing Mode</Label>
            <Select
              value={localSettings.publishSchedule}
              onValueChange={(value) => handleSettingChange('publishSchedule', value)}
              disabled={!localSettings.enabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select publishing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Only</SelectItem>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how articles should be published
            </p>
          </div>

          {localSettings.publishSchedule === 'scheduled' && (
            <div className="space-y-2">
              <Label>Schedule Time</Label>
              <Input
                type="time"
                value={localSettings.scheduleTime || '09:00'}
                onChange={(e) => handleSettingChange('scheduleTime', e.target.value)}
                disabled={!localSettings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                Time of day to run auto-publish (24-hour format)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Content Requirements
          </CardTitle>
          <CardDescription>
            Set minimum requirements for articles to be auto-published
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Content Length</Label>
              <Input
                type="number"
                value={localSettings.minContentLength}
                onChange={(e) => handleSettingChange('minContentLength', parseInt(e.target.value))}
                min="50"
                max="10000"
                disabled={!localSettings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                Minimum characters required in article content
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Drafts Per Run</Label>
              <Input
                type="number"
                value={localSettings.maxDraftsPerRun}
                onChange={(e) => handleSettingChange('maxDraftsPerRun', parseInt(e.target.value))}
                min="1"
                max="50"
                disabled={!localSettings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of drafts to process in one run
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delay Between Articles (ms)</Label>
            <Input
              type="number"
              value={localSettings.delayBetweenArticles}
              onChange={(e) => handleSettingChange('delayBetweenArticles', parseInt(e.target.value))}
              min="0"
              max="10000"
              step="100"
              disabled={!localSettings.enabled}
            />
            <p className="text-sm text-muted-foreground">
              Delay between processing each article (milliseconds)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure notification settings for auto-publish activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Telegram Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications to Telegram when articles are published
              </p>
            </div>
            <Switch
              checked={localSettings.telegramNotifications}
              onCheckedChange={(checked) => handleSettingChange('telegramNotifications', checked)}
              disabled={!localSettings.enabled}
            />
          </div>

          {localSettings.telegramNotifications && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Telegram Configuration Required</div>
                  <div className="text-sm text-blue-700">
                    Make sure to configure Telegram bot token and channel ID in the Telegram settings tab.
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {localSettings.enabled ? 'System Enabled' : 'System Disabled'}
              </Badge>
              {localSettings.autoPublishEnabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Auto-Publish Active
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
