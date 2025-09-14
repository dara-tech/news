'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Clock } from 'lucide-react';
import { SystemMetrics } from './types';

interface HeaderProps {
  metrics: SystemMetrics;
  lastRefresh: Date | null;
  autoRefresh: boolean;
  setAutoRefresh: (autoRefresh: boolean) => void;
  loading: boolean;
  onRefresh: () => void;
}

export default function Header({ 
  metrics, 
  lastRefresh, 
  autoRefresh, 
  setAutoRefresh, 
  loading, 
  onRefresh 
}: HeaderProps) {
  return (
    <div className="mb-4 sm:mb-8">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                System Monitoring
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">Real-time system health and performance</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:bg-white transition-all duration-200"
          >
            <span className={`inline-block h-2 w-2 sm:h-3 sm:w-3 rounded-full animate-pulse mr-2 ${
              metrics.server.status === 'healthy' ? 'bg-emerald-500' : 
              metrics.server.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-xs sm:text-sm font-medium capitalize">{metrics.server.status}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs sm:text-sm transition-all duration-200 ${
              autoRefresh 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </div>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:bg-white transition-all duration-200 text-xs sm:text-sm"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Status Bar */}
      <Card className="backdrop-blur-sm border-slate-200/50 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Uptime: <span className="font-medium">{metrics.server.uptime}</span></span>
              </div>
              {lastRefresh && (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-slate-400 rounded-full" />
                  <span className="text-xs sm:text-sm">Updated {lastRefresh.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">{metrics.server.responseTime}ms</div>
                <div className="text-2xs sm:text-xs">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">{metrics.server.requestsPerMinute}</div>
                <div className="text-2xs sm:text-xs">Req/min</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
