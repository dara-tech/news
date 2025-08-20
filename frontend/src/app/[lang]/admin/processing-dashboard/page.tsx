'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, Settings, TrendingUp, PieChart, BarChart, Gauge,
  Database, FileText, Clock, Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Import components
import ProcessMetricsCard from '@/components/admin/processing-dashboard/ProcessMetricsCard';
import ProcessFlowDiagram from '@/components/admin/processing-dashboard/ProcessFlowDiagram';
import ProcessFlowCard from '@/components/admin/processing-dashboard/ProcessFlowCard';
import SystemHealthCard from '@/components/admin/processing-dashboard/SystemHealthCard';

// Import service and types
import { ProcessingDashboardService, ProcessingMetrics, ProcessFlow, SystemHealth } from '@/lib/processingDashboardService';

export default function ProcessingDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalProcessed: 0,
    totalCreated: 0,
    averageProcessingTime: 0,
    errorRate: 0,
    uptime: 0,
    lastReset: new Date().toISOString()
  });
  const [processFlows, setProcessFlows] = useState<ProcessFlow[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    components: []
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    const pulseInterval = setInterval(() => setPulseAnimation(prev => !prev), 2000);
    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend APIs
      const [metricsData, flowsData, healthData] = await Promise.all([
        ProcessingDashboardService.fetchMetrics(),
        ProcessingDashboardService.fetchProcessFlows(),
        ProcessingDashboardService.fetchSystemHealth()
      ]);
      
      setMetrics(metricsData);
      setProcessFlows(flowsData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getProcessFlowData = () => {
    const totalInput = processFlows.reduce((sum, flow) => sum + flow.data.input, 0);
    const totalProcessed = processFlows.reduce((sum, flow) => sum + flow.data.processed, 0);
    const totalOutput = processFlows.reduce((sum, flow) => sum + flow.data.output, 0);
    
    return {
      input: totalInput,
      transform: totalProcessed,
      output: totalOutput
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233b82f6%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Process Mining Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Advanced AI-powered process analysis and optimization system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadDashboardData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-600">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="processes" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
              Process Flows
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
              System Health
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
            <ProcessFlowDiagram data={getProcessFlowData()} />
          </TabsContent>

          {/* Process Flows Tab */}
          <TabsContent value="processes" className="space-y-6">
            <div className="grid gap-6">
              {processFlows.map((flow) => (
                <ProcessFlowCard
                  key={flow.id}
                  id={flow.id}
                  name={flow.name}
                  status={flow.status}
                  stage={flow.stage}
                  progress={flow.progress}
                  data={flow.data}
                  performance={flow.performance}
                />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <div className="bg-slate-800/50 border border-slate-600 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Performance Trends</h3>
                </div>
                <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-600">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Performance charts will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Processing Distribution */}
              <div className="bg-slate-800/50 border border-slate-600 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-2 text-cyan-400 mb-4">
                  <PieChart className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Processing Distribution</h3>
                </div>
                <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-600">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Distribution charts will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            <SystemHealthCard status={systemHealth.status} components={systemHealth.components} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
