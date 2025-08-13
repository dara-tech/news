'use client';

import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import ModernAIAssistant from '@/components/admin/ai/ModernAIAssistant';

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

  return <ModernAIAssistant />;
}
