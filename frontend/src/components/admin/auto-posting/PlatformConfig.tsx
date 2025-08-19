'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TestTube, Eye, EyeOff, Copy } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PlatformConfigProps {
  platform: string;
  name: string;
  icon: LucideIcon;
  color: string;
  settings: {
    enabled: boolean;
    appId: string;
    appSecret: string;
    pageId: string;
    accessToken: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  showSecrets: boolean;
  testing: string | null;
  onSettingChange: (field: string, value: any) => void;
  onTestConnection: () => void;
  onToggleSecrets: () => void;
  onCopyToClipboard: (text: string) => void;
}

export default function PlatformConfig({
  platform,
  name,
  icon: Icon,
  color,
  settings,
  showSecrets,
  testing,
  onSettingChange,
  onTestConnection,
  onToggleSecrets,
  onCopyToClipboard
}: PlatformConfigProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {name} Auto-Posting
        </CardTitle>
        <CardDescription>
          Configure {name} auto-posting settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable {name} Auto-Posting</Label>
            <p className="text-sm text-muted-foreground">
              Automatically post to your {name} account
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>App ID</Label>
            <Input
              value={settings.appId}
              onChange={(e) => onSettingChange('appId', e.target.value)}
              placeholder={`${name} App ID`}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Page ID</Label>
            <Input
              value={settings.pageId}
              onChange={(e) => onSettingChange('pageId', e.target.value)}
              placeholder={`${name} Page ID`}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>App Secret</Label>
          <div className="relative">
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={settings.appSecret}
              onChange={(e) => onSettingChange('appSecret', e.target.value)}
              placeholder={`${name} App Secret`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={onToggleSecrets}
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Access Token</Label>
          <div className="relative">
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={settings.accessToken}
              onChange={(e) => onSettingChange('accessToken', e.target.value)}
              placeholder={`${name} Access Token`}
            />
            <div className="absolute right-0 top-0 h-full flex">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-3"
                onClick={() => onCopyToClipboard(settings.accessToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-3"
                onClick={onToggleSecrets}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onTestConnection}
            disabled={testing === platform}
            variant="outline"
          >
            {testing === platform ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(settings.status)}`} />
            <span className="text-sm">{getStatusText(settings.status)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



