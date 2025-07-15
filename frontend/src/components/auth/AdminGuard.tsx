'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <p>Loading...</p>; // Or a spinner component
  }

  return <>{children}</>;
};

export default AdminGuard;
