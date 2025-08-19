'use client';

import SEODashboard from '@/components/admin/seo/SEODashboard';
import { AdminSidebarProvider } from '@/components/admin/Sidebar';

export default function AdminSEOPage() {
  return (
    <AdminSidebarProvider>
      <SEODashboard />
    </AdminSidebarProvider>
  );
}


