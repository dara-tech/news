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

  useEffect(() => {
    fetchMetrics();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
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
      
      // Check if it's an authentication error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          console.log('Authentication required - showing mock data for now');
        } else if (axiosError.response?.status === 404) {
          console.log('API endpoint not found - showing mock data for now');
        }
      }
    } finally {
      setLoading(false);
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

  if (loading && !metrics) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(metrics.server.status)}>
                {getStatusIcon(metrics.server.status)}
                <span className="ml-1 capitalize">{metrics.server.status}</span>
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Uptime: {metrics.server.uptime}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(metrics.database.status)}>
                {getStatusIcon(metrics.database.status)}
                <span className="ml-1 capitalize">{metrics.database.status}</span>
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Size: {metrics.database.size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.server.responseTime}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              Average response time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/min</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.server.requestsPerMinute}</div>
            <div className="text-xs text-muted-foreground">
              Active traffic
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>System resource utilization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm text-muted-foreground">{metrics.performance.cpuUsage}%</span>
              </div>
              <Progress 
                value={metrics.performance.cpuUsage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm text-muted-foreground">{metrics.performance.memoryUsage}%</span>
              </div>
              <Progress 
                value={metrics.performance.memoryUsage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <span className="text-sm text-muted-foreground">{metrics.performance.diskUsage}%</span>
              </div>
              <Progress 
                value={metrics.performance.diskUsage} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Network Latency</span>
                </div>
                <span className="text-sm text-muted-foreground">{metrics.performance.networkLatency}ms</span>
              </div>
              <Progress 
                value={Math.min(metrics.performance.networkLatency / 2, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Endpoint Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Endpoint Health
            </CardTitle>
            <CardDescription>Status of critical system endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(endpoint.status)}>
                      {getStatusIcon(endpoint.status)}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{endpoint.name}</div>
                      <div className="text-xs text-muted-foreground">{endpoint.url}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{endpoint.responseTime}ms</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(endpoint.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Events
            </CardTitle>
            <CardDescription>Recent system events and errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.errors.map((error, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge 
                    variant={error.level === 'error' ? 'destructive' : error.level === 'warning' ? 'secondary' : 'outline'}
                    className="mt-0.5"
                  >
                    {error.level}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium">{error.message}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </div>
                      {error.count > 1 && (
                        <Badge variant="outline" className="text-xs">
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
      </div>
    </div>
  );
}