'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search,
  FileText,
  TrendingUp,
  Code
} from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const quickSuggestions = [
    { icon: Search, title: "Research", query: "Research AI trends and latest developments" },
    { icon: FileText, title: "Write", query: "Write a blog post about" },
    { icon: TrendingUp, title: "Analyze", query: "Analyze data and provide insights" },
    { icon: Code, title: "Code", query: "Help me with programming" }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-2">
        What can I help you with?
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Ask me anything or choose a suggestion below
      </p>
      
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {quickSuggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-muted"
              onClick={() => onSuggestionClick(suggestion.query)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center space-y-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{suggestion.title}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
