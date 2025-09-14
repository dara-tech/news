'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Save,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  channelId: string;
  channelUsername: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTestAt?: string;
}

export default function TelegramNotificationPanel() {
  const [settings, setSettings] = useState<TelegramSettings>({
    enabled: false,
    botToken: '',
    channelId: '',
    channelUsername: '',
    status: 'disconnected'
  });
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchTelegramSettings();
  }, []);

  const fetchTelegramSettings = async () => {
    try {
      const response = await api.get('/admin/auto-publish/telegram-settings');
      setSettings(response.data.data);
    } catch (error) {}
  };

  const updateSettings = async (newSettings: Partial<TelegramSettings>) => {
    try {
      setSaving(true);
      const response = await api.put('/admin/auto-publish/telegram-settings', newSettings);
      
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        toast.success('Telegram settings updated successfully');
      }
    } catch (error) {toast.error('Failed to update Telegram settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const response = await api.post('/admin/auto-publish/test-telegram', {
        botToken: settings.botToken,
        channelId: settings.channelId
      });
      
      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'Test message sent successfully! Check your Telegram channel.'
        });
        toast.success('Telegram test successful');
      } else {
        setTestResult({
          success: false,
          message: response.data.message || 'Test failed'
        });
        toast.error('Telegram test failed');
      }
    } catch (error) {setTestResult({
        success: false,
        message: 'Failed to test Telegram connection'
      });
      toast.error('Failed to test Telegram connection');
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Telegram Configuration
          </CardTitle>
          <CardDescription>
            Configure Telegram bot for auto-publish notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Telegram Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications to Telegram when articles are auto-published
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-token">Bot Token</Label>
              <Input
                id="bot-token"
                type="password"
                value={settings.botToken}
                onChange={(e) => setSettings(prev => ({ ...prev, botToken: e.target.value }))}
                placeholder="Enter your Telegram bot token"
                disabled={!settings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                Get this from @BotFather on Telegram
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-id">Channel ID</Label>
              <Input
                id="channel-id"
                value={settings.channelId}
                onChange={(e) => setSettings(prev => ({ ...prev, channelId: e.target.value }))}
                placeholder="e.g., -1001234567890"
                disabled={!settings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                The numeric ID of your Telegram channel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-username">Channel Username</Label>
              <Input
                id="channel-username"
                value={settings.channelUsername}
                onChange={(e) => setSettings(prev => ({ ...prev, channelUsername: e.target.value }))}
                placeholder="e.g., @mychannel"
                disabled={!settings.enabled}
              />
              <p className="text-sm text-muted-foreground">
                The username of your Telegram channel (optional)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => updateSettings(settings)}
              disabled={saving || !settings.enabled}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              onClick={testConnection}
              disabled={testing || !settings.enabled || !settings.botToken || !settings.channelId}
              variant="outline"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status and Test Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(settings.status)}>
                {settings.status}
              </Badge>
            </div>
            
            {settings.lastTestAt && (
              <div className="text-sm text-muted-foreground">
                Last tested: {new Date(settings.lastTestAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult ? (
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
            ) : (
              <div className="text-sm text-muted-foreground">
                No test results yet. Click "Test Connection" to verify your setup.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">1. Create a Telegram Bot</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Open Telegram and search for @BotFather</li>
                <li>Send /newbot command</li>
                <li>Follow the instructions to create your bot</li>
                <li>Copy the bot token provided</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">2. Add Bot to Your Channel</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Go to your Telegram channel</li>
                <li>Add your bot as an administrator</li>
                <li>Give it permission to post messages</li>
                <li>Note down the channel ID (you can use @userinfobot to get it)</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">3. Configure Settings</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Enter the bot token in the field above</li>
                <li>Enter the channel ID (starts with -100)</li>
                <li>Optionally enter the channel username</li>
                <li>Save settings and test the connection</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Notification Preview
          </CardTitle>
          <CardDescription>
            Example of how notifications will appear in Telegram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2 text-sm">
              <div className="font-medium">📰 NEW ARTICLE PUBLISHED</div>
              <div className="font-semibold">Sample Article Title</div>
              <div className="text-muted-foreground">
                This is a sample description of the published article...
              </div>
              <div className="text-xs text-muted-foreground">
                📂 Category: Technology<br/>
                👤 Author: RazeWire<br/>
                📅 Published: {new Date().toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">
                #news #technology #razewire
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
