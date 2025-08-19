'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RefreshCw, TestTube, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Linkedin } from 'lucide-react';

interface LinkedInConfigProps {
  settings: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    accessToken: string;
    refreshToken: string;
    organizationId: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  showSecrets: boolean;
  testing: string | null;
  onSettingChange: (field: string, value: any) => void;
  onTestConnection: () => void;
  onToggleSecrets: () => void;
  onCopyToClipboard: (text: string) => void;
}

export default function LinkedInConfig({
  settings,
  showSecrets,
  testing,
  onSettingChange,
  onTestConnection,
  onToggleSecrets,
  onCopyToClipboard
}: LinkedInConfigProps) {
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
          <Linkedin className="h-5 w-5 text-blue-700" />
          LinkedIn Auto-Posting
        </CardTitle>
        <CardDescription>
          Configure LinkedIn auto-posting settings (requires LinkedIn Developer account)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable LinkedIn Auto-Posting</Label>
            <p className="text-sm text-muted-foreground">
              Automatically post to your LinkedIn profile or company page
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input
              value={settings.clientId}
              onChange={(e) => onSettingChange('clientId', e.target.value)}
              placeholder="LinkedIn Client ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input
              value={settings.organizationId}
              onChange={(e) => onSettingChange('organizationId', e.target.value)}
              placeholder="LinkedIn Organization ID"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Client Secret</Label>
          <div className="relative">
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={settings.clientSecret}
              onChange={(e) => onSettingChange('clientSecret', e.target.value)}
              placeholder="LinkedIn Client Secret"
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
              placeholder="LinkedIn Access Token"
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
        
        <div className="space-y-2">
          <Label>Refresh Token</Label>
          <div className="relative">
            <Input
              type={showSecrets ? 'text' : 'password'}
              value={settings.refreshToken}
              onChange={(e) => onSettingChange('refreshToken', e.target.value)}
              placeholder="LinkedIn Refresh Token"
            />
            <div className="absolute right-0 top-0 h-full flex">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-3"
                onClick={() => onCopyToClipboard(settings.refreshToken)}
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
            disabled={testing === 'linkedin'}
            variant="outline"
          >
            {testing === 'linkedin' ? (
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
        
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">LinkedIn Setup Guide</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>1. Go to <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn Developers</a></li>
            <li>2. Create a new app or use existing one</li>
            <li>3. Add OAuth 2.0 redirect URLs</li>
            <li>4. Request access to "Marketing Developer Platform"</li>
            <li>5. Get Client ID and Client Secret</li>
            <li>6. Generate Access Token with required permissions</li>
            <li>7. Add your Organization ID (for company pages)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}



