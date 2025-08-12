'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { SystemMetrics } from './types';

interface EventsProps {
  metrics: SystemMetrics;
}

export default function Events({ metrics }: EventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> Recent Events
        </CardTitle>
        <CardDescription className="text-2xs sm:text-sm">Warnings and errors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 rounded-lg bg-muted/50">
              <Badge 
                variant={error.level === 'error' ? 'destructive' : error.level === 'warning' ? 'secondary' : 'outline'}
                className="mt-0.5 text-2xs sm:text-xs shrink-0"
              >
                {error.level}
              </Badge>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="text-xs sm:text-sm font-medium leading-tight">{error.message}</div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-2xs sm:text-xs text-muted-foreground">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                  {error.count > 1 && (
                    <Badge variant="outline" className="text-2xs sm:text-xs self-start sm:self-center">
                      {error.count}x
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
