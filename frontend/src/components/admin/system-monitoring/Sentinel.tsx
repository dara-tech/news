'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Play, Save, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SentinelConfig, SentinelRuntime } from './types';
import { humanizeMs, timeLeft } from './utils';
import SentinelControls from './SentinelControls';
import SourceManager from './SourceManager';

interface SentinelProps {
  sentinel: SentinelConfig | null;
  runtime: SentinelRuntime | null;
  sentinelError: string | null;
  onUpdate: () => void;
}

export default function Sentinel({ sentinel, runtime, sentinelError, onUpdate }: SentinelProps) {
  const [savingSentinel, setSavingSentinel] = useState(false);
  const [runningSentinel, setRunningSentinel] = useState(false);

  const updateSentinel = async (updates: Partial<{ 
    enabled: boolean; 
    autoPersist: boolean; 
    frequencyMs: number; 
    sources: any[];
    settings?: any;
  }>) => {
    if (!sentinel) return;
    setSavingSentinel(true);
    try {
      const { data } = await api.put('/admin/system/sentinel', updates);
      if (data?.success) {
        toast.success('Sentinel settings updated');
        onUpdate();
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
      setRunningSentinel(true);
      
      // Create a custom axios instance with longer timeout for sentinel operations
      const sentinelApi = api.create({
        timeout: 120000, // 2 minutes for sentinel operations
      });
      
      const { data } = await sentinelApi.post('/admin/system/sentinel/run-once');
      if (data?.success) {
        toast.success('Sentinel run triggered successfully');
        
        // Start polling for status updates immediately
        startStatusPolling();
        
        // Also trigger immediate update
        onUpdate();
      } else {
        toast.error('Failed to trigger Sentinel: ' + (data?.message || 'Unknown error'));
      }
    } catch (e: any) {
      console.error('Sentinel run error:', e);
      if (e.code === 'ECONNABORTED') {
        toast.error('Sentinel operation timed out. It may still be running in the background.');
        // Start polling anyway in case it's still running
        startStatusPolling();
      } else {
        toast.error('Failed to trigger Sentinel: ' + (e?.response?.data?.message || e?.message || 'Network error'));
      }
    } finally {
      setRunningSentinel(false);
    }
  };

  // Poll for status updates when sentinel is running
  const startStatusPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        onUpdate(); // This will fetch the latest status
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  if (!sentinel) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center space-y-2">
          <Shield className="h-8 w-8 mx-auto text-slate-400 animate-pulse" />
          <div className="text-sm text-slate-500">Loading Sentinel configuration…</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-primary">
              Sentinel-PP-01
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Automated content scanning and processing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Basic Controls */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="border-slate-200/50 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sentinel.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
                    System Status
                  </Label>
                  <div className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400">Background scanning control</div>
                </div>
                <Switch 
                  checked={sentinel.enabled} 
                  onCheckedChange={(v) => updateSentinel({ enabled: v })} 
                  disabled={savingSentinel || !!sentinelError}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${sentinel.autoPersist ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                    Auto Persist
                  </Label>
                  <div className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400">Automatic draft saving</div>
                </div>
                <Switch 
                  checked={sentinel.autoPersist} 
                  onCheckedChange={(v) => updateSentinel({ autoPersist: v })} 
                  disabled={savingSentinel || !!sentinelError}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-white flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    Scan Frequency
                  </Label>
                  <div className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400 mb-2">Interval between scans</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={sentinel.frequencyMs} 
                    onChange={(e) => updateSentinel({ frequencyMs: Number(e.target.value) })} 
                    className="h-8 text-2xs sm:text-xs border-slate-200 flex-1" 
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={savingSentinel || !!sentinelError} 
                    onClick={() => updateSentinel({ frequencyMs: sentinel.frequencyMs })}
                    className="border-slate-200 px-2 py-1 h-8"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-2xs text-slate-500 font-medium">{humanizeMs(sentinel.frequencyMs)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Run Controls */}
        <Card className="border-slate-200/50 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button 
                  size="sm" 
                  onClick={runSentinelOnce} 
                  disabled={savingSentinel || runningSentinel || !!sentinelError || runtime?.running || !!timeLeft(runtime?.cooldownUntil)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md w-full sm:w-auto"
                >
                  {runningSentinel || runtime?.running ? (
                    <>
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      {runtime?.running ? 'Running...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Run Scan Now
                    </>
                  )}
                </Button>
                
                {/* Status Indicator */}
                {runtime?.running && (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Currently Running
                    </span>
                  </div>
                )}
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {runtime?.lastRunAt && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
                    <span className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400">
                      Last: {new Date(runtime.lastRunAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {typeof runtime?.lastCreated === 'number' && (
                  <Badge variant="outline" className="text-2xs">
                    Created: {runtime.lastCreated}
                  </Badge>
                )}
                {typeof runtime?.lastProcessed === 'number' && (
                  <Badge variant="outline" className="text-2xs">
                    Processed: {runtime.lastProcessed}
                  </Badge>
                )}
                {timeLeft(runtime?.nextRunAt) && !runtime?.running && (
                  <Badge className="text-2xs">
                    Next: {timeLeft(runtime?.nextRunAt)}
                  </Badge>
                )}
                {timeLeft(runtime?.cooldownUntil) && (
                  <Badge variant="destructive" className="text-2xs">
                    Cooldown: {timeLeft(runtime?.cooldownUntil)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Controls */}
        <SentinelControls 
          sentinel={sentinel}
          runtime={runtime}
          sentinelError={sentinelError}
          onUpdate={onUpdate}
        />

        {/* Source Management */}
        <SourceManager 
          sentinel={sentinel}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
}
