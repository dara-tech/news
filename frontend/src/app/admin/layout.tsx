import AdminGuard from '@/components/auth/AdminGuard';
import Sidebar from '@/components/admin/Sidebar';
import DashboardHeader from '@/components/admin/DashboardHeader';
import PageTransition from '@/components/layout/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-200/95">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

