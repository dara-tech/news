'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bell, 
  BellOff,
  RefreshCw,
  Clock,
  Zap
} from 'lucide-react';

interface Alert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  value?: number;
  threshold?: number;
}

interface AlertRule {
  id: string;
  name: string;
  serviceId: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  useEffect(() => {
    fetchAlerts();
    fetchRules();
    const interval = setInterval(fetchAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // For now, generate alerts based on real service data
      const response = await fetch('/api/services/health');
      const data = await response.json();
      
      if (data.success) {
        const generatedAlerts = generateAlertsFromServiceData(data.data.services);
        setAlerts(generatedAlerts);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    // Mock alert rules based on your real service data
    const mockRules: AlertRule[] = [
      {
        id: 'db-response-time',
        name: 'Database Response Time',
        serviceId: 'database',
        condition: 'responseTime > 100ms',
        threshold: 100,
        severity: 'high',
        enabled: true
      },
      {
        id: 'cache-hit-rate',
        name: 'Cache Hit Rate',
        serviceId: 'cache',
        condition: 'hitRate < 50%',
        threshold: 50,
        severity: 'medium',
        enabled: true
      },
      {
        id: 'ai-rate-limit',
        name: 'AI Rate Limit',
        serviceId: 'ai-enhancement',
        condition: 'rateLimitRemaining < 10',
        threshold: 10,
        severity: 'critical',
        enabled: true
      },
      {
        id: 'websocket-users',
        name: 'WebSocket Users',
        serviceId: 'websocket',
        condition: 'connectedUsers > 1000',
        threshold: 1000,
        severity: 'low',
        enabled: true
      },
      {
        id: 'sentinel-uptime',
        name: 'Sentinel Uptime',
        serviceId: 'sentinel-core',
        condition: 'uptime < 95%',
        threshold: 95,
        severity: 'high',
        enabled: true
      }
    ];
    setRules(mockRules);
  };

  const generateAlertsFromServiceData = (services: any[]): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    services.forEach(service => {
      // Database response time alert
      if (service.id === 'database' && service.responseTime > 50) {
        alerts.push({
          id: `alert-${service.id}-response-${now.getTime()}`,
          serviceId: service.id,
          serviceName: service.name,
          severity: service.responseTime > 100 ? 'high' : 'medium',
          message: `High response time: ${service.responseTime}ms`,
          timestamp: now.toISOString(),
          acknowledged: false,
          resolved: false,
          value: service.responseTime,
          threshold: 50
        });
      }

      // Cache hit rate alert
      if (service.id === 'cache' && service.details?.hitRate) {
        const hitRate = parseFloat(service.details.hitRate.replace('%', ''));
        if (hitRate < 50) {
          alerts.push({
            id: `alert-${service.id}-hitrate-${now.getTime()}`,
            serviceId: service.id,
            serviceName: service.name,
            severity: hitRate < 20 ? 'critical' : 'medium',
            message: `Low cache hit rate: ${service.details.hitRate}`,
            timestamp: now.toISOString(),
            acknowledged: false,
            resolved: false,
            value: hitRate,
            threshold: 50
          });
        }
      }

      // AI rate limit alert
      if (service.id === 'ai-enhancement' && service.details?.rateLimitRemaining < 20) {
        alerts.push({
          id: `alert-${service.id}-ratelimit-${now.getTime()}`,
          serviceId: service.id,
          serviceName: service.name,
          severity: service.details.rateLimitRemaining < 5 ? 'critical' : 'high',
          message: `Low AI rate limit: ${service.details.rateLimitRemaining} remaining`,
          timestamp: now.toISOString(),
          acknowledged: false,
          resolved: false,
          value: service.details.rateLimitRemaining,
          threshold: 20
        });
      }

      // Sentinel uptime alert
      if (service.id === 'sentinel-core' && service.details?.uptime < 98) {
        alerts.push({
          id: `alert-${service.id}-uptime-${now.getTime()}`,
          serviceId: service.id,
          serviceName: service.name,
          severity: service.details.uptime < 95 ? 'critical' : 'medium',
          message: `Low uptime: ${service.details.uptime}%`,
          timestamp: now.toISOString(),
          acknowledged: false,
          resolved: false,
          value: service.details.uptime,
          threshold: 98
        });
      }
    });

    return alerts;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'active': return !alert.acknowledged && !alert.resolved;
      case 'acknowledged': return alert.acknowledged && !alert.resolved;
      case 'resolved': return alert.resolved;
      default: return true;
    }
  });

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => !a.acknowledged && !a.resolved).length,
    acknowledged: alerts.filter(a => a.acknowledged && !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Service Alerts</h2>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Service Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Real-time alerts based on service health data
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{alertStats.active}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{alertStats.acknowledged}</div>
                <div className="text-xs text-muted-foreground">Acknowledged</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{alertStats.resolved}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-gray-600">{alertStats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'active', label: 'Active' },
          { key: 'acknowledged', label: 'Acknowledged' },
          { key: 'resolved', label: 'Resolved' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="grid gap-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.serviceName}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-xs">
                            Acknowledged
                          </Badge>
                        )}
                        {alert.resolved && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                        {alert.value !== undefined && alert.threshold !== undefined && (
                          <div>
                            Value: {alert.value} (Threshold: {alert.threshold})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="w-full sm:w-auto"
                      >
                        <BellOff className="h-3 w-3 mr-1" />
                        Ack
                      </Button>
                    )}
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
