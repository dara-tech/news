'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Activity, 
  Zap, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Clock,
  Database,
  Network
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { SentinelConfig, SentinelRuntime } from './types';
import { 
  humanizeMs, 
  timeLeft, 
  calculateSentinelStats, 
  getSentinelHealthStatus,
  validateSentinelConfig,
  getResourceUsage,
  getSentinelMetrics,
  getSentinelRecommendations
} from './utils';

interface SentinelControlsProps {
  sentinel: SentinelConfig | null;
  runtime: SentinelRuntime | null;
  sentinelError: string | null;
  onUpdate: () => void;
}

export default function SentinelControls({ sentinel, runtime, sentinelError, onUpdate }: SentinelControlsProps) {
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);
  const [isForceRun, setIsForceRun] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const stats = calculateSentinelStats(runtime);
  const healthStatus = getSentinelHealthStatus(sentinel, runtime);
  const resourceUsage = getResourceUsage();
  const metrics = getSentinelMetrics(runtime);
  const recommendations = getSentinelRecommendations(metrics, sentinel || {});

  // Debug logging for Force Run button state
  console.log('🔍 [SentinelControls] Debug Info:', {
    isForceRun,
    sentinelError,
    healthStatus,
    sentinelEnabled: sentinel?.enabled,
    runtimeRunning: runtime?.running,
    buttonDisabled: isForceRun || !!sentinelError || healthStatus === 'running'
  });

  const emergencyStop = async () => {
    try {
      setIsEmergencyStop(true);
      // Use the existing update endpoint to disable Sentinel
      const { data } = await api.put('/admin/system/sentinel', { enabled: false });
      if (data?.success) {
        toast.success('Sentinel emergency stopped');
        onUpdate();
      } else {
        toast.error('Failed to emergency stop Sentinel');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to emergency stop Sentinel');
    } finally {
      setIsEmergencyStop(false);
    }
  };

  const forceRun = async () => {
    try {
      setIsForceRun(true);
      
      // Create a custom axios instance with longer timeout for sentinel operations
      const sentinelApi = api.create({
        timeout: 120000, // 2 minutes for sentinel operations
      });
      
      const { data } = await sentinelApi.post('/admin/system/sentinel/run-once');
      if (data?.success) {
        toast.success('Sentinel run-once initiated successfully');
        
        // Start polling for status updates immediately
        startStatusPolling();
        
        // Also trigger immediate update
        onUpdate();
      } else {
        toast.error('Failed to run Sentinel: ' + (data?.message || 'Unknown error'));
      }
    } catch (e: any) {
      console.error('Force run error:', e);
      if (e.code === 'ECONNABORTED') {
        toast.error('Sentinel operation timed out. It may still be running in the background.');
        // Start polling anyway in case it's still running
        startStatusPolling();
      } else {
        toast.error('Failed to run Sentinel: ' + (e?.response?.data?.message || e?.message || 'Network error'));
      }
    } finally {
      setIsForceRun(false);
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

  const resetSentinel = async () => {
    try {
      const { data } = await api.post('/admin/system/sentinel/reset');
      if (data?.success) {
        toast.success('Sentinel reset successfully');
        onUpdate();
      } else {
        toast.error('Failed to reset Sentinel');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to reset Sentinel');
    }
  };

  const validateConfig = () => {
    if (!sentinel) return;
    const errors = validateSentinelConfig(sentinel);
    if (errors.length > 0) {
      toast.error(`Configuration errors: ${errors.join(', ')}`);
    } else {
      toast.success('Configuration is valid');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'ready': return 'text-blue-600 bg-blue-50';
      case 'cooldown': return 'text-yellow-600 bg-yellow-50';
      case 'disabled': return 'text-gray-600 bg-gray-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  if (!sentinel) return null;

  return (
    <div className="space-y-4">
      {/* Health Status */}
      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Activity className="h-4 w-4" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getHealthColor(healthStatus)}`}>
                {healthStatus.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-600">
                {healthStatus === 'running' && 'Processing content...'}
                {healthStatus === 'ready' && 'Ready for next run'}
                {healthStatus === 'cooldown' && `Cooldown: ${timeLeft(runtime?.cooldownUntil)}`}
                {healthStatus === 'disabled' && 'System disabled'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{stats.efficiency}%</div>
              <div className="text-xs text-slate-500">Efficiency</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Success Rate</div>
              <Progress value={stats.successRate} className="h-2" />
              <div className="text-xs text-slate-600 mt-1">{stats.successRate}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Avg Processing</div>
              <div className="text-sm font-medium">{humanizeMs(stats.avgProcessingTime)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Zap className="h-4 w-4" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  <span className="text-xs">Memory</span>
                </div>
                <span className="text-xs font-medium">{resourceUsage.memory}%</span>
              </div>
              <Progress value={resourceUsage.memory} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  <span className="text-xs">CPU</span>
                </div>
                <span className="text-xs font-medium">{resourceUsage.cpu}%</span>
              </div>
              <Progress value={resourceUsage.cpu} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs">Disk</span>
                </div>
                <span className="text-xs font-medium">{resourceUsage.disk}%</span>
              </div>
              <Progress value={resourceUsage.disk} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-3 w-3" />
                  <span className="text-xs">Network</span>
                </div>
                <span className="text-xs font-medium">{resourceUsage.network}%</span>
              </div>
              <Progress value={resourceUsage.network} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Actions */}
      <Card className="border-slate-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Settings className="h-4 w-4" />
            Control Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={forceRun}
              disabled={isForceRun || !!sentinelError || healthStatus === 'running'}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              title={
                isForceRun ? 'Run once in progress...' :
                sentinelError ? `Error: ${sentinelError}` :
                healthStatus === 'running' ? 'Sentinel is already running' :
                healthStatus === 'disabled' ? 'Sentinel is disabled' :
                healthStatus === 'cooldown' ? 'Sentinel is in cooldown' :
                'Click to run Sentinel once'
              }
            >
              {isForceRun || healthStatus === 'running' ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  {healthStatus === 'running' ? 'Running...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-2" />
                  Run Once
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={emergencyStop}
              disabled={isEmergencyStop || !!sentinelError || healthStatus !== 'running'}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="h-3 w-3 mr-2" />
              Emergency Stop
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={resetSentinel}
              disabled={!!sentinelError}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset System
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={validateConfig}
              disabled={!!sentinelError}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Shield className="h-3 w-3 mr-2" />
              Validate Config
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch 
                checked={showAdvanced} 
                onCheckedChange={setShowAdvanced}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label className="text-xs">Advanced Controls</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Controls */}
      {showAdvanced && (
        <Card className="border-slate-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4" />
              Advanced Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{metrics.totalRuns}</div>
                <div className="text-xs text-slate-500">Total Runs</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{metrics.totalArticlesProcessed}</div>
                <div className="text-xs text-slate-500">Articles Processed</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{metrics.totalArticlesCreated}</div>
                <div className="text-xs text-slate-500">Articles Created</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{humanizeMs(metrics.averageRunTime)}</div>
                <div className="text-xs text-slate-500">Avg Run Time</div>
              </div>
            </div>
            
            {recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-700">Recommendations:</div>
                <div className="space-y-1">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <div className="h-1 w-1 bg-blue-500 rounded-full" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
