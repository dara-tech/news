'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BreadcrumbNav from '@/components/layout/BreadcrumbNav';
import FloatingNavButton from '@/components/layout/FloatingNavButton';
import NavigationAnalytics from '@/components/layout/NavigationAnalytics';

import { usePathname } from 'next/navigation';

const AppBody = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin');

  if (isAdminRoute) {
    // Admin routes handle their own layout completely
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavigationAnalytics />
      <Header />
      <BreadcrumbNav />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
      <FloatingNavButton lang={pathname.split('/')[1] || 'en'} />
    </div>
  );
};

export default AppBody;
