'use client';

import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface AppBodyProps {
  children: React.ReactNode;
  fontVariables: string;
}

import { usePathname } from 'next/navigation';

const AppBody = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppBody;
