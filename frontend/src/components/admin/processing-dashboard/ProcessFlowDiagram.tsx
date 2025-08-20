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
      "bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
            <Activity className="h-5 w-5" />
          </div>
          Process Flow Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Process Flow Diagram */}
          <div className="flex items-center justify-between p-8 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-emerald-900/20 rounded-lg border border-slate-600">
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

            <div className="flex items-center space-x-4">
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

            <div className="flex items-center space-x-4">
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
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 bg-blue-900/20 rounded-lg border border-blue-400/20">
              <div className="text-sm font-medium text-blue-400 mb-2">Throughput</div>
              <div className="text-2xl font-bold text-blue-400">12 items/min</div>
            </div>
            <div className="text-center p-6 bg-purple-900/20 rounded-lg border border-purple-400/20">
              <div className="text-sm font-medium text-purple-400 mb-2">Efficiency</div>
              <div className="text-2xl font-bold text-purple-400">92%</div>
            </div>
            <div className="text-center p-6 bg-emerald-900/20 rounded-lg border border-emerald-400/20">
              <div className="text-sm font-medium text-emerald-400 mb-2">Success Rate</div>
              <div className="text-2xl font-bold text-emerald-400">73%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
