'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface GlobalSettingsProps {
  settings: {
    autoPostEnabled: boolean;
    autoPostDelay: number;
    autoPostSchedule: 'immediate' | 'scheduled' | 'manual';
  };
  onSettingChange: (setting: string, value: any) => void;
}

export default function GlobalSettings({ settings, onSettingChange }: GlobalSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Global Auto-Posting Settings
        </CardTitle>
        <CardDescription>
          Configure the overall auto-posting behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Auto-Posting</Label>
            <p className="text-sm text-muted-foreground">
              Automatically post new articles to social media
            </p>
          </div>
          <Switch
            checked={settings.autoPostEnabled}
            onCheckedChange={(checked) => onSettingChange('autoPostEnabled', checked)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Posting Schedule</Label>
            <Select
              value={settings.autoPostSchedule}
              onValueChange={(value: 'immediate' | 'scheduled' | 'manual') => 
                onSettingChange('autoPostSchedule', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Posting Delay (seconds)</Label>
            <Input
              type="number"
              value={settings.autoPostDelay}
              onChange={(e) => onSettingChange('autoPostDelay', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


