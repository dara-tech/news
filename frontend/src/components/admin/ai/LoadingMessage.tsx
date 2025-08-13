'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot,
  Loader2
} from 'lucide-react';

interface LoadingMessageProps {
  processingStage: string;
}

export default function LoadingMessage({ processingStage }: LoadingMessageProps) {
  return (
    <div className="flex justify-start">
      <Card className="bg-muted">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-background rounded-md">
              <Bot className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{processingStage || 'AI is thinking...'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
