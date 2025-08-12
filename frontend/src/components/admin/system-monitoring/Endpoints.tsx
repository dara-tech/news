'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi } from 'lucide-react';
import { SystemMetrics } from './types';
import { getStatusColor, getStatusIcon } from './utils';

interface EndpointsProps {
  metrics: SystemMetrics;
}

export default function Endpoints({ metrics }: EndpointsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Wifi className="h-4 w-4 sm:h-5 sm:w-5" /> Endpoint Health
        </CardTitle>
        <CardDescription className="text-2xs sm:text-sm">Critical services status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.endpoints.map((endpoint, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Badge className={`text-2xs sm:text-xs ${getStatusColor(endpoint.status)} shrink-0`}>
                  {getStatusIcon(endpoint.status)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs sm:text-sm truncate">{endpoint.name}</div>
                  <div className="text-2xs sm:text-xs text-muted-foreground truncate">{endpoint.url}</div>
                </div>
              </div>
              <div className="text-right shrink-0 self-start sm:self-center">
                <div className="text-xs sm:text-sm font-medium">{endpoint.responseTime}ms</div>
                <div className="text-2xs sm:text-xs text-muted-foreground">
                  {new Date(endpoint.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
