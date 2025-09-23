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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-border rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Initializing System
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verifying service availability and system status...
                </p>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}