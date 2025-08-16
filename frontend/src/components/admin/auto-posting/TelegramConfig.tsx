'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Bot, 
  Hash, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Settings,
  TestTube
} from 'lucide-react';
import api from '@/lib/api';

interface TelegramConfigProps {
  settings: any;
  onUpdate: (updates: any) => void;
  onTestConnection?: () => void;
  testing?: boolean;
  loading?: boolean;
}

export default function TelegramConfig({ settings, onUpdate, onTestConnection, testing, loading }: TelegramConfigProps) {
  const [localTesting, setLocalTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Debug effect to log settings changes
  useEffect(() => {
    console.log('TelegramConfig settings changed:', settings);
    console.log('TelegramConfig enabled:', settings.enabled);
    console.log('TelegramConfig loading:', loading);
  }, [settings, loading]);

  const handleToggle = async (enabled: boolean) => {
    try {
      setSaving(true);
      await onUpdate({ telegramEnabled: enabled });
    } catch (error) {
      console.error('Error updating Telegram enabled status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    try {
      setSaving(true);
      await onUpdate({ [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setSaving(false);
    }
  };

  const testTelegramConnection = async () => {
    try {
      setLocalTesting(true);
      setTestResult(null);

      const response = await api.post('/admin/settings/social-media/test', {
        platform: 'telegram'
      });

      setTestResult(response.data);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Test failed'
      });
    } finally {
      setLocalTesting(false);
    }
  };

  const getChannelUrl = () => {
    if (settings.channelUsername) {
      return `https://t.me/${settings.channelUsername.replace('@', '')}`;
    }
    return null;
  };

  const channelUrl = getChannelUrl();

  // Debug logging
  console.log('TelegramConfig settings:', settings);
  console.log('TelegramConfig enabled:', settings.enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          Telegram Configuration
        </CardTitle>
        <CardDescription>
          Configure Telegram bot and channel for auto-posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Telegram Auto-Posting</Label>
            <p className="text-sm text-muted-foreground">
              Automatically post articles to your Telegram channel
            </p>
            {loading && (
              <p className="text-xs text-blue-500">Loading settings...</p>
            )}
          </div>
          <Switch
            checked={settings.enabled || false}
            onCheckedChange={handleToggle}
            disabled={saving || loading}
          />
        </div>

        <Separator />

        {/* Bot Token Configuration */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="telegramBotToken" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Bot Token
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Your Telegram bot token from @BotFather
            </p>
            <Input
              id="telegramBotToken"
              type="password"
              value={settings.botToken || ''}
              onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              disabled={saving}
            />
            {settings.botToken && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Bot token configured</span>
              </div>
            )}
          </div>

          {/* Channel ID Configuration */}
          <div>
            <Label htmlFor="telegramChannelId" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Channel ID
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Your Telegram channel ID (e.g., -1001234567890)
            </p>
            <Input
              id="telegramChannelId"
              value={settings.channelId || ''}
              onChange={(e) => handleInputChange('telegramChannelId', e.target.value)}
              placeholder="-1001234567890"
              disabled={saving}
            />
            {settings.channelId && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Channel ID configured</span>
              </div>
            )}
          </div>

          {/* Channel Username Configuration */}
          <div>
            <Label htmlFor="telegramChannelUsername" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Channel Username (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Your Telegram channel username for generating post URLs
            </p>
            <Input
              id="telegramChannelUsername"
              value={settings.channelUsername || ''}
              onChange={(e) => handleInputChange('telegramChannelUsername', e.target.value)}
              placeholder="@razewire"
              disabled={saving}
            />
            {settings.channelUsername && (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Channel username configured</span>
              </div>
            )}
          </div>
        </div>

        {/* Channel Link */}
        {channelUrl && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Channel:</span>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {channelUrl}
            </a>
          </div>
        )}

        {/* Setup Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Create a Telegram bot using @BotFather</li>
              <li>Create a Telegram channel</li>
              <li>Add your bot as administrator to the channel</li>
              <li>Get the channel ID using @userinfobot</li>
              <li>Configure the credentials above</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Test Connection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Test Connection</h4>
              <p className="text-sm text-muted-foreground">
                Test your Telegram configuration
              </p>
            </div>
            <Button
              onClick={testTelegramConnection}
              disabled={localTesting || !settings.botToken || !settings.channelId}
              variant="outline"
              size="sm"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {localTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {settings.enabled ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="secondary">
              Disabled
            </Badge>
          )}
        </div>

        {/* Configuration Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.botToken ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Bot Token</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.channelId ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Channel ID</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span>Auto-Posting</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
