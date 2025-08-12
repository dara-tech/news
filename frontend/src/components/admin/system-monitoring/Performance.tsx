'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';
import { SystemMetrics } from './types';
import { getUsageColor } from './utils';

interface PerformanceProps {
  metrics: SystemMetrics;
}

export default function Performance({ metrics }: PerformanceProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold ">Performance Metrics</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">Real-time resource utilization</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-8">
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-muted-foreground">CPU</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{metrics.performance.cpuUsage}%</span>
            </div>
            <Progress 
              value={metrics.performance.cpuUsage} 
              className={`h-2 sm:h-3 rounded-full ${getUsageColor(metrics.performance.cpuUsage)} shadow-inner`} 
            />
            <div className="mt-1.5 sm:mt-2 text-2xs sm:text-xs text-slate-500">
              {metrics.performance.cpuUsage >= 80 ? 'High load' : 
               metrics.performance.cpuUsage >= 60 ? 'Moderate load' : 'Normal operation'}
            </div>
          </div>

          <div className="group p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <MemoryStick className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-muted-foreground">Memory</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{metrics.performance.memoryUsage}%</span>
            </div>
            <Progress 
              value={metrics.performance.memoryUsage} 
              className={`h-2 sm:h-3 rounded-full ${getUsageColor(metrics.performance.memoryUsage)} shadow-inner`} 
            />
            <div className="mt-1.5 sm:mt-2 text-2xs sm:text-xs text-slate-500">
              {metrics.performance.memoryUsage >= 80 ? 'High usage' : 
               metrics.performance.memoryUsage >= 60 ? 'Moderate usage' : 'Optimal'}
            </div>
          </div>

          <div className="group p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-muted-foreground">Disk</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{metrics.performance.diskUsage}%</span>
            </div>
            <Progress 
              value={metrics.performance.diskUsage} 
              className={`h-2 sm:h-3 rounded-full ${getUsageColor(metrics.performance.diskUsage)} shadow-inner`} 
            />
            <div className="mt-1.5 sm:mt-2 text-2xs sm:text-xs text-slate-500">
              {metrics.performance.diskUsage >= 80 ? 'Low space' : 
               metrics.performance.diskUsage >= 60 ? 'Moderate usage' : 'Plenty available'}
            </div>
          </div>

          <div className="group p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-muted-foreground">Network</span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-slate-900">{metrics.performance.networkLatency}ms</span>
            </div>
            <Progress 
              value={Math.min(metrics.performance.networkLatency / 2, 100)} 
              className={`h-2 sm:h-3 rounded-full ${getUsageColor(Math.min(metrics.performance.networkLatency / 2, 100))} shadow-inner`} 
            />
            <div className="mt-1.5 sm:mt-2 text-2xs sm:text-xs text-slate-500">
              {metrics.performance.networkLatency >= 100 ? 'Slow connection' : 
               metrics.performance.networkLatency >= 50 ? 'Moderate latency' : 'Fast connection'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
