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
  Radio, Bot, Cpu, Target, FileCheck, ArrowRight, Zap, Smartphone, Monitor,
  LineChart, Bell, Calendar, Timer, Rocket, Lightbulb, Sparkles,
  Hexagon, Circle, Square, Triangle, Star, Award, Trophy, Users, Server,
  Network, HardDrive, TrendingDown, Play, Pause, Maximize2, Minimize2,
  Eye, Filter, Download, Share2, Info, Workflow, GitBranch, GitCommit,
  Layers, Globe, TrendingUp as TrendingUpIcon, Image
} from 'lucide-react';
import { toast } from 'sonner';
import { ProcessingDashboardService } from '@/lib/processingDashboardService';
import ImageGenerationMetricsCard from '@/components/admin/processing-dashboard/ImageGenerationMetrics';
import { ImageGenerationMetrics } from '@/lib/processingDashboardService';

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

interface ContentAnalytics {
  contentQualityScore: number;
  engagementPrediction: number;
  contentDiversity: number;
  categoryPerformance: Array<{
    name: string;
    percentage: number;
  }>;
  qualityMetrics: {
    readabilityScore: number;
    seoOptimization: number;
    engagementScore: number;
    contentFreshness: number;
  };
  optimizationOpportunities: {
    headlineOptimization: number;
    metaDescription: number;
    imageAltText: number;
    internalLinking: number;
  };
  publishingTimeline: {
    peakHours: string;
    peakTraffic: number;
    weekendPerformance: number;
  };
  trendingTopics: Array<{
    topic: string;
    growth: number;
  }>;
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


// Advanced Process Metrics Card Component with Enterprise-Level Design
function ProcessMetricsCard({ title, value, change, icon: Icon, trend = 'up' }: ProcessMetricsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getIconColor = () => {
    if (trend === 'up') return 'bg-emerald-500';
    if (trend === 'down') return 'bg-red-500';
    return 'bg-muted';
  };

  return (
    <div className="group relative">
      {/* Apple-style Premium Card */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30">
        
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-100/50 dark:from-slate-800/50 dark:via-transparent dark:to-slate-900/50"></div>
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase opacity-80">
                {title}
              </h3>
            </div>
            
            {/* Premium Icon */}
            <div className={`p-3 rounded-xl transition-all duration-500 ${getIconColor()} shadow-lg group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {/* Value with Apple Typography */}
          <div className="space-y-3">
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </div>
            
            {/* Trend Indicator */}
            {change && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                  trend === 'up' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : trend === 'down'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {getTrendIcon()}
                  <span>{change}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Subtle Border Glow on Hover */}
        <div className="absolute inset-0 rounded-2xl border border-white/40 dark:border-slate-600/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}

// Process Flow Card Component
function ProcessFlowCard({ flow }: ProcessFlowCardProps) {
  const getStatusColor = () => {
    switch (flow.status) {
      case 'active': return 'text-gray-700 dark:text-gray-300';
      case 'processing': return 'text-gray-600 dark:text-gray-400';
      case 'error': return 'text-gray-500 dark:text-gray-500';
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
            <p className="text-blue-600 dark:text-blue-400 font-semibold">{flow.performance.throughput}/min</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className="text-muted-foreground">Latency</p>
            <p className="text-orange-600 dark:text-orange-400 font-semibold">{flow.performance.latency}s</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className="text-muted-foreground">Efficiency</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{flow.performance.efficiency}%</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last activity: {new Date(flow.lastActivity).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced System Health Card Component - Combined
function SystemHealthCard({ health, sentinelMetrics }: { health: SystemHealth; sentinelMetrics: SentinelMetrics }) {
  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'text-emerald-600 dark:text-emerald-400';
      case 'warning': return 'text-orange-600 dark:text-orange-400';
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
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            System Health & Status
          </CardTitle>
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
        </div>
        <CardDescription className="text-muted-foreground">
          Overall Status: <span className={getStatusColor()}>{health.status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Metrics */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            System Resources
          </h4>
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
        </div>

        {/* Sentinel Status */}
        <div className="space-y-4 pt-4 border-t border-muted">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            Sentinel AI Status
          </h4>
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
            <div className="p-3 border border-yellow-400/20 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Cooldown until: {new Date(sentinelMetrics.cooldownUntil).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sentinel Logs Component
function SentinelLogsCard({ logs }: { logs: SentinelLog[] }) {
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-gray-700 dark:text-gray-300 border-gray-300 bg-gray-50 dark:bg-gray-800/50';
      case 'warning': return 'text-gray-700 dark:text-gray-300 border-gray-300 bg-gray-50 dark:bg-gray-800/50';
      case 'info': return 'text-gray-700 dark:text-gray-300 border-gray-300 bg-gray-50 dark:bg-gray-800/50';
      default: return 'text-gray-600 dark:text-gray-400 border-gray-200 bg-gray-50/50 dark:bg-gray-800/30';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Real-Time Sentinel Logs
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Live processing activity from Sentinel AI - Updates every 5 seconds
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
function ProcessFlowDiagram({ data, sentinelMetrics, imageGenerationMetrics }: { data: any[], sentinelMetrics: any, imageGenerationMetrics?: any }) {
  const processNodes = [
    {
      id: 'input',
      name: 'RSS Sources',
      icon: Radio,
      status: sentinelMetrics?.enabled ? 'active' : 'idle',
      data: sentinelMetrics?.sourcesCount || 0,
      position: 'left',
      color: 'gray'
    },
    {
      id: 'sentinel',
      name: 'Sentinel AI',
      icon: Bot,
      status: sentinelMetrics?.running ? 'processing' : (sentinelMetrics?.enabled ? 'active' : 'idle'),
      data: sentinelMetrics?.lastProcessed || 0,
      position: 'center',
      color: 'gray'
    },
    {
      id: 'processing',
      name: 'Content Processing',
      icon: Cpu,
      status: sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle',
      data: sentinelMetrics?.lastCreated || 0,
      position: 'center',
      color: 'gray'
    },
    {
      id: 'image-gen',
      name: 'Image Generation',
      icon: Image,
      status: imageGenerationMetrics?.serviceStatus === 'active' ? 'active' : 'idle',
      data: imageGenerationMetrics?.totalGenerated || 0,
      position: 'center',
      color: 'purple'
    },
    {
      id: 'seo',
      name: 'SEO Optimization',
      icon: Target,
      status: 'active',
      data: data.find(d => d.name === 'SEO Optimization Engine')?.value || 0,
      position: 'center',
      color: 'gray'
    },
    {
      id: 'output',
      name: 'Published Articles',
      icon: FileCheck,
      status: sentinelMetrics?.lastCreated > 0 ? 'active' : 'idle',
      data: sentinelMetrics?.lastCreated || 0,
      position: 'right',
      color: 'gray'
    }
  ];

  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  // Update nodes when data changes
  useEffect(() => {
    // Nodes are now computed directly from props, no need to update state
  }, [sentinelMetrics, imageGenerationMetrics, data]);

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
      
      // Note: Drag and drop functionality disabled since nodes are now computed from props
      toast.success(`Drag and drop disabled - nodes are auto-computed`);
    }
    setDraggedNode(null);
    setDragOverNode(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'processing') return 'border-gray-300 bg-gray-50 dark:bg-gray-800/50';
    if (status === 'active') return 'border-gray-300 bg-gray-50 dark:bg-gray-800/50';
    return 'border-gray-200 bg-gray-50/50 dark:bg-gray-800/30';
  };

  const getIconColor = (status: string) => {
    if (status === 'processing') return 'text-gray-700 dark:text-gray-300';
    if (status === 'active') return 'text-gray-700 dark:text-gray-300';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="relative">
      {/* Apple-style Glass Card with Advanced Styling */}
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/30"></div>
        
        {/* Header with Apple-style Typography */}
        <div className="relative px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                Process Flow
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Real-time processing pipeline
              </p>
            </div>
          </div>
        </div>
        
        {/* Advanced Process Flow Visualization */}
        <div className="relative p-8">
          {/* Premium Process Steps */}
          <div className="space-y-6">
            {/* Process Nodes with Apple-level Polish */}
            <div className="flex items-center justify-between relative overflow-x-auto">
              {/* Connecting Lines with Animations - Forward Flow */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-[5%] sm:px-[10%] min-w-[600px]">
                {processNodes.slice(0, -1).map((node, index) => {
                  const nextNode = processNodes[index + 1];
                  const isActive = node.status === 'active' || node.status === 'processing';
                  const isNextActive = nextNode.status === 'active' || nextNode.status === 'processing';
                  const isFlowing = isActive && isNextActive;
                  
                  return (
                    <div key={`flow-${index}`} className="flex-1 relative mx-4">
                      {/* Premium Connection Line */}
                      <div className={`h-0.5 w-full rounded-full transition-all duration-700 ${
                        isFlowing 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30' 
                          : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                      }`}>
                        {/* Animated Flow Indicator */}
                        {isFlowing && (
                          <div className="absolute inset-0 rounded-full">
                            <div className="h-full bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Premium Arrow - Forward Flow */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                        <div className={`p-1 rounded-full transition-all duration-500 ${
                          isFlowing 
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}>
                          <ArrowRight className={`h-2.5 w-2.5 transition-colors duration-500 ${
                            isFlowing ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Premium Process Nodes */}
              {processNodes.map((node, index) => {
                const isActive = node.status === 'active' || node.status === 'processing';
                const IconComponent = node.icon;
                
                return (
                  <div key={node.id} className="relative z-10 flex flex-col items-center group flex-shrink-0 w-20 sm:w-24 md:w-28">
                    {/* Apple-style Node */}
                    <div className={`relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                      isActive 
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 border border-emerald-200 dark:border-emerald-700/50 shadow-xl shadow-emerald-500/20' 
                        : 'bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl'
                    }`}>
                      
                      {/* Status Indicator with Glow */}
                      <div className="absolute -top-1 -right-1">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                          node.status === 'processing' 
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' 
                            : isActive 
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                              : 'bg-slate-400 dark:bg-slate-500'
                        }`}>
                          {node.status === 'processing' && (
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Icon with Premium Styling */}
                      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30' 
                          : 'bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700'
                      }`}>
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      
                      {/* Node Content */}
                      <div className="mt-2 sm:mt-3 text-center space-y-1">
                        <div className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                          {node.name}
                        </div>
                        <div className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">
                          {node.data.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Node Label with Apple Typography */}
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 text-center max-w-16 leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {node.name.split(' ').join('\n')}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Premium Status Legend */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50 gap-3 sm:gap-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full shadow-sm"></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Idle</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {processNodes.filter(n => n.status === 'active' || n.status === 'processing').length}
                </span>
                {' '}of{' '}
                <span className="font-semibold">{processNodes.length}</span>
                {' '}active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics>({
    contentQualityScore: 85,
    engagementPrediction: 72,
    contentDiversity: 68,
    categoryPerformance: [
      { name: 'Politics', percentage: 45 },
      { name: 'Technology', percentage: 28 },
      { name: 'Sports', percentage: 18 },
      { name: 'Business', percentage: 9 }
    ],
    qualityMetrics: {
      readabilityScore: 92,
      seoOptimization: 87,
      engagementScore: 78,
      contentFreshness: 95
    },
    optimizationOpportunities: {
      headlineOptimization: 12,
      metaDescription: 8,
      imageAltText: 5,
      internalLinking: 15
    },
    publishingTimeline: {
      peakHours: '9:00 AM - 11:00 AM',
      peakTraffic: 42,
      weekendPerformance: -15
    },
    trendingTopics: [
      { topic: 'Cambodia Elections', growth: 156 },
      { topic: 'Economic Development', growth: 89 },
      { topic: 'Technology Innovation', growth: 67 },
      { topic: 'Cultural Events', growth: 45 }
    ]
  });

  const [imageGenerationMetrics, setImageGenerationMetrics] = useState<ImageGenerationMetrics>({
    totalGenerated: 0,
    totalRequests: 0,
    successRate: 0,
    averageGenerationTime: 0,
    lastGenerated: null,
    serviceStatus: 'idle',
    apiUsage: {
      requestsToday: 0,
      requestsThisMonth: 0,
      quotaRemaining: 1000
    },
    qualityMetrics: {
      averageDescriptionLength: 0,
      relevanceScore: 0,
      professionalScore: 0
    },
    recentGenerations: []
  });

  const loadDashboardData = async (showToast = false) => {
    setLoading(true);
    try {
      const [metricsData, flowsData, healthData, logsData, sentinelData, contentAnalyticsData, imageGenData] = await Promise.all([
        ProcessingDashboardService.fetchMetrics(),
        ProcessingDashboardService.fetchProcessFlows(),
        ProcessingDashboardService.fetchSystemHealth(),
        ProcessingDashboardService.fetchSentinelLogs(),
        ProcessingDashboardService.fetchSentinelMetrics(),
        ProcessingDashboardService.fetchContentAnalytics(),
        ProcessingDashboardService.fetchImageGenerationMetrics()
      ]);

      console.log('Dashboard Data Fetched:', {
        metrics: metricsData,
        flows: flowsData,
        health: healthData,
        logs: logsData.length,
        sentinel: sentinelData,
        contentAnalytics: contentAnalyticsData,
        imageGeneration: imageGenData
      });
      
      setMetrics(metricsData);
      setProcessFlows(flowsData);
      setSystemHealth(healthData);
      setSentinelLogs(logsData);
      setSentinelMetrics(sentinelData);
      setContentAnalytics(contentAnalyticsData);
      setImageGenerationMetrics(imageGenData);
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
    
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => loadDashboardData(false), 5000);
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
      </div>

        {/* Main Container */}
        <div className="relative z-10 container mx-auto p-4 lg:p-6 space-y-6">
          {/* Apple-style Premium Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl shadow-black/25">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-indigo-600/20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/30 to-transparent rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/30 to-transparent rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
            
            {/* Content */}
            <div className="relative p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    {/* Premium Icon */}
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/25">
                        <Workflow className="h-8 w-8 text-white" />
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 -z-10"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Process Mining
                      </h1>
                      <h2 className="text-3xl lg:text-4xl font-light text-blue-200">
                        Dashboard
                      </h2>
                    </div>
                  </div>
                  
                  <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
                    Enterprise-grade real-time processing analytics with intelligent automation
                  </p>
                  
                  {/* Status Indicators */}
                  {lastRefreshTime > 0 && (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                        <span className="text-sm font-medium text-white">Live Data</span>
                      </div>
                      <div className="text-sm text-slate-300">
                        Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Premium Action Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 px-6 py-3 rounded-xl font-semibold"
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    <span>Settings</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        {/* Minimalistic Advanced Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="processes" className="flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                <span className="hidden sm:inline">Process Flows</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">System Health</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Sentinel Logs</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Insights Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI-Powered Content Insights
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Real-time analysis and optimization suggestions for your news content
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalProcessed}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Articles Analyzed Today</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Key Metrics with Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <ProcessMetricsCard
                title="Content Quality Score"
                value={`${contentAnalytics.contentQualityScore}%`}
                change="SEO optimization improved"
                icon={Target}
                trend="up"
              />
              <ProcessMetricsCard
                title="Engagement Prediction"
                value={`${contentAnalytics.engagementPrediction}%`}
                change="High viral potential detected"
                icon={TrendingUp}
                trend="up"
              />
              <ProcessMetricsCard
                title="AI Processing Speed"
                value={`${metrics.averageProcessingTime}s`}
                change="Performance optimized"
                icon={Zap}
                trend="down"
              />
              <ProcessMetricsCard
                title="Content Diversity"
                value={`${contentAnalytics.contentDiversity}%`}
                change="Topic variety increased"
                icon={Sparkles}
                trend="up"
              />
            </div>

            {/* AI Content Insights Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Performance Insights */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-lg">Content Performance Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium">Top Performing Category</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {contentAnalytics.categoryPerformance[0]?.name || 'Politics'} (+{contentAnalytics.categoryPerformance[0]?.percentage || 45}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Optimal Publishing Time</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-400">9:00 AM - 11:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">Avg. Reading Time</span>
                      </div>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">3.2 minutes</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Content Virality Score</span>
                      </div>
                      <span className="text-sm font-bold text-purple-700 dark:text-purple-400">{Math.round(78 + Math.random() * 15)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Optimize Headlines</p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">Add numbers and power words for 24% better CTR</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500">
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">SEO Enhancement</p>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300">Focus on long-tail keywords for better ranking</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-teal-900 dark:text-teal-100">Content Timing</p>
                          <p className="text-xs text-teal-700 dark:text-teal-300">Schedule posts during peak engagement hours</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border-l-4 border-rose-500">
                      <div className="flex items-start space-x-2">
                        <Sparkles className="h-4 w-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Content Diversification</p>
                          <p className="text-xs text-rose-700 dark:text-rose-300">Add more multimedia content for engagement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Process Flow Visualization */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-2xl"></div>
              <ProcessFlowDiagram 
                data={getProcessFlowData()} 
                sentinelMetrics={sentinelMetrics}
                imageGenerationMetrics={imageGenerationMetrics}
              />
            </div>
          </TabsContent>

          {/* Process Flows Tab */}
          <TabsContent value="processes" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {processFlows.map((flow) => (
                <ProcessFlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* AI Content Analytics Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Advanced Content Analytics
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Deep insights into content performance and optimization opportunities
                  </p>
                </div>
              </div>
            </div>

            {/* Content Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Image Generation Metrics */}
              <div className="lg:col-span-3">
                <ImageGenerationMetricsCard 
                  metrics={imageGenerationMetrics} 
                  onRefresh={handleManualRefresh}
                />
              </div>
              {/* Content Category Performance */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Category Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentAnalytics.categoryPerformance.map((category, index) => {
                      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                      return (
                        <div key={`${category.name}-${index}`} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-sm font-bold">{category.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Content Quality Metrics */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-lg">Quality Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Readability Score</span>
                        <span className="font-bold">{contentAnalytics.qualityMetrics.readabilityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${contentAnalytics.qualityMetrics.readabilityScore}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SEO Optimization</span>
                        <span className="font-bold">{contentAnalytics.qualityMetrics.seoOptimization}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: `${contentAnalytics.qualityMetrics.seoOptimization}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Score</span>
                        <span className="font-bold">{contentAnalytics.qualityMetrics.engagementScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: `${contentAnalytics.qualityMetrics.engagementScore}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Content Freshness</span>
                        <span className="font-bold">{contentAnalytics.qualityMetrics.contentFreshness}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{width: `${contentAnalytics.qualityMetrics.contentFreshness}%`}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Optimization Opportunities */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Optimization Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">Headline Optimization</span>
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{contentAnalytics.optimizationOpportunities.headlineOptimization} articles could benefit</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Meta Description</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{contentAnalytics.optimizationOpportunities.metaDescription} articles missing</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium">Image Alt Text</span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">{contentAnalytics.optimizationOpportunities.imageAltText} images need optimization</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Internal Linking</span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{contentAnalytics.optimizationOpportunities.internalLinking} opportunities found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Timeline and Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Publishing Timeline */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg">Publishing Timeline</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Peak Publishing Hours</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">9:00 AM - 11:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{contentAnalytics.publishingTimeline.peakTraffic}%</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">of daily traffic</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Weekend Performance</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400">Saturday & Sunday</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-900 dark:text-teal-100">{contentAnalytics.publishingTimeline.weekendPerformance}%</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400">vs weekdays</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentAnalytics.trendingTopics.map((topic, index) => {
                      const colors = [
                        'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
                        'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
                        'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                        'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                        'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      ];
                      return (
                        <div key={`${topic.topic}-${index}`} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{topic.topic}</span>
                          <span className={`text-xs ${colors[index % colors.length]} px-2 py-1 rounded`}>+{topic.growth}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">System Status</p>
                      <p className="text-2xl font-bold text-foreground">{systemHealth.status}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sentinel Status</p>
                      <p className="text-2xl font-bold text-foreground">{sentinelMetrics.running ? 'Running' : 'Stopped'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Sources</p>
                      <p className="text-2xl font-bold text-foreground">{sentinelMetrics.sourcesCount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Radio className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Check</p>
                      <p className="text-sm font-bold text-foreground">{new Date(systemHealth.lastCheck).toLocaleTimeString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main System Health Card */}
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              <SystemHealthCard health={systemHealth} sentinelMetrics={sentinelMetrics} />
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
