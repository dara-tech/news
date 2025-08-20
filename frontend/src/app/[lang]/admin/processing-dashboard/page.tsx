'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Database, FileText, Clock, Shield, RefreshCw, Settings,
  Upload, Cpu, Download, ArrowRight, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, PieChart, BarChart, Gauge
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProcessingDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const processFlows = [
    {
      id: 'sentinel-auto-publish',
      name: 'Sentinel Auto-Publish',
      status: 'active',
      stage: 'output',
      progress: 85,
      data: { input: 45, processed: 38, output: 32, errors: 2 },
      performance: { throughput: 12.5, latency: 1.8, efficiency: 94 }
    },
    {
      id: 'content-formatting',
      name: 'Content Formatting',
      status: 'processing',
      stage: 'transform',
      progress: 60,
      data: { input: 23, processed: 14, output: 8, errors: 1 },
      performance: { throughput: 8.2, latency: 2.1, efficiency: 87 }
    },
    {
      id: 'ai-translation',
      name: 'AI Translation',
      status: 'active',
      stage: 'transform',
      progress: 92,
      data: { input: 67, processed: 62, output: 58, errors: 0 },
      performance: { throughput: 15.3, latency: 1.2, efficiency: 96 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Process Mining Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze data from business systems and applications to understand and optimize processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processes">Process Flows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+15% from last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Articles Created</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">+12% from last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3s</div>
                <p className="text-xs text-muted-foreground">-8% from last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">18 hours without issues</p>
              </CardContent>
            </Card>
          </div>

          {/* Process Flow Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Process Flow Overview
              </CardTitle>
              <CardDescription>
                Real-time visualization of data processing through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Process Flow Diagram */}
                <div className="flex items-center justify-between p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-lg">
                  {/* Input Stage */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-600">Input</h3>
                      <p className="text-sm text-muted-foreground">Raw Data</p>
                      <div className="text-2xl font-bold text-blue-600">135</div>
                    </div>
                  </div>

                  <ArrowRight className="h-8 w-8 text-gray-400" />

                  {/* Transform Stage */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Cpu className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-600">Transform</h3>
                      <p className="text-sm text-muted-foreground">AI Processing</p>
                      <div className="text-2xl font-bold text-purple-600">114</div>
                    </div>
                  </div>

                  <ArrowRight className="h-8 w-8 text-gray-400" />

                  {/* Output Stage */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Download className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-600">Output</h3>
                      <p className="text-sm text-muted-foreground">Processed Data</p>
                      <div className="text-2xl font-bold text-green-600">98</div>
                    </div>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-600">Throughput</div>
                    <div className="text-2xl font-bold text-blue-600">12 items/min</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-600">Efficiency</div>
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-600">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600">73%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Flows Tab */}
        <TabsContent value="processes" className="space-y-6">
          <div className="grid gap-6">
            {processFlows.map((flow) => (
              <Card key={flow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(flow.status)}`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{flow.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
                            {flow.status}
                          </Badge>
                          <Badge variant="outline">
                            {flow.stage}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Progress</div>
                      <div className="text-lg font-bold">{flow.progress}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={flow.progress} className="h-2" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Input</div>
                      <div className="text-xl font-bold text-blue-600">{flow.data.input}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Processed</div>
                      <div className="text-xl font-bold text-purple-600">{flow.data.processed}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Output</div>
                      <div className="text-xl font-bold text-green-600">{flow.data.output}</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-600">Errors</div>
                      <div className="text-xl font-bold text-red-600">{flow.data.errors}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Throughput</div>
                      <div className="font-semibold">{flow.performance.throughput} items/min</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Latency</div>
                      <div className="font-semibold">{flow.performance.latency}s</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Efficiency</div>
                      <div className="font-semibold">{flow.performance.efficiency}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Performance charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Processing Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Distribution charts will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Healthy Status</h3>
                  <p className="text-sm text-muted-foreground">
                    All systems are operating within normal parameters
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
