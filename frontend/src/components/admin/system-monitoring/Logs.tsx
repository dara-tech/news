'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, TrendingUp } from 'lucide-react';
import { SystemLog } from './types';

interface LogsProps {
  logs: SystemLog[];
  logLevel: 'all' | 'info' | 'warning' | 'error';
  setLogLevel: (level: 'all' | 'info' | 'warning' | 'error') => void;
  autoScrollLogs: boolean;
  setAutoScrollLogs: (autoScroll: boolean) => void;
}

export default function Logs({ logs, logLevel, setLogLevel, autoScrollLogs, setAutoScrollLogs }: LogsProps) {
  const filteredLogs = logs.filter(l => logLevel === 'all' || l.level === logLevel);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Real-time Logs */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" /> 
              System Logs
              <Badge variant="outline" className="text-xs">
                {filteredLogs.length} entries
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-xs">Real-time system activity tracking</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={logLevel} onValueChange={(value) => setLogLevel(value as any)}>
              <SelectTrigger className="w-fit text-sm sm:text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info Only</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-2xs sm:text-xs">
              <span>Live</span>
              <Switch checked={autoScrollLogs} onCheckedChange={setAutoScrollLogs} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto" id="sentinel-log-view"
               onScroll={(e) => {
                 const el = e.currentTarget as HTMLDivElement;
                 const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
                 if (!nearBottom && autoScrollLogs) setAutoScrollLogs(false);
               }}>
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No logs match current filter</div>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border-b hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      <Badge 
                        variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'outline'}
                        className="text-sm w-fit"
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <div className="text-2xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-xs font-mono break-words whitespace-pre-wrap leading-relaxed">
                        {log.message}
                      </div>
                      <div className="text-2xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Analytics */}
      <Card className="lg:col-span-1">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Log Analytics
          </CardTitle>
          <CardDescription className="text-2xs sm:text-sm">System activity insights</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Log Level Distribution */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Activity Distribution (Last 24h)</Label>
            <div className="space-y-2">
              {['error', 'warning', 'info'].map(level => {
                const count = logs.filter(l => l.level === level).length;
                const percentage = logs.length > 0 ? (count / logs.length) * 100 : 0;
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={level === 'error' ? 'destructive' : level === 'warning' ? 'secondary' : 'outline'}
                        className="text-xs w-fit justify-center"
                      >
                        {level.toUpperCase()}
                      </Badge>
                      <span className="text-xs">{count} events</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-24">
                      <Progress value={percentage} className="h-2" />
                      <span className="text-xs text-muted-foreground w-8">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Recent Activity</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-600">
                  {logs.filter(l => l.level === 'info').length}
                </div>
                <div className="text-2xs text-muted-foreground">Info Events</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-600">
                  {logs.filter(l => l.level === 'warning').length}
                </div>
                <div className="text-2xs text-muted-foreground">Warnings</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-600">
                  {logs.filter(l => l.level === 'error').length}
                </div>
                <div className="text-2xs text-muted-foreground">Errors</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {logs.length > 0 ? Math.round((Date.now() - new Date(logs[logs.length - 1]?.timestamp || 0).getTime()) / 1000 / 60) : 0}
                </div>
                <div className="text-2xs text-muted-foreground">Min Ago</div>
              </div>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Health Indicators</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${logs.filter(l => l.level === 'error').length === 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-xs">Error Rate</span>
                </div>
                <Badge variant={logs.filter(l => l.level === 'error').length === 0 ? 'default' : 'destructive'} className="text-2xs">
                  {logs.filter(l => l.level === 'error').length === 0 ? 'Normal' : 'Elevated'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${autoScrollLogs ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-xs">Live Monitoring</span>
                </div>
                <Badge variant={autoScrollLogs ? 'default' : 'secondary'} className="text-2xs">
                  {autoScrollLogs ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs">Data Retention</span>
                </div>
                <Badge variant="outline" className="text-2xs">
                  24h Buffer
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
