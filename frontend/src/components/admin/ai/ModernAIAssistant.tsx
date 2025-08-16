'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { processQuery, isAIAvailable, getRateLimitStatus, generateDemoResponse, AIResponse } from '@/lib/aiService';
import { Message, Conversation } from './types';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import WelcomeScreen from './WelcomeScreen';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingMessage from './LoadingMessage';

export default function ModernAIAssistant() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showSidebar, setShowSidebar] = useState(true); // Always show sidebar by default
  const [aiAvailable, setAiAvailable] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAiAvailable(isAIAvailable());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isProcessing) return;

    // If no current conversation, create one and process the message
    if (!currentConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: query.length > 50 ? query.substring(0, 50) + '...' : query,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      
      // Process the message directly without recursion
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: query,
        timestamp: new Date()
      };

      const updatedConversation = {
        ...newConversation,
        messages: [userMessage],
        updatedAt: new Date()
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === newConversation.id ? updatedConversation : conv
        )
      );

      setQuery('');
      setIsProcessing(true);
      setProcessingStage('Analyzing...');

      try {
        setProcessingStage('Generating...');
        
        let aiResponse: AIResponse;
        if (aiAvailable) {
          aiResponse = await processQuery(query, []);
        } else {
          aiResponse = await generateDemoResponse(query);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date(),
          metadata: {
            model: aiResponse.metadata.model,
            tokens: aiResponse.metadata.tokensUsed,
            confidence: aiResponse.metadata.confidence,
            processingTime: Date.now() - Date.now()
          }
        };

        const finalConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
          updatedAt: new Date()
        };

        setCurrentConversation(finalConversation);
        setConversations(prev => 
          prev.map(conv => 
            conv.id === newConversation.id ? finalConversation : conv
          )
        );

        toast.success('Response generated');
      } catch (error: any) {
        console.error('AI response error:', error);
        toast.error('Failed to generate response: ' + (error.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
        setProcessingStage('');
      }
      return;
    }
    
    // Normal flow for existing conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date()
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      )
    );

    setQuery('');
    setIsProcessing(true);
    setProcessingStage('Analyzing...');

    try {
      setProcessingStage('Generating...');
      
              let aiResponse: AIResponse;
        if (aiAvailable) {
          const conversationHistory = currentConversation.messages.map(msg => ({
            role: msg.type as 'user' | 'assistant',
            content: msg.content
          }));
          aiResponse = await processQuery(query, conversationHistory);
        } else {
          aiResponse = await generateDemoResponse(query);
        }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          model: aiResponse.metadata.model,
          tokens: aiResponse.metadata.tokensUsed,
          confidence: aiResponse.metadata.confidence,
          processingTime: Date.now() - Date.now()
        }
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date()
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? finalConversation : conv
        )
      );

      toast.success('Response generated');
    } catch (error: any) {
      console.error('AI response error:', error);
      toast.error('Failed to generate response: ' + (error.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const isDemoMode = !aiAvailable;

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        showSidebar={showSidebar}
        onNewConversation={createNewConversation}
        onSelectConversation={setCurrentConversation}
        onDeleteConversation={deleteConversation}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <ChatHeader
          currentConversationTitle={currentConversation?.title || ''}
          isDemoMode={isDemoMode}
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 ">
          {!currentConversation && !isProcessing && (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          )}

          {currentConversation && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentConversation.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onCopyMessage={copyMessage}
                />
              ))}
              
              {isProcessing && (
                <LoadingMessage processingStage={processingStage} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Search Bar */}
        <ChatInput
          query={query}
          isProcessing={isProcessing}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
