'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Upload, Cpu, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessFlowData {
  input: number;
  transform: number;
  output: number;
}

interface ProcessFlowDiagramProps {
  data: ProcessFlowData;
  className?: string;
}

export default function ProcessFlowDiagram({ data, className }: ProcessFlowDiagramProps) {
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
                <p className="text-sm text-slate-400">Raw Data</p>
                <div className="text-3xl font-bold text-blue-400">{data.input}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400"></div>
            </div>

            {/* Transform Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-purple-400/30 animate-pulse">
                <Cpu className="h-10 w-10 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-400">Transform</h3>
                <p className="text-sm text-slate-400">AI Processing</p>
                <div className="text-3xl font-bold text-purple-400">{data.transform}</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400"></div>
              <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            </div>

            {/* Output Stage */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400/30 animate-pulse">
                <Download className="h-10 w-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Output</h3>
                <p className="text-sm text-slate-400">Processed Data</p>
                <div className="text-3xl font-bold text-emerald-400">{data.output}</div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8">
            <div className="text-center p-4 lg:p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-400/20">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Throughput</div>
              <div className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">12 items/min</div>
            </div>
            <div className="text-center p-4 lg:p-6 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-400/20">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Efficiency</div>
              <div className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">92%</div>
            </div>
            <div className="text-center p-4 lg:p-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-400/20">
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Success Rate</div>
              <div className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">73%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
