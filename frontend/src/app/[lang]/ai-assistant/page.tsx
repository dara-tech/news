'use client';

import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import ModernAIAssistant from '@/components/admin/ai/ModernAIAssistant';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIAssistantPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/dashboard"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">AI Assistant</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Welcome, {user.username || user.email}</span>
        </div>
      </div>

      {/* Full Screen AI Assistant */}
      <div className="flex-1 overflow-hidden">
        <ModernAIAssistant />
      </div>
    </div>
  );
}
