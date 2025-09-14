'use client';

import { Button } from '@/components/ui/button';
import { 
  Bot,
  Copy,
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  onCopyMessage: (content: string) => void;
}

export default function ChatMessage({ message, onCopyMessage }: ChatMessageProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`group relative mb-6 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
            : 'bg-gradient-to-br from-muted to-muted/80 text-muted-foreground border border-border/50'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 " />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex-1 ">
          {/* Header */}
          <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-semibold text-foreground">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>

          {/* Message Content */}
          <div className={`relative ${
            isUser 
              ? 'inline-block bg-primary text-primary-foreground px-4 py-2 rounded-2xl shadow-md' 
              : 'rounded-2xl p-4 bg-gradient-to-br from-muted/50 to-muted/30 text-foreground border border-border/30 shadow-sm'
          }`}>
            <div className="prose prose-sm max-w-none ">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className={`text-xl font-bold mb-3 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-lg font-bold mb-2 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-base font-bold mb-2 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className={`text-sm font-bold mb-1 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className={`${isUser ? 'mb-0' : 'mb-3'} leading-relaxed text-sm ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className={`list-disc list-inside mb-3 space-y-1 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`list-decimal list-inside mb-3 space-y-1 ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className={`text-sm ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-bold ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className={`italic ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {children}
                    </em>
                  ),
                  code: ({ children, className }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        style={{}}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-3 text-xs overflow-hidden border border-border/20"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`px-2 py-1 rounded text-xs font-mono ${
                        isUser 
                          ? 'bg-primary-foreground/20 text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-3 text-xs border border-border/20">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className={`border-l-4 pl-4 italic my-3 p-3 rounded-r-lg text-sm ${
                      isUser 
                        ? 'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground' 
                        : 'border-primary bg-muted/50 text-foreground'
                    }`}>
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      className={`underline font-medium text-sm hover:opacity-80 transition-opacity ${
                        isUser ? 'text-primary-foreground' : 'text-primary'
                      }`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border rounded-lg text-xs border-border/20">
                      <table className="min-w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className={`border border-border/20 px-3 py-2 text-left font-semibold text-xs ${
                      isUser ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted text-foreground'
                    }`}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className={`border border-border/20 px-3 py-2 text-xs ${
                      isUser ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Message Actions */}
          <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyMessage(message.content)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            {message.type === 'assistant' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {}}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Good
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {}}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Bad
                </Button>
              </>
            )}
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div className={`mt-3 pt-2 border-t border-border/30 ${isUser ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                <span>Model: {message.metadata.model}</span>
                {message.metadata.tokens && (
                  <span>Tokens: {message.metadata.tokens}</span>
                )}
                {message.metadata.confidence && (
                  <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
