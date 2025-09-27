'use client';

import Header from '@/components/layout/Header';

import FloatingNavButton from '@/components/layout/FloatingNavButton';
// import NavigationAnalytics from '@/components/layout/NavigationAnalytics';

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
      {/* <NavigationAnalytics /> */}
      <Header />
      {/* <BreadcrumbNav /> */}
      <main className="flex-grow container sm:max-w-full w-full">
        {children}
      </main>
      {/* <Footer /> */}
      <FloatingNavButton lang={pathname.split('/')[1] || 'en'} />
    </div>
  );
};

export default AppBody;
