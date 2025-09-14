'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Zap,
  Activity,
  Server
} from 'lucide-react';

interface ServiceDependency {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  dependencies: string[];
  dependents: string[];
  category: 'core' | 'ai' | 'analytics' | 'social' | 'business' | 'infrastructure';
  description: string;
}

interface DependencyMap {
  services: ServiceDependency[];
  connections: Array<{
    from: string;
    to: string;
    type: 'critical' | 'optional' | 'data';
    status: 'healthy' | 'warning' | 'error';
  }>;
}

export default function Dependencies() {
  const [dependencyMap, setDependencyMap] = useState<DependencyMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    fetchDependencies();
    const interval = setInterval(fetchDependencies, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      // Fetch service health data to build dependency map
      const response = await fetch('/api/services/health');
      const data = await response.json();
      
      if (data.success) {
        const dependencies = generateDependencyMap(data.data.services);
        setDependencyMap(dependencies);
      }
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDependencyMap = (services: any[]): DependencyMap => {
    const serviceMap: { [key: string]: ServiceDependency } = {};
    const connections: Array<{ from: string; to: string; type: string; status: string }> = [];

    // Define service dependencies based on your architecture
    const dependencyRules = {
      'database': { dependencies: [], category: 'core', description: 'Primary database for all data storage' },
      'sentinel-core': { dependencies: ['database', 'ai-enhancement'], category: 'core', description: 'AI News Analysis Service' },
      'integration': { dependencies: ['database', 'cache', 'ai-enhancement', 'analytics'], category: 'core', description: 'Integration and data processing service' },
      'cache': { dependencies: ['database'], category: 'core', description: 'Redis cache for performance optimization' },
      'websocket': { dependencies: ['database'], category: 'core', description: 'Real-time communication service' },
      'ai-enhancement': { dependencies: ['database'], category: 'ai', description: 'AI content enhancement service' },
      'analytics': { dependencies: ['database', 'cache'], category: 'analytics', description: 'Analytics and reporting service' },
      'performance': { dependencies: ['cache', 'database'], category: 'core', description: 'Performance optimization service' }
    };

    // Build service map
    services.forEach(service => {
      const rule = dependencyRules[service.id as keyof typeof dependencyRules] || {
        dependencies: [],
        category: 'core',
        description: 'Service component'
      };

      serviceMap[service.id] = {
        id: service.id,
        name: service.name,
        status: service.status,
        dependencies: rule.dependencies,
        dependents: [],
        category: rule.category as 'core' | 'ai' | 'analytics' | 'social' | 'business' | 'infrastructure',
        description: rule.description
      };
    });

    // Build dependents and connections
    Object.values(serviceMap).forEach(service => {
      service.dependencies.forEach(depId => {
        if (serviceMap[depId]) {
          serviceMap[depId].dependents.push(service.id);
          connections.push({
            from: depId,
            to: service.id,
            type: 'critical',
            status: serviceMap[depId].status
          });
        }
      });
    });

    return {
      services: Object.values(serviceMap),
      connections: connections as Array<{ from: string; to: string; type: 'critical' | 'optional' | 'data'; status: 'healthy' | 'warning' | 'error' }>
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Server className="h-4 w-4" />;
      case 'ai': return <Zap className="h-4 w-4" />;
      case 'analytics': return <Activity className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getServiceById = (id: string) => {
    return dependencyMap?.services.find(s => s.id === id);
  };

  const getDependencyChain = (serviceId: string): string[] => {
    const visited = new Set<string>();
    const chain: string[] = [];
    
    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const service = getServiceById(id);
      if (service) {
        service.dependencies.forEach(dep => {
          traverse(dep);
          if (!chain.includes(dep)) {
            chain.push(dep);
          }
        });
        if (!chain.includes(id)) {
          chain.push(id);
        }
      }
    };
    
    traverse(serviceId);
    return chain;
  };

  if (loading && !dependencyMap) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Service Dependencies</h2>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!dependencyMap) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Service Dependencies</h2>
          <p className="text-sm text-muted-foreground">
            Service architecture and dependency relationships
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
              className="flex-1 sm:flex-none"
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
              className="flex-1 sm:flex-none"
            >
              Detailed
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDependencies} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dependency Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {dependencyMap.services.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Services</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {dependencyMap.connections.length}
                </div>
                <div className="text-xs text-muted-foreground">Dependencies</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {dependencyMap.services.filter(s => s.status === 'healthy').length}
                </div>
                <div className="text-xs text-muted-foreground">Healthy</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {dependencyMap.services.filter(s => s.status !== 'healthy').length}
                </div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid gap-4">
        {dependencyMap.services.map((service) => (
          <Card 
            key={service.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedService === service.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(service.status)}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    
                    {/* Dependencies */}
                    {service.dependencies.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs text-muted-foreground mb-1">Depends on:</div>
                        <div className="flex flex-wrap gap-1">
                          {service.dependencies.map(depId => {
                            const dep = getServiceById(depId);
                            return dep ? (
                              <Badge key={depId} variant="outline" className="text-xs">
                                {dep.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dependents */}
                    {service.dependents.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Required by:</div>
                        <div className="flex flex-wrap gap-1">
                          {service.dependents.map(depId => {
                            const dep = getServiceById(depId);
                            return dep ? (
                              <Badge key={depId} variant="outline" className="text-xs">
                                {dep.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(service.category)}
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{service.dependencies.length} deps</div>
                    <div>{service.dependents.length} dependents</div>
                  </div>
                </div>
              </div>

              {/* Detailed View */}
              {selectedService === service.id && viewMode === 'detailed' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Dependency Chain</h4>
                      <div className="space-y-1">
                        {getDependencyChain(service.id).map((depId, index) => {
                          const dep = getServiceById(depId);
                          return dep ? (
                            <div key={depId} className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">{index + 1}.</span>
                              {getStatusIcon(dep.status)}
                              <span className={dep.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                                {dep.name}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Impact Analysis</h4>
                      <div className="text-xs text-muted-foreground">
                        <div>If this service fails:</div>
                        <div className="mt-1">
                          • {service.dependents.length} services will be affected
                        </div>
                        <div>
                          • {getDependencyChain(service.id).length} services in dependency chain
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
