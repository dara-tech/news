'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Zap,
  RefreshCw,
  AlertTriangle,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface SentinelControlsProps {
  config: any;
  runtime: any;
  onUpdate: () => void;
}

export default function SentinelControls({ config, runtime, onUpdate }: SentinelControlsProps) {
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const handleToggleEnabled = async (enabled: boolean) => {
    try {
      setLoading(true);
      const response = await api.put('/admin/system/sentinel', { enabled });
      
      if (response.data?.success) {
        toast.success(`Sentinel ${enabled ? 'enabled' : 'disabled'}`);
        onUpdate();
      } else {
        toast.error('Failed to update sentinel status');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update sentinel status');
    } finally {
      setLoading(false);
    }
  };

  const handleRunOnce = async () => {
    try {
      setRunning(true);
      const response = await api.post('/admin/system/sentinel/run-once');
      
      if (response.data?.success) {
        toast.success('Sentinel run completed successfully');
        onUpdate();
      } else {
        toast.error('Failed to run sentinel');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to run sentinel');
    } finally {
      setRunning(false);
    }
  };

  const handleReloadSources = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/system/sentinel/reload-sources');
      
      if (response.data?.success) {
        toast.success('Sources reloaded successfully');
        onUpdate();
      } else {
        toast.error('Failed to reload sources');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reload sources');
    } finally {
      setLoading(false);
    }
  };

  const handleStopService = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/system/sentinel/stop');
      
      if (response.data?.success) {
        toast.success('Sentinel service stopped successfully');
        onUpdate();
      } else {
        toast.error('Failed to stop sentinel service');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to stop sentinel service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFrequency = async (frequency: number) => {
    try {
      setLoading(true);
      const response = await api.put('/admin/system/sentinel', { 
        frequencyMs: frequency * 60 * 1000 // Convert minutes to milliseconds
      });
      
      if (response.data?.success) {
        toast.success('Frequency updated successfully');
        onUpdate();
      } else {
        toast.error('Failed to update frequency');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update frequency');
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = config?.enabled || false;
  const frequency = config?.frequencyMs ? Math.round(config.frequencyMs / (60 * 1000)) : 30;

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Main Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Sentinel</Label>
              <p className="text-sm text-muted-foreground">
                Automatically process news sources
              </p>
            </div>
            <Switch
              id="enabled"
              checked={isEnabled}
              onCheckedChange={handleToggleEnabled}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="frequency">Run Frequency (minutes)</Label>
              <p className="text-sm text-muted-foreground">
                How often to check for new content
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="frequency"
                type="number"
                value={frequency}
                onChange={(e) => handleUpdateFrequency(Number(e.target.value))}
                className="w-20"
                min="1"
                max="1440"
                disabled={loading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateFrequency(frequency)}
                disabled={loading}
              >
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handleRunOnce}
              disabled={running || loading}
              className="w-full"
            >
              {running ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Once
                </>
              )}
            </Button>

            <Button
              onClick={handleReloadSources}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reload Sources
            </Button>

            <Button
              onClick={onUpdate}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>

            <Button
              onClick={handleStopService}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {runtime?.stats?.totalProcessed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Processed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {runtime?.stats?.totalCreated || 0}
              </div>
              <div className="text-xs text-muted-foreground">Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {runtime?.stats?.totalErrors || 0}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {runtime?.stats?.successRate || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
