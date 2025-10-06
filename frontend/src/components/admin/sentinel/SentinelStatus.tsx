'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Zap,
  Database,
  AlertTriangle
} from 'lucide-react';

interface SentinelStatusProps {
  config: any;
  runtime: any;
  error: string | null;
  onRefresh: () => void;
}

export default function SentinelStatus({ config, runtime, error, onRefresh }: SentinelStatusProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />;
      case 'stopped': return <XCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Determine the actual status
  const actualStatus = runtime?.status || (runtime?.running ? 'running' : 'stopped');
  const isRunning = runtime?.running || false;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Sentinel Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const status = actualStatus;
  const isEnabled = config?.enabled || false;
  const sourcesCount = runtime?.sourcesCount || config?.sources?.length || 0;
  const enabledSources = config?.sources?.filter((s: any) => s.enabled)?.length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Main Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
            <span className="text-sm font-medium capitalize">{status}</span>
            {getStatusIcon(status)}
          </div>
          <div className="mt-2 space-y-1">
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {runtime?.timestamp && (
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(runtime.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-medium">{sourcesCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Enabled</span>
              <span className="font-medium">{enabledSources}</span>
            </div>
            <Progress 
              value={sourcesCount > 0 ? (enabledSources / sourcesCount) * 100 : 0} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last Run</span>
              <span className="font-medium">
                {runtime?.lastRun ? 
                  new Date(runtime.lastRun).toLocaleTimeString() : 
                  'Never'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Next Run</span>
              <span className="font-medium">
                {runtime?.nextRun ? 
                  new Date(runtime.nextRun).toLocaleTimeString() : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
