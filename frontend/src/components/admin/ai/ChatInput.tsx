'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Send,
  Loader2,
  Sparkles
} from 'lucide-react';

interface ChatInputProps {
  query: string;
  isProcessing: boolean;
  onQueryChange: (query: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export default function ChatInput({ 
  query, 
  isProcessing, 
  onQueryChange, 
  onSubmit 
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-background border-t backdrop-blur-sm">
      <div className="p-6 bg-gradient-to-br from-background/95 to-background/80">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="relative bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 transition-all duration-300 hover:border-border">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200">
                <Search className="w-5 h-5" />
              </div>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Ask anything... (research, write, analyze, explain)"
                className="pl-12 pr-20 h-16 text-lg bg-transparent border-0 rounded-2xl focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
                disabled={isProcessing}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  type="submit"
                  disabled={!query.trim() || isProcessing}
                  size="sm"
                  className="h-10 px-6 rounded-xl bg-primary/90 hover:bg-primary transition-all duration-200"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* <div className="flex items-center justify-between mt-6 text-sm">
            <div className="flex items-center space-x-8">
              <span className="flex items-center space-x-2 text-muted-foreground/80 transition-colors duration-200">
                <span className="bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-border/30">Enter</span>
                <span>to send</span>
              </span>
              <span className="flex items-center space-x-2 text-muted-foreground/80 transition-colors duration-200">
                <span className="bg-muted/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-border/30">Shift+Enter</span>
                <span>for new line</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground/80 transition-colors duration-200">
              <div className="p-1 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-medium">Powered by Gemini AI</span>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  );
}
