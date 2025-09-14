'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe,
  RefreshCw,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';

interface SentinelMetrics {
  totalProcessed: number;
  totalCreated: number;
  averageProcessingTime: number;
  errorRate: number;
  uptime: number;
  sourcesCount: number;
  cacheSize: number;
}

export default function EnhancedSentinel() {
  const [metrics, setMetrics] = useState<SentinelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/sentinel/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Sentinel-PP-01 Enhanced</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Sentinel-PP-01 Enhanced
                </CardTitle>
                <CardDescription>
                  Advanced AI News Analyst with Quality Scoring & Safety Checks
                </CardDescription>
              </div>
            </div>
            <Button onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">Articles processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Created</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCreated || 0}</div>
            <p className="text-xs text-muted-foreground">Articles published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((metrics?.errorRate || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Processing errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(metrics?.uptime || 0)}</div>
            <p className="text-xs text-muted-foreground">Service uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Assurance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content Safety</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duplicate Detection</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quality Scoring</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bias Filtering</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Processing Time</span>
                <span>{Math.round(metrics?.averageProcessingTime || 0)}ms</span>
              </div>
              <Progress value={Math.min((metrics?.averageProcessingTime || 0) / 1000 * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cache Usage</span>
                <span>{metrics?.cacheSize || 0} entries</span>
              </div>
              <Progress value={Math.min((metrics?.cacheSize || 0) / 1000 * 100, 100)} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              Active Sources: {metrics?.sourcesCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{metrics?.sourcesCount || 0}</div>
              <div className="text-sm text-muted-foreground">Active Sources</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{metrics?.cacheSize || 0}</div>
              <div className="text-sm text-muted-foreground">Cache Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((1 - (metrics?.errorRate || 0)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(metrics?.averageProcessingTime || 0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Processing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
