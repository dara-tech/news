import { Suspense } from 'react';
import { Metadata } from 'next';
import NotificationsPageClient from '@/components/notifications/NotificationsPageClient';

export const metadata: Metadata = {
  title: 'Notifications | Razewire',
  description: 'View and manage your notifications',
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationsPageClient />
    </Suspense>
  );
} 