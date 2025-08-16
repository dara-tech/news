'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TestTube, Play } from 'lucide-react';

interface TestingPanelProps {
  onManualPost: () => void;
  onRefreshSettings: () => void;
}

export default function TestingPanel({ onManualPost, onRefreshSettings }: TestingPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Testing & Manual Posting
        </CardTitle>
        <CardDescription>
          Test connections and manually post content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={onManualPost}
            variant="default"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Send Test Post
          </Button>
          
          <Button
            onClick={onRefreshSettings}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Settings
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>• Test Post: Sends a test message to all enabled platforms</p>
          <p>• Refresh Settings: Reloads settings from the server</p>
        </div>
      </CardContent>
    </Card>
  );
}


