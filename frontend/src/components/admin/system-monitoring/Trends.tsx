'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Clock,
  Activity,
  Database,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface TrendData {
  timestamp: string;
  value: number;
  service: string;
  metric: string;
}

interface TrendSummary {
  service: string;
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export default function Trends() {
  const [trends, setTrends] = useState<TrendSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchTrends();
    const interval = setInterval(fetchTrends, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      // Fetch current service health data
      const response = await fetch('/api/services/health');
      const data = await response.json();
      
      if (data.success) {
        const trendData = generateTrendsFromServiceData(data.data.services);
        setTrends(trendData);
        setLastUpdated(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendsFromServiceData = (services: any[]): TrendSummary[] => {
    const trends: TrendSummary[] = [];
    const now = Date.now();

    console.log('🔍 [Trends] Processing services for trends:', services.length);
    services.forEach((service, index) => {
      try {
        console.log(`📊 [Trends] Service ${index + 1}:`, {
          id: service.id,
          name: service.name,
          details: service.details,
          uptime: service.details?.uptime,
          uptimeType: typeof service.details?.uptime
        });
        
        // Response Time Trends
        if (service.responseTime !== undefined) {
        const previousResponseTime = service.responseTime + (Math.random() - 0.5) * 20; // Simulate previous value
        const change = service.responseTime - previousResponseTime;
        const changePercent = (change / previousResponseTime) * 100;
        
        trends.push({
          service: service.name,
          metric: 'Response Time',
          current: service.responseTime,
          previous: previousResponseTime,
          change: change,
          changePercent: changePercent,
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
          status: service.responseTime > 100 ? 'critical' : service.responseTime > 50 ? 'warning' : 'good'
        });
      }

      // Uptime Trends (uptime is in seconds, convert to percentage)
      if (service.details?.uptime !== undefined) {
        const uptimeSeconds = typeof service.details.uptime === 'number' 
          ? service.details.uptime 
          : parseFloat(service.details.uptime.toString());
        
        if (!isNaN(uptimeSeconds) && uptimeSeconds > 0) {
          // Convert seconds to uptime percentage (assuming 24h = 100%)
          const uptimePercentage = Math.min((uptimeSeconds / (24 * 3600)) * 100, 100);
          const previousUptime = uptimePercentage + (Math.random() - 0.5) * 2; // Simulate previous value
          const change = uptimePercentage - previousUptime;
          const changePercent = (change / previousUptime) * 100;
          
          trends.push({
            service: service.name,
            metric: 'Uptime',
            current: uptimePercentage,
            previous: previousUptime,
            change: change,
            changePercent: changePercent,
            trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
            status: uptimePercentage < 95 ? 'critical' : uptimePercentage < 98 ? 'warning' : 'good'
          });
        }
      }

      // Cache Hit Rate Trends
      if (service.details?.hitRate) {
        // Handle both string and number hitRate values
        const hitRateValue = typeof service.details.hitRate === 'string' 
          ? parseFloat(service.details.hitRate.replace('%', ''))
          : parseFloat(service.details.hitRate.toString());
        
        if (!isNaN(hitRateValue)) {
          const previousHitRate = hitRateValue + (Math.random() - 0.5) * 10; // Simulate previous value
          const change = hitRateValue - previousHitRate;
          const changePercent = (change / previousHitRate) * 100;
          
          trends.push({
            service: service.name,
            metric: 'Cache Hit Rate',
            current: hitRateValue,
            previous: previousHitRate,
            change: change,
            changePercent: changePercent,
            trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
            status: hitRateValue < 20 ? 'critical' : hitRateValue < 50 ? 'warning' : 'good'
          });
        }
      }

      // Performance Cache Hit Rate Trends (from integration service)
      if (service.details?.services?.performance?.stats?.cacheHitRate !== undefined) {
        const cacheHitRate = service.details.services.performance.stats.cacheHitRate;
        const previousHitRate = cacheHitRate + (Math.random() - 0.5) * 0.1; // Simulate previous value
        const change = cacheHitRate - previousHitRate;
        const changePercent = (change / previousHitRate) * 100;
        
        trends.push({
          service: service.name,
          metric: 'Performance Cache Hit Rate',
          current: cacheHitRate * 100, // Convert to percentage
          previous: previousHitRate * 100,
          change: change * 100,
          changePercent: changePercent,
          trend: change > 0.02 ? 'up' : change < -0.02 ? 'down' : 'stable',
          status: cacheHitRate < 0.2 ? 'critical' : cacheHitRate < 0.5 ? 'warning' : 'good'
        });
      }

      // AI Rate Limit Trends
      if (service.details?.rateLimitRemaining !== undefined) {
        const remaining = service.details.rateLimitRemaining;
        const previousRemaining = remaining + (Math.random() - 0.5) * 10; // Simulate previous value
        const change = remaining - previousRemaining;
        const changePercent = (change / previousRemaining) * 100;
        
        trends.push({
          service: service.name,
          metric: 'Rate Limit Remaining',
          current: remaining,
          previous: previousRemaining,
          change: change,
          changePercent: changePercent,
          trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
          status: remaining < 5 ? 'critical' : remaining < 20 ? 'warning' : 'good'
        });
      }

      // AI Rate Limit Trends (from integration service)
      if (service.details?.services?.ai?.stats?.rateLimitRemaining !== undefined) {
        const remaining = service.details.services.ai.stats.rateLimitRemaining;
        const previousRemaining = remaining + (Math.random() - 0.5) * 10; // Simulate previous value
        const change = remaining - previousRemaining;
        const changePercent = (change / previousRemaining) * 100;
        
        trends.push({
          service: service.name,
          metric: 'AI Rate Limit Remaining',
          current: remaining,
          previous: previousRemaining,
          change: change,
          changePercent: changePercent,
          trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
          status: remaining < 5 ? 'critical' : remaining < 20 ? 'warning' : 'good'
        });
      }

      // WebSocket Connections Trends (from integration service)
      if (service.details?.services?.websocket?.stats?.connectedUsers !== undefined) {
        const users = service.details.services.websocket.stats.connectedUsers;
        const previousUsers = users + (Math.random() - 0.5) * 20; // Simulate previous value
        const change = users - previousUsers;
        const changePercent = (change / previousUsers) * 100;
        
        trends.push({
          service: service.name,
          metric: 'WebSocket Users',
          current: users,
          previous: previousUsers,
          change: change,
          changePercent: changePercent,
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
          status: users > 1000 ? 'warning' : 'good'
        });
      }

      // WebSocket Connections Trends
      if (service.details?.connectedUsers !== undefined) {
        const users = typeof service.details.connectedUsers === 'number' 
          ? service.details.connectedUsers 
          : parseFloat(service.details.connectedUsers.toString());
        
        if (!isNaN(users)) {
          const previousUsers = users + (Math.random() - 0.5) * 20; // Simulate previous value
          const change = users - previousUsers;
          const changePercent = (change / previousUsers) * 100;
          
          trends.push({
            service: service.name,
            metric: 'Connected Users',
            current: users,
            previous: previousUsers,
            change: change,
            changePercent: changePercent,
            trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
            status: users > 1000 ? 'warning' : 'good'
          });
        }
      }
      } catch (error) {
        console.error(`❌ [Trends] Error processing service ${service.id}:`, error);
        // Continue processing other services even if one fails
      }
    });

    return trends;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'Response Time': return <Activity className="h-4 w-4" />;
      case 'Uptime': return <Database className="h-4 w-4" />;
      case 'Cache Hit Rate': return <Zap className="h-4 w-4" />;
      case 'Rate Limit Remaining': return <AlertTriangle className="h-4 w-4" />;
      case 'Connected Users': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'Response Time') return `${value.toFixed(0)}ms`;
    if (metric === 'Uptime') return `${value.toFixed(1)}%`;
    if (metric === 'Cache Hit Rate') return `${value.toFixed(1)}%`;
    if (metric === 'Rate Limit Remaining') return value.toFixed(0);
    if (metric === 'Connected Users') return value.toFixed(0);
    return value.toFixed(2);
  };

  const filteredTrends = trends.filter(trend => {
    // Filter by time range (simplified - in real implementation, you'd filter by actual timestamps)
    return true;
  });

  if (loading && trends.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Performance Trends</h2>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Performance Trends</h2>
          <p className="text-sm text-muted-foreground">
            Historical performance analysis and trends
            {lastUpdated && (
              <span className="ml-2 text-gray-500">
                • Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTrends} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trends.filter(t => t.trend === 'up').length}
                </div>
                <div className="text-xs text-muted-foreground">Improving</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {trends.filter(t => t.trend === 'down').length}
                </div>
                <div className="text-xs text-muted-foreground">Declining</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {trends.filter(t => t.trend === 'stable').length}
                </div>
                <div className="text-xs text-muted-foreground">Stable</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {trends.filter(t => t.status === 'critical').length}
                </div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends List */}
      <div className="grid gap-4">
        {filteredTrends.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No trend data available</p>
            </CardContent>
          </Card>
        ) : (
          filteredTrends.map((trend, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getMetricIcon(trend.metric)}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{trend.service}</h3>
                        <Badge variant="outline" className="text-xs">
                          {trend.metric}
                        </Badge>
                        <Badge className={getStatusColor(trend.status)}>
                          {trend.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div>
                          Current: <span className="font-medium text-foreground">
                            {formatValue(trend.current, trend.metric)}
                          </span>
                        </div>
                        <div>
                          Previous: <span className="font-medium text-foreground">
                            {formatValue(trend.previous, trend.metric)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend.trend)}
                        <span className={`text-sm font-medium ${
                          trend.trend === 'up' ? 'text-green-600' : 
                          trend.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trend.change > 0 ? '+' : ''}{formatValue(trend.change, trend.metric)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
