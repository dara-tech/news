'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, Settings, TrendingUp, PieChart, BarChart, Gauge,
  Database, FileText, Clock, Shield, Activity, AlertTriangle, CheckCircle,
  Radio, Bot, Cpu, Target, FileCheck, ArrowRight, Zap, Smartphone, Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { ProcessingDashboardService } from '@/lib/processingDashboardService';

// Types
interface ProcessingMetrics {
  totalProcessed: number;
  totalCreated: number;
  averageProcessingTime: number;
  uptime: number;
  errorRate: number;
  lastReset: string;
  performance: {
    throughput: number;
    latency: number;
    efficiency: number;
  };
}

interface ProcessFlow {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  stage: 'input' | 'processing' | 'output' | 'error';
  progress: number;
  data: {
    input: number;
    processed: number;
    output: number;
    errors: number;
  };
  performance: {
    throughput: number;
    latency: number;
    efficiency: number;
  };
  lastActivity: string;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastCheck: string;
}

interface SentinelLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: any;
}

interface SentinelMetrics {
  enabled: boolean;
  running: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastCreated: number;
  lastProcessed: number;
  cooldownUntil: string | null;
  maxPerRun: number;
  frequencyMs: number;
  sourcesCount: number;
  performanceMetrics: {
    totalProcessed: number;
    totalCreated: number;
    averageProcessingTime: number;
    errorRate: number;
    lastReset: string;
  };
}

interface ProcessMetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

interface ProcessFlowCardProps {
  flow: ProcessFlow;
}

interface SystemHealthCardProps {
  health: SystemHealth;
}

// Process Metrics Card Component
function ProcessMetricsCard({ title, value, change, icon: Icon, trend = 'up' }: ProcessMetricsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <Card className="hover:border-slate-500 transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs ${getTrendColor()} flex items-center gap-1 mt-1`}>
            <span>{getTrendIcon()}</span>
            <span>{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Process Flow Card Component
function ProcessFlowCard({ flow }: ProcessFlowCardProps) {
  const getStatusColor = () => {
    switch (flow.status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'processing': return 'text-blue-600 dark:text-blue-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (flow.status) {
      case 'active': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertTriangle;
      default: return Shield;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">{flow.name}</CardTitle>
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
        </div>
        <CardDescription className="text-muted-foreground">
          Stage: <span className={getStatusColor()}>{flow.stage}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{flow.progress}%</span>
          </div>
          <Progress value={flow.progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Input</p>
            <p className="text-foreground font-semibold">{flow.data.input}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Output</p>
            <p className="text-foreground font-semibold">{flow.data.output}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded bg-muted/30">
            <p className="text-muted-foreground">Throughput</p>
            <p className="text-cyan-600 dark:text-cyan-400 font-semibold">{flow.performance.throughput}/min</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className="text-muted-foreground">Latency</p>
            <p className="text-yellow-600 dark:text-yellow-400 font-semibold">{flow.performance.latency}s</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className="text-muted-foreground">Efficiency</p>
            <p className="text-green-600 dark:text-green-400 font-semibold">{flow.performance.efficiency}%</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last activity: {new Date(flow.lastActivity).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

// System Health Card Component
function SystemHealthCard({ health }: SystemHealthCardProps) {
  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Shield;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">System Health</CardTitle>
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
        </div>
        <CardDescription className="text-muted-foreground">
          Overall Status: <span className={getStatusColor()}>{health.status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Uptime</p>
            <p className="text-foreground font-semibold">{health.uptime}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Active Connections</p>
            <p className="text-foreground font-semibold">{health.activeConnections}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Memory Usage</span>
              <span>{health.memoryUsage}%</span>
            </div>
            <Progress value={health.memoryUsage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>CPU Usage</span>
              <span>{health.cpuUsage}%</span>
            </div>
            <Progress value={health.cpuUsage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
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
      case 'error': return 'text-red-600 dark:text-red-400 border-red-400/20 bg-red-50 dark:bg-red-950/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 border-yellow-400/20 bg-yellow-50 dark:bg-yellow-950/20';
      case 'info': return 'text-blue-600 dark:text-blue-400 border-blue-400/20 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-muted-foreground border-muted/20 bg-muted/20';
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
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Sentinel Processing Logs</CardTitle>
        <CardDescription className="text-muted-foreground">
          Real-time processing activity from Sentinel AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No logs available</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getLogLevelColor(log.level)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-sm">{getLogLevelIcon(log.level)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm font-mono break-words text-foreground">{log.message}</p>
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Metadata
                        </summary>
                        <pre className="text-xs text-muted-foreground mt-1 p-2 rounded overflow-x-auto bg-muted/30">
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

// Process Flow Diagram Component with Drag and Drop
function ProcessFlowDiagram({ data, sentinelMetrics }: { data: any[], sentinelMetrics: any }) {
  const [processNodes, setProcessNodes] = useState([
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
  ]);

  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  // Update nodes when data changes
  useEffect(() => {
    setProcessNodes(prev => prev.map(node => ({
      ...node,
      status: node.id === 'input' ? (sentinelMetrics?.enabled ? 'active' : 'idle') :
              node.id === 'sentinel' ? (sentinelMetrics?.running ? 'processing' : (sentinelMetrics?.enabled ? 'active' : 'idle')) :
              node.id === 'processing' ? (sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle') :
              node.id === 'seo' ? 'active' :
              node.id === 'output' ? (sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle') : 'idle',
      data: node.id === 'input' ? (sentinelMetrics?.sourcesCount || 0) :
            node.id === 'sentinel' ? (sentinelMetrics?.lastProcessed || 0) :
            node.id === 'processing' ? (sentinelMetrics?.lastCreated || 0) :
            node.id === 'seo' ? (data.find(d => d.name === 'SEO Optimization Engine')?.value || 0) :
            node.id === 'output' ? (sentinelMetrics?.lastCreated || 0) : 0
    })));
  }, [sentinelMetrics, data]);

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', nodeId);
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    if (draggedNode && draggedNode !== nodeId) {
      setDragOverNode(nodeId);
    }
  };

  const handleDragLeave = () => {
    setDragOverNode(null);
  };

  const handleDrop = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    if (draggedNode && draggedNode !== targetNodeId) {
      const draggedIndex = processNodes.findIndex(node => node.id === draggedNode);
      const targetIndex = processNodes.findIndex(node => node.id === targetNodeId);
      
      const newNodes = [...processNodes];
      const [draggedNodeData] = newNodes.splice(draggedIndex, 1);
      newNodes.splice(targetIndex, 0, draggedNodeData);
      
      setProcessNodes(newNodes);
      toast.success(`Moved ${draggedNodeData.name} to new position`);
    }
    setDraggedNode(null);
    setDragOverNode(null);
  };

  const getStatusColor = (status: string, color: string) => {
    if (status === 'processing') return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    if (status === 'active') {
      switch (color) {
        case 'emerald': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
        case 'blue': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
        case 'cyan': return 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20';
        case 'purple': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
        case 'green': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
        default: return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      }
    }
    return 'border-muted bg-muted/20';
  };

  const getIconColor = (status: string, color: string) => {
    if (status === 'processing') return 'text-blue-600 dark:text-blue-400';
    if (status === 'active') {
      switch (color) {
        case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
        case 'blue': return 'text-blue-600 dark:text-blue-400';
        case 'cyan': return 'text-cyan-600 dark:text-cyan-400';
        case 'purple': return 'text-purple-600 dark:text-purple-400';
        case 'green': return 'text-green-600 dark:text-green-400';
        default: return 'text-emerald-600 dark:text-emerald-400';
      }
    }
    return 'text-muted-foreground';
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-500" />
          Process Flow
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Drag nodes to rearrange the process flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[16rem] lg:min-h-[12rem]">
          {/* Process Flow */}
          <div className="relative h-full flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 px-2 lg:px-4">
            {/* Flow Connections - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block absolute inset-0 flex items-center justify-between px-16">
              {processNodes.slice(0, -1).map((node, index) => {
                const nextNode = processNodes[index + 1];
                const isActive = node.status === 'active' || node.status === 'processing';
                const isNextActive = nextNode.status === 'active' || nextNode.status === 'processing';
                const isFlowing = isActive && isNextActive;
                
                return (
                  <div key={`connection-${index}`} className="flex-1 relative">
                    <div className={`h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                      isFlowing 
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                        : 'bg-muted'
                    }`}>
                      {isFlowing && (
                        <div className="h-full w-8 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse opacity-60"></div>
                      )}
                    </div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className={`h-3 w-3 transition-colors duration-300 ${
                        isFlowing ? 'text-blue-500' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Process Nodes */}
            <div className="relative w-full grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-0 lg:flex lg:items-center lg:justify-between">
              {processNodes.map((node, index) => {
                const IconComponent = node.icon;
                const isActive = node.status === 'active' || node.status === 'processing';
                const isDragging = draggedNode === node.id;
                const isDragOver = dragOverNode === node.id;
                
                return (
                  <div key={node.id} className="flex flex-col items-center space-y-2">
                    {/* Node */}
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.id)}
                      onDragOver={(e) => handleDragOver(e, node.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, node.id)}
                      className={`relative p-3 lg:p-4 rounded-lg border transition-all duration-300 hover:scale-105 cursor-move shadow-sm hover:shadow-md ${
                        getStatusColor(node.status, node.color)
                      } ${isDragging ? 'opacity-50 scale-95' : ''} ${
                        isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                      }`}
                    >
                      
                      {/* Drag Handle */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-muted-foreground/60 rounded-full"></div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute -top-1 -right-1">
                        <div className={`w-2 h-2 rounded-full ${
                          node.status === 'processing' ? 'bg-blue-500' : 
                          isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                        }`}></div>
                      </div>
                      
                      {/* Node Content */}
                      <div className="text-center">
                        <div className={`mb-2 ${getIconColor(node.status, node.color)}`}>
                          <IconComponent className="h-5 w-5 lg:h-6 lg:w-6 mx-auto" />
                        </div>
                        <div className="text-xs lg:text-sm font-medium text-foreground mb-1">{node.name}</div>
                        <div className="text-sm lg:text-lg font-bold text-foreground">
                          {node.data.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">items</div>
                      </div>
                    </div>

                    {/* Node Label - Hidden on mobile to save space */}
                    <div className="hidden lg:block text-xs text-muted-foreground text-center max-w-20 leading-tight">
                      {node.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics Panel - Responsive positioning */}
            <div className="absolute top-2 right-2 space-y-2">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 lg:p-3 border shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3 w-3 text-blue-500" />
                  <div className="text-xs font-medium text-foreground">Throughput</div>
                </div>
                <div className="text-xs lg:text-sm font-bold text-foreground">
                  {processNodes.reduce((sum, node) => sum + node.data, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">items/min</div>
              </div>
              
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 lg:p-3 border shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <div className="text-xs font-medium text-foreground">Active</div>
                </div>
                <div className="text-xs lg:text-sm font-bold text-foreground">
                  {processNodes.filter(n => n.status === 'active' || n.status === 'processing').length}
                </div>
                <div className="text-xs text-muted-foreground">of {processNodes.length}</div>
              </div>

              {/* Sentinel Status */}
              {sentinelMetrics && (
                <div className="bg-background/95 backdrop-blur-sm rounded-lg p-2 lg:p-3 border shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-3 w-3 text-blue-500" />
                    <div className="text-xs font-medium text-foreground">Status</div>
                  </div>
                  <div className={`text-xs lg:text-sm font-bold ${
                    sentinelMetrics.running ? 'text-blue-600 dark:text-blue-400' : 
                    sentinelMetrics.enabled ? 'text-emerald-600 dark:text-emerald-400' : 
                    'text-muted-foreground'
                  }`}>
                    {sentinelMetrics.running ? 'Processing' : sentinelMetrics.enabled ? 'Ready' : 'Disabled'}
                  </div>
                </div>
              )}
            </div>

            {/* Status Indicators - Responsive positioning */}
            <div className="absolute bottom-2 left-2 space-y-2">
              <div className="flex items-center space-x-2 bg-background/95 backdrop-blur-sm rounded-lg px-2 lg:px-3 py-1 lg:py-2 border shadow-sm">
                <div className={`w-2 h-2 rounded-full ${sentinelMetrics?.enabled ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs text-foreground">
                  {sentinelMetrics?.enabled ? 'System Ready' : 'System Disabled'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 bg-background/95 backdrop-blur-sm rounded-lg px-2 lg:px-3 py-1 lg:py-2 border shadow-sm">
                <div className={`w-2 h-2 rounded-full ${sentinelMetrics?.running ? 'bg-blue-500' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs text-foreground">
                  {sentinelMetrics?.running ? 'Data Flowing' : 'Data Idle'}
                </span>
              </div>
            </div>
          </div>
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
      <div className="min-h-screen bg-background text-foreground">
        {/* Simple Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-background"></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 container mx-auto p-6 space-y-6">
                {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Process Mining Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Advanced AI-powered process analysis and optimization system
            </p>
            {lastRefreshTime > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
                          <Button
                onClick={handleManualRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline" 
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-2">
            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="processes">
              Process Flows
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="health">
              System Health
            </TabsTrigger>
            <TabsTrigger value="logs">
              Sentinel Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {processFlows.map((flow) => (
                <ProcessFlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Performance Trends</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    System performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Performance charts coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Resource Utilization</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    System resource usage patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-muted-foreground text-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <SystemHealthCard health={systemHealth} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Sentinel Status</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    AI processing system status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <Badge variant={sentinelMetrics.running ? "default" : "secondary"} className="mt-1">
                        {sentinelMetrics.running ? 'Running' : 'Stopped'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Sources</p>
                      <p className="text-foreground font-semibold">{sentinelMetrics.sourcesCount}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Run</span>
                      <span className="text-muted-foreground">
                        {sentinelMetrics.lastRunAt ? new Date(sentinelMetrics.lastRunAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Run</span>
                      <span className="text-muted-foreground">
                        {sentinelMetrics.nextRunAt ? new Date(sentinelMetrics.nextRunAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Per Run</span>
                      <span className="text-muted-foreground">{sentinelMetrics.maxPerRun}</span>
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
