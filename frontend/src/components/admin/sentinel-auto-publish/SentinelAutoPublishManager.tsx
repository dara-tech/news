'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Bot,
  Newspaper,
  Send,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

// Import sub-components
import AutoPublishStats from './AutoPublishStats';
import AutoPublishSettings from './AutoPublishSettings';
import AutoPublishLogs from './AutoPublishLogs';
import TelegramNotificationPanel from './TelegramNotificationPanel';

interface AutoPublishStats {
  totalDrafts: number;
  totalPublished: number;
  todayPublished: number;
  telegramEnabled: boolean;
  lastRunAt?: string;
  isRunning: boolean;
}

interface AutoPublishSettings {
  enabled: boolean;
  autoPublishEnabled: boolean;
  telegramNotifications: boolean;
  minContentLength: number;
  maxDraftsPerRun: number;
  delayBetweenArticles: number;
  requireManualApproval: boolean;
  publishSchedule: 'immediate' | 'scheduled' | 'manual';
  scheduleTime?: string;
}

interface AutoPublishLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  articlesProcessed?: number;
  articlesPublished?: number;
  notificationsSent?: number;
}

export default function SentinelAutoPublishManager() {
  const [stats, setStats] = useState<AutoPublishStats>({
    totalDrafts: 0,
    totalPublished: 0,
    todayPublished: 0,
    telegramEnabled: false,
    isRunning: false
  });
  
  const [settings, setSettings] = useState<AutoPublishSettings>({
    enabled: false,
    autoPublishEnabled: false,
    telegramNotifications: true,
    minContentLength: 100,
    maxDraftsPerRun: 10,
    delayBetweenArticles: 2000,
    requireManualApproval: false,
    publishSchedule: 'manual'
  });
  
  const [logs, setLogs] = useState<AutoPublishLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/auto-publish/stats');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        // Set default stats if API returns unexpected format
        setStats({
          totalDrafts: 0,
          totalPublished: 0,
          todayPublished: 0,
          telegramEnabled: false,
          isRunning: false
        });
      }
    } catch (error) {
      console.error('Error fetching auto-publish stats:', error);
      // Set default stats on error
      setStats({
        totalDrafts: 0,
        totalPublished: 0,
        todayPublished: 0,
        telegramEnabled: false,
        isRunning: false
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/auto-publish/settings');
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
      } else {
        // Set default settings if API returns unexpected format
        setSettings({
          enabled: false,
          autoPublishEnabled: false,
          telegramNotifications: true,
          minContentLength: 100,
          maxDraftsPerRun: 10,
          delayBetweenArticles: 2000,
          requireManualApproval: false,
          publishSchedule: 'manual'
        });
      }
    } catch (error) {
      console.error('Error fetching auto-publish settings:', error);
      // Set default settings on error
      setSettings({
        enabled: false,
        autoPublishEnabled: false,
        telegramNotifications: true,
        minContentLength: 100,
        maxDraftsPerRun: 10,
        delayBetweenArticles: 2000,
        requireManualApproval: false,
        publishSchedule: 'manual'
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/auto-publish/logs');
      if (response.data.success && response.data.data) {
        setLogs(response.data.data);
      } else {
        // Set empty logs if API returns unexpected format
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching auto-publish logs:', error);
      // Set empty logs on error
      setLogs([]);
    }
  };

  const triggerAutoPublish = async () => {
    try {
      setIsRunning(true);
      setLoading(true);
      
      const response = await api.post('/admin/auto-publish/sentinel');
      
      if (response.data.success) {
        toast.success('Auto-publish process completed successfully!');
        await fetchStats();
        await fetchLogs();
      } else {
        toast.error('Auto-publish process failed');
      }
    } catch (error) {
      console.error('Error triggering auto-publish:', error);
      toast.error('Failed to trigger auto-publish process');
    } finally {
      setIsRunning(false);
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AutoPublishSettings>) => {
    try {
      const response = await api.put('/admin/auto-publish/settings', newSettings);
      
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Sentinel Auto-Publish System
              </CardTitle>
              <CardDescription>
                Automated publishing system for Sentinel-generated articles
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={triggerAutoPublish}
                disabled={loading || isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Auto-Publish
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  fetchStats();
                  fetchLogs();
                }}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drafts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrafts}</div>
            <p className="text-xs text-muted-foreground">
              Pending articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPublished}</div>
            <p className="text-xs text-muted-foreground">
              Auto-published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayPublished}</div>
            <p className="text-xs text-muted-foreground">
              Published today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram Status</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={stats.telegramEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {stats.telegramEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && <AutoPublishStats stats={stats} />}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {settings && <AutoPublishSettings 
            settings={settings} 
            onUpdate={updateSettings}
          />}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <AutoPublishLogs logs={logs || []} />
        </TabsContent>

        <TabsContent value="telegram" className="space-y-4">
          <TelegramNotificationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
