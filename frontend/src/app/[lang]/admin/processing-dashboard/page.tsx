'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, Settings, TrendingUp, PieChart, BarChart, Gauge,
  Database, FileText, Clock, Shield, Activity, AlertTriangle, CheckCircle,
  Radio, Bot, Cpu, Target, FileCheck, ArrowRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ProcessingDashboardService, 
  ProcessingMetrics, 
  ProcessFlow, 
  SystemHealth,
  SentinelLog,
  SentinelMetrics
} from '@/lib/processingDashboardService';

// Process Metrics Card Component
function ProcessMetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: any; 
  trend: 'up' | 'down' | 'neutral' 
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className="hover:border-slate-500 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <Icon className="h-4 w-4 text-cyan-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <p className={`text-xs ${getTrendColor()} flex items-center gap-1 mt-1`}>
          <span>{getTrendIcon()}</span>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

// Process Flow Card Component
function ProcessFlowCard({ flow }: { flow: ProcessFlow }) {
  const getStatusColor = () => {
    switch (flow.status) {
      case 'active': return 'bg-emerald-500';
      case 'processing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getStageColor = () => {
    switch (flow.stage) {
      case 'input': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'output': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100">{flow.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <Badge variant="outline" className="border-slate-500 text-slate-300">
              {flow.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          Stage: <span className={getStageColor()}>{flow.stage}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Progress</span>
            <span>{flow.progress}%</span>
          </div>
          <Progress value={flow.progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Input</p>
            <p className="text-slate-100 font-semibold">{flow.data.input}</p>
          </div>
          <div>
            <p className="text-slate-400">Processed</p>
            <p className="text-slate-100 font-semibold">{flow.data.processed}</p>
          </div>
          <div>
            <p className="text-slate-400">Output</p>
            <p className="text-slate-100 font-semibold">{flow.data.output}</p>
          </div>
          <div>
            <p className="text-slate-400">Errors</p>
            <p className="text-red-400 font-semibold">{flow.data.errors}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded">
            <p className="text-slate-400">Throughput</p>
            <p className="text-cyan-400 font-semibold">{flow.performance.throughput}/min</p>
          </div>
          <div className="text-center p-2  rounded">
            <p className="text-slate-400">Latency</p>
            <p className="text-yellow-400 font-semibold">{flow.performance.latency}s</p>
          </div>
          <div className="text-center p-2 0 rounded">
            <p className="text-slate-400">Efficiency</p>
            <p className="text-emerald-400 font-semibold">{flow.performance.efficiency}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// System Health Card Component
function SystemHealthCard({ health }: { health: SystemHealth }) {
  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100">System Health</CardTitle>
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
        </div>
        <CardDescription className="text-slate-400">
          Overall Status: <span className={getStatusColor()}>{health.status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Uptime</p>
            <p className="text-slate-100 font-semibold">{health.uptime}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Active Connections</p>
            <p className="text-slate-100 font-semibold">{health.activeConnections}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Memory Usage</span>
              <span>{health.memoryUsage}%</span>
            </div>
            <Progress value={health.memoryUsage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>CPU Usage</span>
              <span>{health.cpuUsage}%</span>
            </div>
            <Progress value={health.cpuUsage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>Disk Usage</span>
              <span>{health.diskUsage}%</span>
            </div>
            <Progress value={health.diskUsage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sentinel Logs Component
function SentinelLogsCard({ logs }: { logs: SentinelLog[] }) {
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 border-red-400/20';
      case 'warning': return 'text-yellow-400 border-yellow-400/20';
      case 'info': return 'text-blue-400 border-blue-400/20';
      default: return 'text-slate-400 border-slate-400/20';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Sentinel Processing Logs</CardTitle>
        <CardDescription className="text-slate-400">
          Real-time processing activity from Sentinel AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getLogLevelColor(log.level)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-sm">{getLogLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs border-slate-500">
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono break-words">{log.message}</p>
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-400 cursor-pointer">
                          Metadata
                        </summary>
                        <pre className="text-xs text-slate-300 mt-1 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Process Flow Diagram Component
function ProcessFlowDiagram({ data, sentinelMetrics }: { data: any[], sentinelMetrics: any }) {
  const processNodes = [
    {
      id: 'input',
      name: 'RSS Sources',
      icon: Radio,
      status: sentinelMetrics?.enabled ? 'active' : 'idle',
      data: sentinelMetrics?.sourcesCount || 0,
      position: 'left',
      color: 'emerald'
    },
    {
      id: 'sentinel',
      name: 'Sentinel AI',
      icon: Bot,
      status: sentinelMetrics?.running ? 'processing' : (sentinelMetrics?.enabled ? 'active' : 'idle'),
      data: sentinelMetrics?.lastProcessed || 0,
      position: 'center',
      color: 'blue'
    },
    {
      id: 'processing',
      name: 'Content Processing',
      icon: Cpu,
      status: sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle',
      data: sentinelMetrics?.lastCreated || 0,
      position: 'center',
      color: 'cyan'
    },
    {
      id: 'seo',
      name: 'SEO Optimization',
      icon: Target,
      status: 'active',
      data: data.find(d => d.name === 'SEO Optimization Engine')?.value || 0,
      position: 'center',
      color: 'purple'
    },
    {
      id: 'output',
      name: 'Published Articles',
      icon: FileCheck,
      status: sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle',
      data: sentinelMetrics?.lastCreated || 0,
      position: 'right',
      color: 'green'
    }
  ];

  const getStatusColor = (status: string, color: string) => {
    if (status === 'processing') return 'border-blue-500';
    if (status === 'active') {
      switch (color) {
        case 'emerald': return 'border-emerald-500';
        case 'blue': return 'border-blue-500';
        case 'cyan': return 'border-cyan-500';
        case 'purple': return 'border-purple-500';
        case 'green': return 'border-green-500';
        default: return 'border-emerald-500';
      }
    }
    return 'border-slate-500';
  };

  const getStatusGlow = (status: string, color: string) => {
    if (status === 'processing') return 'shadow-blue-500/30 shadow-lg';
    if (status === 'active') {
      switch (color) {
        case 'emerald': return 'shadow-emerald-500/30 shadow-lg';
        case 'blue': return 'shadow-blue-500/30 shadow-lg';
        case 'cyan': return 'shadow-cyan-500/30 shadow-lg';
        case 'purple': return 'shadow-purple-500/30 shadow-lg';
        case 'green': return 'shadow-green-500/30 shadow-lg';
        default: return 'shadow-emerald-500/30 shadow-lg';
      }
    }
    return 'shadow-slate-500/20 shadow-lg';
  };

  const getIconColor = (status: string, color: string) => {
    if (status === 'processing') return 'text-blue-400';
    if (status === 'active') {
      switch (color) {
        case 'emerald': return 'text-emerald-400';
        case 'blue': return 'text-blue-400';
        case 'cyan': return 'text-cyan-400';
        case 'purple': return 'text-purple-400';
        case 'green': return 'text-green-400';
        default: return 'text-emerald-400';
      }
    }
    return 'text-slate-500';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          Process Flow Visualization
        </CardTitle>
        <CardDescription className="text-slate-400">
          Real-time data flow through the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 rounded-lg overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px] animate-pulse"></div>
            </div>
            
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Energy Field Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
          </div>

          {/* Process Flow */}
          <div className="relative h-full flex items-center justify-between px-8">
            {/* Flow Connections with Advanced Animation */}
            <div className="absolute inset-0 flex items-center justify-between px-20">
              {processNodes.slice(0, -1).map((node, index) => {
                const nextNode = processNodes[index + 1];
                const isActive = node.status === 'active' || node.status === 'processing';
                const isNextActive = nextNode.status === 'active' || nextNode.status === 'processing';
                const isFlowing = isActive && isNextActive;
                
                return (
                  <div key={`connection-${index}`} className="flex-1 relative">
                    {/* Main Flow Line */}
                    <div className={`h-1 mx-4 relative rounded-full transition-all duration-500 ${
                      isFlowing 
                        ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-600/30'
                    }`}>
                      {/* Animated Flow Particles */}
                      {isFlowing && (
                        <>
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            <div className="h-full w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-80"></div>
                          </div>
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            <div className="h-full w-8 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
                          </div>
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            <div className="h-full w-6 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Flow Direction Arrow */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className={`h-5 w-5 transition-all duration-300 ${
                        isFlowing 
                          ? 'text-cyan-400 animate-pulse drop-shadow-lg' 
                          : 'text-slate-500'
                      }`} />
                    </div>

                    {/* Data Packets */}
                    {isFlowing && (
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping"
                            style={{
                              left: `${20 + i * 20}%`,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              animationDelay: `${i * 0.5}s`,
                              animationDuration: '2s'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Process Nodes with 3D Effects */}
            <div className="relative w-full flex items-center justify-between">
              {processNodes.map((node, index) => {
                const IconComponent = node.icon;
                const isActive = node.status === 'active' || node.status === 'processing';
                
                return (
                  <div key={node.id} className="flex flex-col items-center space-y-4 z-10">
                    {/* Node with 3D Transform */}
                    <div className={`relative p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-110 hover:rotate-1 ${
                      getStatusColor(node.status, node.color)
                    } ${getStatusGlow(node.status, node.color)} transform perspective-1000`}>
                      
                      {/* Status Indicator with Pulse Ring */}
                      <div className="absolute -top-3 -right-3">
                        <div className={`w-5 h-5 rounded-full ${node.status === 'processing' ? 'bg-blue-500' : isActive ? 'bg-emerald-500' : 'bg-slate-500'} animate-pulse border-2 border-slate-800`}></div>
                        {isActive && (
                          <div className={`absolute inset-0 w-5 h-5 rounded-full ${node.status === 'processing' ? 'bg-blue-500' : 'bg-emerald-500'} animate-ping opacity-30`}></div>
                        )}
                      </div>
                      
                      {/* Node Content with Hover Effects */}
                      <div className="text-center transform transition-all duration-300 hover:scale-105">
                        <div className={`relative mb-4 ${getIconColor(node.status, node.color)}`}>
                          <IconComponent className="h-10 w-10 mx-auto drop-shadow-lg" />
                          {isActive && (
                            <div className="absolute inset-0 h-10 w-10 bg-current rounded-full animate-ping opacity-20"></div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-200 mb-2">{node.name}</div>
                        <div className="text-lg font-bold text-cyan-400 mb-1">
                          {node.data.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400">items</div>
                      </div>

                      {/* Processing Animation Rings */}
                      {node.status === 'processing' && (
                        <>
                          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-20"></div>
                          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
                        </>
                      )}
                      
                      {/* Active Glow Effect */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-5 animate-pulse"></div>
                      )}
                    </div>

                    {/* Node Label with Animation */}
                    <div className="text-xs text-slate-400 text-center max-w-24 leading-tight font-medium">
                      {node.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advanced Metrics Panel */}
            <div className="absolute top-4 right-4 space-y-3">
              <div className="backdrop-blur-md rounded-xl p-4 border border-slate-600/50 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <div className="text-sm font-bold text-slate-300">Total Throughput</div>
                </div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {processNodes.reduce((sum, node) => sum + node.data, 0).toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 font-medium">items/min</div>
              </div>
              
              <div className="backdrop-blur-md rounded-xl p-4 border border-slate-600/50 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <div className="text-sm font-bold text-slate-300">Active Nodes</div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {processNodes.filter(n => n.status === 'active' || n.status === 'processing').length}
                </div>
                <div className="text-xs text-slate-400 font-medium">of {processNodes.length}</div>
              </div>

              {/* Sentinel Status with Advanced Styling */}
              {sentinelMetrics && (
                <div className="backdrop-blur-md rounded-xl p-4 border border-slate-600/50 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-400 animate-pulse" />
                    <div className="text-sm font-bold text-slate-300">Sentinel Status</div>
                  </div>
                  <div className={`text-lg font-bold mb-1 ${
                    sentinelMetrics.running ? 'text-blue-400' : sentinelMetrics.enabled ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {sentinelMetrics.running ? 'Processing' : sentinelMetrics.enabled ? 'Ready' : 'Disabled'}
                  </div>
                  {sentinelMetrics.nextRunAt && (
                    <div className="text-xs text-slate-400 font-medium">
                      Next: {new Date(sentinelMetrics.nextRunAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance Indicators with Advanced Styling */}
            <div className="absolute bottom-4 left-4 space-y-3">
              <div className="flex items-center space-x-3 backdrop-blur-md rounded-xl px-4 py-3 border border-slate-600/50 shadow-xl">
                <div className={`w-3 h-3 rounded-full animate-pulse ${sentinelMetrics?.enabled ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                <span className="text-sm font-medium text-slate-300">
                  {sentinelMetrics?.enabled ? 'System Operational' : 'System Disabled'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 backdrop-blur-md rounded-xl px-4 py-3 border border-slate-600/50 shadow-xl">
                <div className={`w-3 h-3 rounded-full animate-pulse ${sentinelMetrics?.running ? 'bg-cyan-500' : 'bg-slate-500'}`}></div>
                <span className="text-sm font-medium text-slate-300">
                  {sentinelMetrics?.running ? 'Data Flowing' : 'Data Idle'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Animated Elements */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-30 delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-35 delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-25 delay-1500"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProcessingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalProcessed: 0,
    totalCreated: 0,
    averageProcessingTime: 0,
    uptime: 0,
    errorRate: 0,
    lastReset: new Date().toISOString(),
    performance: { throughput: 0, latency: 0, efficiency: 0 }
  });
  const [processFlows, setProcessFlows] = useState<ProcessFlow[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    lastCheck: new Date().toISOString()
  });
  const [sentinelLogs, setSentinelLogs] = useState<SentinelLog[]>([]);
  const [sentinelMetrics, setSentinelMetrics] = useState<SentinelMetrics>({
    enabled: false,
    running: false,
    lastRunAt: null,
    nextRunAt: null,
    lastCreated: 0,
    lastProcessed: 0,
    cooldownUntil: null,
    maxPerRun: 3,
    frequencyMs: 300000,
    sourcesCount: 0,
    performanceMetrics: {
      totalProcessed: 0,
      totalCreated: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      lastReset: new Date().toISOString()
    }
  });

  const loadDashboardData = async (showToast = false) => {
    setLoading(true);
    try {
      const [metricsData, flowsData, healthData, logsData, sentinelData] = await Promise.all([
        ProcessingDashboardService.fetchMetrics(),
        ProcessingDashboardService.fetchProcessFlows(),
        ProcessingDashboardService.fetchSystemHealth(),
        ProcessingDashboardService.fetchSentinelLogs(),
        ProcessingDashboardService.fetchSentinelMetrics()
      ]);

      setMetrics(metricsData);
      setProcessFlows(flowsData);
      setSystemHealth(healthData);
      setSentinelLogs(logsData);
      setSentinelMetrics(sentinelData);
      setLastRefreshTime(Date.now());

      if (showToast) {
        toast.success('Dashboard data refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (showToast) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData(false);
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => loadDashboardData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const getProcessFlowData = () => {
    return processFlows.map(flow => ({
      name: flow.name,
      value: flow.data.processed,
      status: flow.status
    }));
  };

  return (
    <div className="min-h-screen text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 [radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 [radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.05),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full [url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233b82f6%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold [gradient-to-r_from-cyan-400_to-blue-500] bg-clip-text text-transparent">
              Process Mining Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Advanced AI-powered process analysis and optimization system
            </p>
            {lastRefreshTime > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-slate-500">
                  Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleManualRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:border-slate-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:border-slate-500"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 border border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:text-cyan-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="processes" className="data-[state=active]:text-cyan-400">
              Process Flows
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:text-cyan-400">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:text-cyan-400">
              System Health
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:text-cyan-400">
              Sentinel Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProcessMetricsCard
                title="Total Processed"
                value={metrics.totalProcessed.toLocaleString()}
                change="+15% from last hour"
                icon={Database}
                trend="up"
              />
              <ProcessMetricsCard
                title="Articles Created"
                value={metrics.totalCreated.toLocaleString()}
                change="+12% from last hour"
                icon={FileText}
                trend="up"
              />
              <ProcessMetricsCard
                title="Avg Processing Time"
                value={`${metrics.averageProcessingTime}s`}
                change="-8% from last hour"
                icon={Clock}
                trend="down"
              />
              <ProcessMetricsCard
                title="System Uptime"
                value={`${metrics.uptime}%`}
                change="18 hours without issues"
                icon={Shield}
                trend="neutral"
              />
            </div>

            {/* Process Flow Visualization */}
            <ProcessFlowDiagram data={getProcessFlowData()} sentinelMetrics={sentinelMetrics} />
          </TabsContent>

          {/* Process Flows Tab */}
          <TabsContent value="processes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {processFlows.map((flow) => (
                <ProcessFlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">Performance Trends</CardTitle>
                  <CardDescription className="text-slate-400">
                    System performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-slate-400 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Performance charts coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">Resource Utilization</CardTitle>
                  <CardDescription className="text-slate-400">
                    System resource usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-slate-400 text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Resource charts coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealthCard health={systemHealth} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">Sentinel Status</CardTitle>
                  <CardDescription className="text-slate-400">
                    AI processing system status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <Badge variant={sentinelMetrics.running ? "default" : "secondary"} className="mt-1">
                        {sentinelMetrics.running ? 'Running' : 'Stopped'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Sources</p>
                      <p className="text-slate-100 font-semibold">{sentinelMetrics.sourcesCount}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Run</span>
                      <span className="text-slate-300">
                        {sentinelMetrics.lastRunAt ? new Date(sentinelMetrics.lastRunAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Next Run</span>
                      <span className="text-slate-300">
                        {sentinelMetrics.nextRunAt ? new Date(sentinelMetrics.nextRunAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Per Run</span>
                      <span className="text-slate-300">{sentinelMetrics.maxPerRun}</span>
                    </div>
                  </div>

                  {sentinelMetrics.cooldownUntil && (
                    <div className="p-3 border border-yellow-400/20 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        ⏰ Cooldown until: {new Date(sentinelMetrics.cooldownUntil).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sentinel Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <SentinelLogsCard logs={sentinelLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
