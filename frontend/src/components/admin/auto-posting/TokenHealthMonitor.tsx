'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface TokenHealthMonitorProps {
  settings: {
    facebook: {
      enabled: boolean;
      appId: string;
      pageId: string;
      pageAccessToken: string;
      status: 'connected' | 'disconnected' | 'error';
    };
  };
  onRefresh: () => void;
}

interface TokenHealth {
  valid: boolean;
  expiresAt?: Date;
  daysLeft?: number;
  pageName?: string;
  pageId?: string;
  error?: string;
  lastChecked: Date;
}

export default function TokenHealthMonitor({ settings, onRefresh }: TokenHealthMonitorProps) {
  const [tokenHealth, setTokenHealth] = useState<TokenHealth | null>(null);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastAutoCheck, setLastAutoCheck] = useState<Date | null>(null);

  // Check token health
  const checkTokenHealth = async () => {
    if (!settings.facebook.enabled || !settings.facebook.pageAccessToken) {
      setTokenHealth({
        valid: false,
        error: 'Facebook not configured',
        lastChecked: new Date()
      });
      return;
    }

    setChecking(true);
    try {
      const response = await api.post('/admin/settings/social-media/check-token', {
        platform: 'facebook'
      });
      
      setTokenHealth({
        valid: response.data.valid,
        expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined,
        daysLeft: response.data.daysLeft,
        pageName: response.data.pageName,
        pageId: response.data.pageId,
        error: response.data.error,
        lastChecked: new Date()
      });

      // Removed toast notifications - status is shown in the UI instead
    } catch (error: any) {setTokenHealth({
        valid: false,
        error: error.response?.data?.message || 'Failed to check token health',
        lastChecked: new Date()
      });
    } finally {
      setChecking(false);
    }
  };

  // Auto-refresh token
  const refreshToken = async () => {
    try {
      const response = await api.post('/admin/settings/social-media/refresh-token', {
        platform: 'facebook'
      });
      
      if (response.data.success) {
        // Removed toast notifications - status is shown in the UI instead
        onRefresh(); // Refresh settings
        checkTokenHealth(); // Re-check health
      } else {
        // Removed toast notifications - status is shown in the UI instead
      }
    } catch (error: any) {// Removed toast notifications - status is shown in the UI instead
    }
  };

  // Start auto-monitoring
  const startAutoMonitoring = () => {
    setAutoRefresh(true);
    // Check every hour
    const interval = setInterval(() => {
      checkTokenHealth();
      setLastAutoCheck(new Date());
    }, 60 * 60 * 1000); // 1 hour

    // Store interval for cleanup
    (window as any).tokenHealthInterval = interval;
  };

  // Stop auto-monitoring
  const stopAutoMonitoring = () => {
    setAutoRefresh(false);
    if ((window as any).tokenHealthInterval) {
      clearInterval((window as any).tokenHealthInterval);
    }
  };

  // Initial check
  useEffect(() => {
    checkTokenHealth();
  }, [settings.facebook.pageAccessToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).tokenHealthInterval) {
        clearInterval((window as any).tokenHealthInterval);
      }
    };
  }, []);

  const getStatusColor = (valid: boolean, daysLeft?: number) => {
    if (!valid) return 'destructive';
    if (!daysLeft || daysLeft > 30) return 'default';
    if (daysLeft > 7) return 'secondary';
    if (daysLeft > 3) return 'warning';
    return 'destructive';
  };

  const getStatusText = (valid: boolean, daysLeft?: number) => {
    if (!valid) return 'Expired';
    if (!daysLeft || daysLeft > 30) return 'Healthy';
    if (daysLeft > 7) return 'Warning';
    if (daysLeft > 3) return 'Critical';
    return 'Expiring Soon';
  };

  const getProgressValue = (daysLeft?: number) => {
    if (!daysLeft) return 100;
    if (daysLeft > 60) return 100;
    return Math.max(0, (daysLeft / 60) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Token Health Monitor
        </CardTitle>
        <CardDescription>
          Monitor and manage Facebook token health automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {tokenHealth && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  'text-xs',
                  tokenHealth.valid ? 'bg-green-500' : 'bg-red-500'
                )}>
                  {getStatusText(tokenHealth.valid, tokenHealth.daysLeft)}
                </Badge>
                {tokenHealth.valid && tokenHealth.daysLeft && (
                  <span className="text-sm text-muted-foreground">
                    {tokenHealth.daysLeft} days left
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Last checked: {tokenHealth.lastChecked.toLocaleTimeString()}
              </div>
            </div>

            {/* Progress Bar */}
            {tokenHealth.valid && tokenHealth.daysLeft && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Token Health</span>
                  <span>{Math.round(getProgressValue(tokenHealth.daysLeft))}%</span>
                </div>
                <Progress value={getProgressValue(tokenHealth.daysLeft)} />
              </div>
            )}

            {/* Page Info */}
            {tokenHealth.pageName && (
              <div className="text-sm">
                <span className="text-muted-foreground">Page: </span>
                <span className="font-medium">{tokenHealth.pageName}</span>
                {tokenHealth.pageId && (
                  <span className="text-muted-foreground ml-2">({tokenHealth.pageId})</span>
                )}
              </div>
            )}

            {/* Expiry Info */}
            {tokenHealth.expiresAt && (
              <div className="text-sm">
                <span className="text-muted-foreground">Expires: </span>
                <span className="font-medium">{tokenHealth.expiresAt.toLocaleDateString()}</span>
              </div>
            )}

            {/* Error Display */}
            {tokenHealth.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Token Error</AlertTitle>
                <AlertDescription>{tokenHealth.error}</AlertDescription>
              </Alert>
            )}

            {/* Warning for Expiring Soon */}
            {tokenHealth.valid && tokenHealth.daysLeft && tokenHealth.daysLeft <= 7 && (
              <Alert variant="default">
                <Clock className="h-4 w-4" />
                <AlertTitle>Token Expiring Soon</AlertTitle>
                <AlertDescription>
                  Your Facebook token expires in {tokenHealth.daysLeft} days. 
                  Consider refreshing it to avoid interruption.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={checkTokenHealth}
            disabled={checking}
            variant="outline"
            size="sm"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Check Health
          </Button>

          {tokenHealth?.valid && (
            <Button
              onClick={refreshToken}
              variant="outline"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto Refresh
            </Button>
          )}

          <Button
            onClick={autoRefresh ? stopAutoMonitoring : startAutoMonitoring}
            variant={autoRefresh ? "destructive" : "default"}
            size="sm"
          >
            {autoRefresh ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Start Auto-Monitoring
              </>
            )}
          </Button>

          <Button
            onClick={() => window.open('https://developers.facebook.com/tools/explorer/', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get New Token
          </Button>
        </div>

        {/* Auto-Monitoring Status */}
        {autoRefresh && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Auto-monitoring active - checking every hour
            </div>
            {lastAutoCheck && (
              <div>Last auto-check: {lastAutoCheck.toLocaleTimeString()}</div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Auto-monitoring checks token health every hour</p>
          <p>• You'll be notified when token expires or is expiring soon</p>
          <p>• Auto-refresh attempts to renew the token automatically</p>
          <p>• Manual refresh may be required if auto-refresh fails</p>
        </div>
      </CardContent>
    </Card>
  );
}
