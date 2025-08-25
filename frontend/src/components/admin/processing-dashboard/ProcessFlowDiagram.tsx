'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Upload, 
  Cpu, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageGenerationMetrics } from '@/lib/processingDashboardService';

interface ProcessFlowData {
  input: number;
  transform: number;
  output: number;
}

interface ProcessFlowDiagramProps {
  data: any[];
  sentinelMetrics: any;
  imageGenerationMetrics?: ImageGenerationMetrics;
  className?: string;
}

export default function ProcessFlowDiagram({ data, sentinelMetrics, imageGenerationMetrics, className }: ProcessFlowDiagramProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-300",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          Process Flow Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Process Flow Diagram */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 p-4 lg:p-8 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-emerald-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-emerald-950/20 rounded-lg border">
            {/* Input Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-blue-400/30 animate-pulse">
                <Upload className="h-10 w-10 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-400">Input</h3>
                <p className="text-sm text-slate-400">RSS Sources</p>
                <div className="text-3xl font-bold text-blue-400">{sentinelMetrics?.sourcesCount || 0}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400"></div>
            </div>

            {/* Transform Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-purple-400/30">
                <Cpu className="h-10 w-10 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-400">Processing</h3>
                <p className="text-sm text-slate-400">Sentinel AI</p>
                <div className="text-3xl font-bold text-purple-400">{sentinelMetrics?.lastProcessed || 0}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-orange-400"></div>
            </div>

            {/* Image Generation Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400/30">
                <Image className="h-10 w-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Image Gen</h3>
                <p className="text-sm text-slate-400">AI Descriptions</p>
                <div className="text-3xl font-bold text-emerald-400">{imageGenerationMetrics?.totalGenerated || 0}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-orange-400"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-red-400"></div>
            </div>

            {/* Output Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-orange-400/30">
                <Download className="h-10 w-10 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-400">Output</h3>
                <p className="text-sm text-slate-400">Published Articles</p>
                <div className="text-3xl font-bold text-orange-400">{sentinelMetrics?.lastCreated || 0}</div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className={`w-2 h-2 rounded-full ${sentinelMetrics?.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm">RSS Sources: {sentinelMetrics?.enabled ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className={`w-2 h-2 rounded-full ${sentinelMetrics?.running ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm">Sentinel: {sentinelMetrics?.running ? 'Running' : 'Stopped'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <div className={`w-2 h-2 rounded-full ${imageGenerationMetrics?.serviceStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm">Image Gen: {imageGenerationMetrics?.serviceStatus === 'active' ? 'Active' : 'Idle'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className={`w-2 h-2 rounded-full ${sentinelMetrics?.lastCreated > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm">Publishing: {sentinelMetrics?.lastCreated > 0 ? 'Active' : 'Idle'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
