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
    <div className="flex flex-col  bg-background scrollbar-hide  ">
      {/* <NavigationAnalytics /> */}
      <Header />
      {/* <BreadcrumbNav /> */}
      <main className=" sm:max-w-full w-full scrollbar-hide ">
        {children}
      </main>
      {/* <Footer /> */}
      <FloatingNavButton lang={pathname.split('/')[1] || 'en'} />
    </div>
  );
};

export default AppBody;
