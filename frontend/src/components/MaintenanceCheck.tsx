'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

export default function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${apiUrl}/api/maintenance-status`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          // If maintenance is enabled and user cannot access, redirect to maintenance page
          if (data.maintenance && !data.canAccess) {
            router.push('/maintenance');
            return;
          }
        } else {
          const errorText = await response.text();
          setError('Service temporarily unavailable');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setError('Connection timeout - please check your network');
        } else {
          setError('Unable to connect to service');
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, [router]);

  // Show loading while checking maintenance status
  if (isChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          {/* Minimal Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 dark:bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">R</span>
              </div>
              {/* Simple loading ring */}
              <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Razewire
          </h1>
          <p className="text-muted-foreground text-sm">
            Loading...
          </p>
          
          {error && (
            <div className="mt-6 max-w-sm mx-auto p-3 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}