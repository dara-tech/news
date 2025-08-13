'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu,
  Sparkles,
  Settings
} from 'lucide-react';

interface ChatHeaderProps {
  currentConversationTitle: string;
  isDemoMode: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export default function ChatHeader({
  currentConversationTitle,
  isDemoMode,
  showSidebar,
  onToggleSidebar
}: ChatHeaderProps) {
  return (
    <div className="bg-background border-b p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex flex-col items-center justify-center ">
            <h1 className="text-lg font-bold text-center">
              {currentConversationTitle || 'AI Assistant'}
            </h1>
            <span className="text-sm text-muted-foreground text-center">
              Ask anything, get intelligent answers
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={isDemoMode ? "secondary" : "default"} className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>{isDemoMode ? "Demo Mode" : "AI Powered"}</span>
          </Badge>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
