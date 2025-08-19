import AdminGuard from '@/components/auth/AdminGuard';
import { AdminSidebarProvider } from '@/components/admin/Sidebar';
import PageTransition from '@/components/layout/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminSidebarProvider>
        <PageTransition>{children}</PageTransition>
      </AdminSidebarProvider>
    </AdminGuard>
  );
}

