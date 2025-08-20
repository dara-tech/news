'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessFlowData {
  input: number;
  processed: number;
  output: number;
  errors: number;
}

interface ProcessPerformance {
  throughput: number;
  latency: number;
  efficiency: number;
}

interface ProcessFlowCardProps {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'processing';
  stage: 'input' | 'transform' | 'output';
  progress: number;
  data: ProcessFlowData;
  performance: ProcessPerformance;
  className?: string;
}

export default function ProcessFlowCard({
  id,
  name,
  status,
  stage,
  progress,
  data,
  performance,
  className
}: ProcessFlowCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'processing': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'idle': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'input': return 'text-blue-400';
      case 'transform': return 'text-purple-400';
      case 'output': return 'text-emerald-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className={cn(
      "bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg border", getStatusColor(status))}>
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-200">{name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={getStatusColor(status)}>
                  {status}
                </Badge>
                <Badge variant="outline" className={cn("border-slate-600", getStageColor(stage))}>
                  {stage}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Progress</div>
            <div className="text-2xl font-bold text-cyan-400">{progress}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2 bg-slate-700" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-400/20">
            <div className="text-sm font-medium text-blue-400">Input</div>
            <div className="text-xl font-bold text-blue-400">{data.input}</div>
          </div>
          <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-400/20">
            <div className="text-sm font-medium text-purple-400">Processed</div>
            <div className="text-xl font-bold text-purple-400">{data.processed}</div>
          </div>
          <div className="text-center p-4 bg-emerald-900/20 rounded-lg border border-emerald-400/20">
            <div className="text-sm font-medium text-emerald-400">Output</div>
            <div className="text-xl font-bold text-emerald-400">{data.output}</div>
          </div>
          <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-400/20">
            <div className="text-sm font-medium text-red-400">Errors</div>
            <div className="text-xl font-bold text-red-400">{data.errors}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-600">
          <div>
            <div className="text-sm text-slate-400">Throughput</div>
            <div className="font-semibold text-slate-200">{performance.throughput} items/min</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Latency</div>
            <div className="font-semibold text-slate-200">{performance.latency}s</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Efficiency</div>
            <div className="font-semibold text-slate-200">{performance.efficiency}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
