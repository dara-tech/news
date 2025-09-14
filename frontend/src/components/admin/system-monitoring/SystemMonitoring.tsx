'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Server,
  Activity,
  Wifi,
  AlertTriangle,
  Shield,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import { SystemMetrics, SentinelConfig, SentinelRuntime, SystemLog } from './types';
import Header from './Header';
import Overview from './Overview';
import Performance from './Performance';
import Endpoints from './Endpoints';
import Events from './Events';
import Sentinel from './Sentinel';
import Logs from './Logs';
import Services from './Services';
import Alerts from './Alerts';

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sentinel, setSentinel] = useState<SentinelConfig | null>(null);
  const [sentinelError, setSentinelError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [logLevel, setLogLevel] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const [runtime, setRuntime] = useState<SentinelRuntime | null>(null);

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
    } catch (error) {// Always show mock data so the page isn't blank
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

  const handleRefresh = () => {
    fetchMetrics();
    fetchLogs();
  };

  if (loading && !metrics) {
    return (
      <div className="grid gap-3 p-3 sm:gap-4 sm:p-6">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      <Header 
        metrics={metrics}
        lastRefresh={lastRefresh}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/50 p-1.5 sm:p-2 shadow-sm mb-4 sm:mb-6">
          <TabsList className="flex w-full justify-around bg-transparent">
            <TabsTrigger 
              value="overview" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Server className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Server className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Services</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Alerts</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Performance</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="endpoints" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Endpoints</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Events</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="sentinel" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sentinel</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="text-2xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 px-2 py-1.5"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logs</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4 sm:mt-6">
          <Overview metrics={metrics} />
        </TabsContent>

        <TabsContent value="services" className="mt-4 sm:mt-6">
          <Services />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 sm:mt-6">
          <Alerts />
        </TabsContent>

        <TabsContent value="performance" className="mt-4 sm:mt-6">
          <Performance metrics={metrics} />
        </TabsContent>

        <TabsContent value="endpoints" className="mt-3 sm:mt-6">
          <Endpoints metrics={metrics} />
        </TabsContent>

        <TabsContent value="events" className="mt-3 sm:mt-6">
          <Events metrics={metrics} />
        </TabsContent>

        <TabsContent value="sentinel" className="mt-3 sm:mt-6">
          <Sentinel 
            sentinel={sentinel}
            runtime={runtime}
            sentinelError={sentinelError}
            onUpdate={fetchSentinel}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-3 sm:mt-6">
          <Logs 
            logs={logs}
            logLevel={logLevel}
            setLogLevel={setLogLevel}
            autoScrollLogs={autoScrollLogs}
            setAutoScrollLogs={setAutoScrollLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
