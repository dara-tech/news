'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { usePathname } from 'next/navigation';

const AppBody = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin');

  if (isAdminRoute) {
    // Admin routes handle their own layout completely
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppBody;
