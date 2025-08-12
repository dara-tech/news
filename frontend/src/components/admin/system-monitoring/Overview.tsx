'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Activity, TrendingUp } from 'lucide-react';
import { SystemMetrics } from './types';
import { getStatusColor, getStatusIcon } from './utils';

interface OverviewProps {
  metrics: SystemMetrics;
}

export default function Overview({ metrics }: OverviewProps) {
  return (
    <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <Server className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <Badge className={`text-2xs sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 ${getStatusColor(metrics.server.status)} border-0 shadow-sm`}>
            {getStatusIcon(metrics.server.status)}
            <span className="ml-1 sm:ml-2 capitalize font-medium">{metrics.server.status}</span>
          </Badge>
          <div className="text-2xs sm:text-xs text-muted-foreground">Uptime: <span className="font-medium text-foreground">{metrics.server.uptime}</span></div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <Badge className={`text-2xs sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 ${getStatusColor(metrics.database.status)} border-0 shadow-sm`}>
            {getStatusIcon(metrics.database.status)}
            <span className="ml-1 sm:ml-2 capitalize font-medium">{metrics.database.status}</span>
          </Badge>
          <div className="text-2xs sm:text-xs text-muted-foreground">Size: <span className="font-medium text-foreground">{metrics.database.size}</span></div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="text-lg sm:text-2xl font-bold text-foreground">{metrics.server.responseTime}ms</div>
          <div className="flex items-center text-2xs sm:text-xs text-muted-foreground">
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 mr-1" /> 
            Avg response time
          </div>
        </CardContent>
      </Card>

      <Card className="group hover:shadow-lg transition-all duration-300 border-0 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-semibold text-foreground">Requests/min</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="text-lg sm:text-2xl font-bold text-foreground">{metrics.server.requestsPerMinute}</div>
          <div className="text-2xs sm:text-xs text-muted-foreground">Active traffic</div>
        </CardContent>
      </Card>
    </div>
  );
}
