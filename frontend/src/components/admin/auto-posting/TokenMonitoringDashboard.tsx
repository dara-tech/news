'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Shield, 
  Zap,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  MessageCircle,
  Settings,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

interface TokenHealth {
  isValid: boolean;
  expiresAt?: Date;
  daysLeft?: number;
  platform: string;
  details?: any;
  error?: string;
}

interface TokenMonitoringDashboardProps {
  settings: any;
  onRefresh: () => void;
}

export default function TokenMonitoringDashboard({ settings, onRefresh }: TokenMonitoringDashboardProps) {
  const [tokenHealth, setTokenHealth] = useState<Record<string, TokenHealth>>({});
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastAutoCheck, setLastAutoCheck] = useState<Date | null>(null);

  const platforms = [
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { key: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-sky-500' },
    { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { key: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'text-blue-400' }
  ];

  const checkTokenHealth = async (platform: string) => {
    try {
      setChecking(true);
      const response = await api.post('/admin/settings/social-media/check-token', { platform });
      
      if (response.data.success) {
        setTokenHealth(prev => ({
          ...prev,
          [platform]: response.data.tokenHealth
        }));
        
        // Removed toast notifications - status is shown in the UI instead
      }
    } catch (error) {
      console.error(`Error checking ${platform} token:`, error);
      setTokenHealth(prev => ({
        ...prev,
        [platform]: {
          isValid: false,
          platform,
          error: 'Failed to check token health'
        }
      }));
    } finally {
      setChecking(false);
    }
  };

  const refreshToken = async (platform: string) => {
    try {
      setChecking(true);
      const response = await api.post('/admin/settings/social-media/refresh-token', { platform });
      
      if (response.data.success) {
        // Removed success toast - status is shown in the UI
        await checkTokenHealth(platform);
        onRefresh();
      } else if (response.data.requiresManualRefresh) {
        // Removed manual refresh toast - instructions are shown in the UI
        console.log(`${platform} requires manual refresh:`, response.data.instructions);
      } else {
        // Removed error toast - error is shown in the UI
        console.error(`Failed to refresh ${platform} token:`, response.data.error);
      }
    } catch (error) {
      console.error(`Failed to refresh ${platform} token:`, error);
    } finally {
      setChecking(false);
    }
  };

  const checkAllTokens = async () => {
    setChecking(true);
    const promises = platforms.map(platform => checkTokenHealth(platform.key));
    await Promise.all(promises);
    setChecking(false);
    setLastAutoCheck(new Date());
  };

  const startAutoMonitoring = () => {
    setAutoRefresh(true);
    // Check every hour
    const interval = setInterval(checkAllTokens, 60 * 60 * 1000);
    return () => clearInterval(interval);
  };

  const stopAutoMonitoring = () => {
    setAutoRefresh(false);
  };

  useEffect(() => {
    // Initial check
    checkAllTokens();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (autoRefresh) {
      cleanup = startAutoMonitoring();
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [autoRefresh]);

  const getStatusColor = (health: TokenHealth) => {
    if (!health.isValid) return 'destructive';
    if (health.daysLeft && health.daysLeft <= 7) return 'secondary';
    return 'default';
  };

  const getStatusText = (health: TokenHealth) => {
    if (!health.isValid) return 'Invalid/Expired';
    if (health.daysLeft && health.daysLeft <= 7) return 'Expiring Soon';
    return 'Healthy';
  };

  const getProgressValue = (health: TokenHealth) => {
    if (!health.daysLeft) return 100;
    return Math.max(0, Math.min(100, (health.daysLeft / 60) * 100)); // Assuming 60 days max
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Token Health Monitor
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage social media token health across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={checkAllTokens}
            disabled={checking}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Check All
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Stop Auto' : 'Start Auto'}
          </Button>
        </div>
      </div>

      {/* Auto-Monitoring Status */}
      {autoRefresh && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Auto-Monitoring Active</AlertTitle>
          <AlertDescription>
            Token health is being checked automatically every hour.
            {lastAutoCheck && ` Last check: ${lastAutoCheck.toLocaleTimeString()}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const health = tokenHealth[platform.key];
              const Icon = platform.icon;
              
              return (
                <Card key={platform.key} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                      </div>
                      {health && (
                        <Badge variant={getStatusColor(health)}>
                          {getStatusText(health)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {health ? (
                      <>
                        {health.daysLeft !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Days Left</span>
                              <span className="font-medium">{health.daysLeft}</span>
                            </div>
                            <Progress value={getProgressValue(health)} className="h-2" />
                          </div>
                        )}
                        
                        {health.details && (
                          <div className="text-sm text-muted-foreground">
                            {health.details.name && <div>Name: {health.details.name}</div>}
                            {health.details.id && <div>ID: {health.details.id}</div>}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => checkTokenHealth(platform.key)}
                            disabled={checking}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
                            Check
                          </Button>
                          <Button
                            onClick={() => refreshToken(platform.key)}
                            disabled={checking}
                            size="sm"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Not checked yet</p>
                        <Button
                          onClick={() => checkTokenHealth(platform.key)}
                          disabled={checking}
                          size="sm"
                          className="mt-2"
                        >
                          Check Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {platforms.map((platform) => {
            const health = tokenHealth[platform.key];
            const Icon = platform.icon;
            
            return (
              <Card key={platform.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                      <CardTitle>{platform.name} Token Details</CardTitle>
                    </div>
                                         {health && (
                       <Badge variant={getStatusColor(health)} className="text-sm">
                         {getStatusText(health)}
                       </Badge>
                     )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {health ? (
                    <>
                      {/* Status Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {health.isValid ? (
                              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                            ) : (
                              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {health.isValid ? 'Valid' : 'Invalid'}
                          </div>
                        </div>
                        
                        {health.daysLeft !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold">{health.daysLeft}</div>
                            <div className="text-sm text-muted-foreground">Days Left</div>
                          </div>
                        )}
                        
                        {health.expiresAt && (
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {health.expiresAt.toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Expires</div>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {health.isValid ? '✅' : '❌'}
                          </div>
                          <div className="text-sm text-muted-foreground">Status</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {health.daysLeft !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Token Lifetime</span>
                            <span>{health.daysLeft} days remaining</span>
                          </div>
                          <Progress value={getProgressValue(health)} className="h-3" />
                        </div>
                      )}

                      {/* Details */}
                      {health.details && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Account Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {health.details.name && (
                              <div><span className="font-medium">Name:</span> {health.details.name}</div>
                            )}
                            {health.details.id && (
                              <div><span className="font-medium">ID:</span> {health.details.id}</div>
                            )}
                            {health.details.username && (
                              <div><span className="font-medium">Username:</span> {health.details.username}</div>
                            )}
                            {health.details.type && (
                              <div><span className="font-medium">Type:</span> {health.details.type}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Error Details */}
                      {health.error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{health.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => checkTokenHealth(platform.key)}
                          disabled={checking}
                          variant="outline"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                          Check Health
                        </Button>
                        <Button
                          onClick={() => refreshToken(platform.key)}
                          disabled={checking}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Refresh Token
                        </Button>
                        <Button
                          onClick={() => window.open(`/admin/auto-posting?tab=${platform.key}`, '_blank')}
                          variant="outline"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Token health not checked yet</p>
                      <Button
                        onClick={() => checkTokenHealth(platform.key)}
                        disabled={checking}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                        Check Token Health
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Token Management Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🟢 Healthy Tokens</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Valid and not expired</li>
                <li>• More than 7 days remaining</li>
                <li>• Auto-posting will work normally</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🟡 Expiring Soon</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 7 days or less remaining</li>
                <li>• Consider refreshing soon</li>
                <li>• Auto-posting may stop working</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔴 Invalid/Expired</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Token is invalid or expired</li>
                <li>• Auto-posting will not work</li>
                <li>• Refresh token immediately</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Auto-Monitoring</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Checks tokens every hour</li>
                <li>• Shows notifications for issues</li>
                <li>• Helps prevent posting failures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
