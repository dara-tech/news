'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain,
  Plus,
  Trash2,
  X,
  Clock
} from 'lucide-react';
import { Message, Conversation } from './types';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  showSidebar: boolean;
  onNewConversation: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onToggleSidebar: () => void;
}

export default function ChatSidebar({
  conversations,
  currentConversation,
  showSidebar,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onToggleSidebar
}: ChatSidebarProps) {
  if (!showSidebar) return null;

  return (
    <div className="w-64 bg-background border-r flex flex-col">
      {/* New Chat Button */}
      <div className="border-b px-4 py-3">
        <Button 
          onClick={onNewConversation}
          className="w-full h-9"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Recent Conversations
          </div>
          <div className="space-y-1 ">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-muted border border-border'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex-1 min-w-0 p-1">
                  <div className="text-sm font-medium truncate">
                    {conversation.title}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{conversation.messages.length} messages</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3">
        <div className="text-xs text-muted-foreground text-center">
          Powered by AI • {conversations.length} conversations
        </div>
      </div>
    </div>
  );
}
