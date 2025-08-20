'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemComponent {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  performance: number;
}

interface SystemHealthCardProps {
  status: 'healthy' | 'warning' | 'critical';
  components: SystemComponent[];
  className?: string;
}

export default function SystemHealthCard({ status, components, className }: SystemHealthCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-12 w-12 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-12 w-12 text-yellow-400" />;
      case 'critical': return <XCircle className="h-12 w-12 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/20 border-emerald-400/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/30';
      case 'critical': return 'bg-red-500/20 border-red-400/30';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy': return 'All systems operational';
      case 'warning': return 'Some systems degraded';
      case 'critical': return 'Critical system failures detected';
    }
  };

  return (
    <Card className={cn(
      "bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
            <Shield className="h-5 w-5" />
          </div>
          System Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className={cn("p-6 rounded-lg border-2", getStatusColor())}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-200 capitalize">{status} Status</h3>
            <p className="text-sm text-slate-400 mt-1">{getStatusText()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {components.map((component) => (
            <Card key={component.name} className="bg-slate-800/50 border border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-200">{component.name}</h4>
                  <Badge variant="outline" className={
                    component.status === 'online' ? 'border-emerald-400 text-emerald-400' :
                    component.status === 'degraded' ? 'border-yellow-400 text-yellow-400' : 
                    'border-red-400 text-red-400'
                  }>
                    {component.status}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Uptime</span>
                    <span className="font-medium text-slate-200">{component.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Performance</span>
                    <span className="font-medium text-slate-200">{component.performance}%</span>
                  </div>
                  <Progress value={component.performance} className="h-2 bg-slate-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
