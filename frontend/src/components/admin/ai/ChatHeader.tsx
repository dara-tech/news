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
    <div className="bg-background border-b p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">
              {currentConversationTitle || 'New Conversation'}
            </h2>
            <Badge variant={isDemoMode ? "secondary" : "default"} className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{isDemoMode ? "Demo" : "AI"}</span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
