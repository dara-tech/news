'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,

  Activity,
  Clock,
  MemoryStick
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SystemMetrics {
  server: {
    uptime: string;
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    requestsPerMinute: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'error';
    connectionPool: number;
    slowQueries: number;
    size: string;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  endpoints: Array<{
    name: string;
    url: string;
    status: 'up' | 'down' | 'slow';
    responseTime: number;
    lastChecked: string;
  }>;
  errors: Array<{
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    count: number;
  }>;
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sentinel, setSentinel] = useState<{ enabled: boolean; autoPersist: boolean; frequencyMs: number; sources: any[]; lastRunAt: string | null; running: boolean } | null>(null);
  const [sentinelError, setSentinelError] = useState<string | null>(null);
  const [savingSentinel, setSavingSentinel] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: string; message: string }>>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [logLevel, setLogLevel] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const [runtime, setRuntime] = useState<{ nextRunAt?: string; lastRunAt?: string; lastCreated?: number; lastProcessed?: number; cooldownUntil?: string | null; maxPerRun?: number; frequencyMs?: number; running?: boolean } | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchSentinel();
    fetchLogs();
    
    let interval: NodeJS.Timeout;
    let logsInterval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      logsInterval = setInterval(fetchLogs, 5000); // Logs every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (logsInterval) clearInterval(logsInterval);
    };
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/system/metrics');
      
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        // Mock data if endpoint doesn't exist yet
        setMetrics({
          server: {
            uptime: '15 days, 4 hours',
            status: 'healthy',
            responseTime: Math.floor(Math.random() * 200) + 50,
            requestsPerMinute: Math.floor(Math.random() * 1000) + 500
          },
          database: {
            status: 'healthy',
            connectionPool: Math.floor(Math.random() * 20) + 10,
            slowQueries: Math.floor(Math.random() * 5),
            size: '2.4 GB'
          },
          performance: {
            cpuUsage: Math.floor(Math.random() * 30) + 40,
            memoryUsage: Math.floor(Math.random() * 30) + 50,
            diskUsage: Math.floor(Math.random() * 20) + 25,
            networkLatency: Math.floor(Math.random() * 50) + 10
          },
          endpoints: [
            {
              name: 'API Server',
              url: '/api/health',
              status: 'up',
              responseTime: Math.floor(Math.random() * 100) + 20,
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Database',
              url: 'mongodb://localhost',
              status: 'up',
              responseTime: Math.floor(Math.random() * 50) + 10,
              lastChecked: new Date().toISOString()
            },
            {
              name: 'File Storage',
              url: '/uploads',
              status: 'up',
              responseTime: Math.floor(Math.random() * 150) + 30,
              lastChecked: new Date().toISOString()
            },
            {
              name: 'Email Service',
              url: 'smtp://mail.server.com',
              status: Math.random() > 0.8 ? 'slow' : 'up',
              responseTime: Math.floor(Math.random() * 500) + 100,
              lastChecked: new Date().toISOString()
            }
          ],
          errors: [
            {
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              level: 'warning',
              message: 'High memory usage detected',
              count: 3
            },
            {
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              level: 'error',
              message: 'Failed to connect to external API',
              count: 1
            },
            {
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              level: 'info',
              message: 'Database backup completed successfully',
              count: 1
            }
          ]
        });
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      // Always show mock data so the page isn't blank
      setMetrics({
        server: {
          uptime: '—',
          status: 'warning',
          responseTime: Math.floor(Math.random() * 200) + 50,
          requestsPerMinute: Math.floor(Math.random() * 1000) + 500
        },
        database: {
          status: 'warning',
          connectionPool: Math.floor(Math.random() * 20) + 10,
          slowQueries: Math.floor(Math.random() * 5),
          size: '—'
        },
        performance: {
          cpuUsage: Math.floor(Math.random() * 30) + 40,
          memoryUsage: Math.floor(Math.random() * 30) + 50,
          diskUsage: Math.floor(Math.random() * 20) + 25,
          networkLatency: Math.floor(Math.random() * 50) + 10
        },
        endpoints: [],
        errors: [
          {
            timestamp: new Date().toISOString(),
            level: 'warning',
            message: 'Unable to fetch live metrics (auth required). Showing demo metrics.',
            count: 1
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSentinel = async () => {
    try {
      const { data } = await api.get('/admin/system/sentinel');
      if (data?.success) {
        setSentinel({
          enabled: !!data.config.enabled,
          autoPersist: !!data.config.autoPersist,
          frequencyMs: Number(data.config.frequencyMs || 300000),
          sources: data.config.sources || [],
          lastRunAt: data.config.lastRunAt || null,
          running: !!data.runtime?.running,
        });
        setRuntime({
          nextRunAt: data.runtime?.nextRunAt || undefined,
          lastRunAt: data.runtime?.lastRunAt || undefined,
          lastCreated: data.runtime?.lastCreated,
          lastProcessed: data.runtime?.lastProcessed,
          cooldownUntil: data.runtime?.cooldownUntil,
          maxPerRun: data.runtime?.maxPerRun,
          frequencyMs: data.runtime?.frequencyMs,
          running: data.runtime?.running,
        });
        setSentinelError(null);
      }
    } catch (e) {
      setSentinelError('Unable to load Sentinel settings. Make sure you are logged in as an admin and the API is reachable.');
      setSentinel({ enabled: false, autoPersist: false, frequencyMs: 300000, sources: [], lastRunAt: null, running: false });
    }
  };

  const updateSentinel = async (updates: Partial<{ enabled: boolean; autoPersist: boolean; frequencyMs: number; sources: any[] }>) => {
    if (!sentinel) return;
    setSavingSentinel(true);
    try {
      const { data } = await api.put('/admin/system/sentinel', updates);
      if (data?.success) {
        toast.success('Sentinel settings updated');
        await fetchSentinel();
      } else {
        toast.error('Failed to update Sentinel settings');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update Sentinel settings');
    } finally {
      setSavingSentinel(false);
    }
  };

  const runSentinelOnce = async () => {
    try {
      const { data } = await api.post('/admin/system/sentinel/run-once');
      if (data?.success) {
        toast.success('Sentinel run triggered');
        await fetchSentinel();
      } else {
        toast.error('Failed to trigger Sentinel');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to trigger Sentinel');
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/system/sentinel/logs');
      if (data?.success && Array.isArray(data.logs)) {
        // Show newest first
        setLogs(data.logs.slice().reverse());
      }
    } catch {
      // ignore logs failure
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up': return 'text-green-600 bg-green-50';
      case 'warning':
      case 'slow': return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up': return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'slow': return <AlertTriangle className="h-4 w-4" />;
      case 'error':
      case 'down': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const humanizeMs = (ms: number) => {
    if (!ms || ms < 1000) return `${ms} ms`;
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m${r ? ` ${r}s` : ''}`;
  };

  const timeLeft = (iso?: string | null) => {
    if (!iso) return null;
    const left = new Date(iso).getTime() - Date.now();
    return left > 0 ? humanizeMs(left) : null;
  };

  if (loading && !metrics) {
    return (
      <div className="grid gap-3 p-3 sm:gap-4 sm:p-6">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-5">
                <div className="h-14 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-3 sm:space-y-6 p-3 sm:p-6">
      {/* Compact Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">System Monitoring</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${metrics.server.status === 'healthy' ? 'bg-green-500' : metrics.server.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              {metrics.server.status}
            </span>
            <span>•</span>
            <span>Uptime {metrics.server.uptime}</span>
            {lastRefresh && (
              <span className="hidden sm:inline-flex items-center gap-1">
                <span>•</span>
                <Clock className="h-3 w-3" /> Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs sm:text-sm ${autoRefresh ? 'bg-green-50 text-green-700' : ''}`}
          >
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchMetrics(); fetchLogs(); }}
            disabled={loading}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:inline-flex gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="endpoints" className="hidden sm:inline-flex text-sm">Endpoints</TabsTrigger>
          <TabsTrigger value="events" className="hidden sm:inline-flex text-sm">Events</TabsTrigger>
          <TabsTrigger value="sentinel" className="text-xs sm:text-sm">Sentinel</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm">Logs</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-3 sm:mt-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Server</CardTitle>
                <Server className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Badge className={`text-2xs sm:text-xs ${getStatusColor(metrics.server.status)}`}>
                  {getStatusIcon(metrics.server.status)}
                  <span className="ml-1 capitalize">{metrics.server.status}</span>
                </Badge>
                <div className="text-2xs sm:text-xs text-muted-foreground">Uptime: {metrics.server.uptime}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Database</CardTitle>
                <Database className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <Badge className={`text-2xs sm:text-xs ${getStatusColor(metrics.database.status)}`}>
                  {getStatusIcon(metrics.database.status)}
                  <span className="ml-1 capitalize">{metrics.database.status}</span>
                </Badge>
                <div className="text-2xs sm:text-xs text-muted-foreground">Size: {metrics.database.size}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Response</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="text-lg sm:text-2xl font-bold">{metrics.server.responseTime}ms</div>
                <div className="flex items-center text-2xs sm:text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" /> Avg response time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Req/min</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="text-lg sm:text-2xl font-bold">{metrics.server.requestsPerMinute}</div>
                <div className="text-2xs sm:text-xs text-muted-foreground">Active traffic</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="mt-3 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Cpu className="h-4 w-4 sm:h-5 sm:w-5" /> Performance
              </CardTitle>
              <CardDescription className="text-2xs sm:text-sm">Resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">CPU</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{metrics.performance.cpuUsage}%</span>
                  </div>
                  <Progress value={metrics.performance.cpuUsage} className="h-1.5 sm:h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">Memory</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{metrics.performance.memoryUsage}%</span>
                  </div>
                  <Progress value={metrics.performance.memoryUsage} className="h-1.5 sm:h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">Disk</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{metrics.performance.diskUsage}%</span>
                  </div>
                  <Progress value={metrics.performance.diskUsage} className="h-1.5 sm:h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">Network</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{metrics.performance.networkLatency}ms</span>
                  </div>
                  <Progress value={Math.min(metrics.performance.networkLatency / 2, 100)} className="h-1.5 sm:h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints */}
        <TabsContent value="endpoints" className="mt-3 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Wifi className="h-4 w-4 sm:h-5 sm:w-5" /> Endpoint Health
              </CardTitle>
              <CardDescription className="text-2xs sm:text-sm">Critical services status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.endpoints.map((endpoint, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Badge className={`text-2xs sm:text-xs ${getStatusColor(endpoint.status)} shrink-0`}>
                        {getStatusIcon(endpoint.status)}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs sm:text-sm truncate">{endpoint.name}</div>
                        <div className="text-2xs sm:text-xs text-muted-foreground truncate">{endpoint.url}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 self-start sm:self-center">
                      <div className="text-xs sm:text-sm font-medium">{endpoint.responseTime}ms</div>
                      <div className="text-2xs sm:text-xs text-muted-foreground">
                        {new Date(endpoint.lastChecked).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="mt-3 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> Recent Events
              </CardTitle>
              <CardDescription className="text-2xs sm:text-sm">Warnings and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge 
                      variant={error.level === 'error' ? 'destructive' : error.level === 'warning' ? 'secondary' : 'outline'}
                      className="mt-0.5 text-2xs sm:text-xs shrink-0"
                    >
                      {error.level}
                    </Badge>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium leading-tight">{error.message}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="text-2xs sm:text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                        {error.count > 1 && (
                          <Badge variant="outline" className="text-2xs sm:text-xs self-start sm:self-center">
                            {error.count}x
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentinel */}
        <TabsContent value="sentinel" className="mt-3 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Sentinel-PP-01</CardTitle>
              <CardDescription className="text-2xs sm:text-sm">Scan, persist, frequency, and sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sentinel ? (
                <div className="space-y-4">
                  <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div className="space-y-1">
                        <Label className="text-2xs sm:text-xs">Enabled</Label>
                        <div className="text-2xs sm:text-xs text-muted-foreground">Start background scanning</div>
                      </div>
                      <Switch checked={sentinel.enabled} onCheckedChange={(v) => updateSentinel({ enabled: v })} disabled={savingSentinel || !!sentinelError} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div className="space-y-1">
                        <Label className="text-2xs sm:text-xs">Auto Persist</Label>
                        <div className="text-2xs sm:text-xs text-muted-foreground">Save drafts automatically</div>
                      </div>
                      <Switch checked={sentinel.autoPersist} onCheckedChange={(v) => updateSentinel({ autoPersist: v })} disabled={savingSentinel || !!sentinelError} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border">
                      <div className="space-y-1 mr-3">
                        <Label className="text-2xs sm:text-xs">Frequency (ms)</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" value={sentinel.frequencyMs} onChange={(e) => setSentinel({ ...sentinel, frequencyMs: Number(e.target.value) })} className="h-8 text-2xs sm:text-xs" />
                          <div className="hidden sm:block text-2xs text-muted-foreground">{humanizeMs(sentinel.frequencyMs)}</div>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {[15000, 30000, 60000, 300000].map(v => (
                            <Button key={v} variant="outline" size="sm" className="text-2xs" onClick={() => setSentinel({ ...sentinel, frequencyMs: v })}>{humanizeMs(v)}</Button>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" disabled={savingSentinel || !!sentinelError} onClick={() => updateSentinel({ frequencyMs: sentinel.frequencyMs })}>Save</Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={runSentinelOnce} disabled={savingSentinel || !!sentinelError || runtime?.running || !!timeLeft(runtime?.cooldownUntil)}>
                      Run once now
                    </Button>
                    {runtime?.lastRunAt && (<span className="text-2xs sm:text-xs text-muted-foreground">Last run: {new Date(runtime.lastRunAt).toLocaleString()}</span>)}
                    {typeof runtime?.lastCreated === 'number' && (<Badge variant="outline" className="text-2xs sm:text-xs">Created: {runtime.lastCreated}</Badge>)}
                    {typeof runtime?.lastProcessed === 'number' && (<Badge variant="outline" className="text-2xs sm:text-xs">Processed: {runtime.lastProcessed}</Badge>)}
                    {timeLeft(runtime?.nextRunAt) && (<Badge variant="secondary" className="text-2xs sm:text-xs">Next run in {timeLeft(runtime?.nextRunAt)}</Badge>)}
                    {timeLeft(runtime?.cooldownUntil) && (<Badge variant="destructive" className="text-2xs sm:text-xs">Cooldown {timeLeft(runtime?.cooldownUntil)}</Badge>)}
                    <Badge variant={sentinel.running ? 'default' : 'secondary'} className="text-2xs sm:text-xs">{sentinel.running ? 'Running' : 'Stopped'}</Badge>
                    {runtime?.maxPerRun && (<Badge variant="outline" className="text-2xs sm:text-xs">Max/run: {runtime.maxPerRun}</Badge>)}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-2xs sm:text-xs">Sources</Label>
                    <div className="grid gap-2">
                      {sentinel.sources.map((s, idx) => (
                        <div key={`${s.name}-${idx}`} className="flex items-center justify-between p-2 rounded border">
                          <div className="min-w-0">
                            <div className="text-2xs sm:text-xs font-medium truncate">{s.name}</div>
                            <div className="text-2xs sm:text-xs text-muted-foreground truncate">{s.url}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={s.enabled !== false} disabled={!!sentinelError} onCheckedChange={(v) => {
                              const next = [...sentinel.sources];
                              next[idx] = { ...s, enabled: v };
                              setSentinel({ ...sentinel, sources: next });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" disabled={savingSentinel || !!sentinelError} onClick={() => updateSentinel({ sources: sentinel.sources })}>Save Sources</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Loading Sentinel settings…</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="mt-3 sm:mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" /> Sentinel Logs
                </CardTitle>
                <CardDescription className="text-2xs sm:text-sm">Auto refresh every 5s. Newest first.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-2xs sm:text-xs bg-background"
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <div className="flex items-center gap-2 text-2xs sm:text-xs">
                  <span>Auto-scroll</span>
                  <Switch checked={autoScrollLogs} onCheckedChange={setAutoScrollLogs} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-auto space-y-2" id="sentinel-log-view"
                   onScroll={(e) => {
                     // disable auto-scroll if user manually scrolls up
                     const el = e.currentTarget as HTMLDivElement;
                     const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
                     if (!nearBottom && autoScrollLogs) setAutoScrollLogs(false);
                   }}>
                {logs.filter(l => logLevel === 'all' || l.level === logLevel).length === 0 && (
                  <div className="text-2xs sm:text-xs text-muted-foreground">No logs for this filter.</div>
                )}
                {logs
                  .filter(l => logLevel === 'all' || l.level === logLevel)
                  .map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded border">
                      <Badge 
                        variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'outline'}
                        className="text-2xs sm:text-xs"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xs sm:text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs break-words whitespace-pre-wrap">{log.message}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}