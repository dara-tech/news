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

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        console.log('Checking maintenance status from:', `${apiUrl}/api/maintenance-status`);
        
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
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const data = await response.json();
          console.log('Maintenance data:', data);
          
          // If maintenance is enabled and user cannot access, redirect to maintenance page
          if (data.maintenance && !data.canAccess) {
            console.log('Redirecting to maintenance page');
            router.push('/maintenance');
            return;
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error);
      } finally {
        console.log('Setting isChecking to false');
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, [router]);

  // Show loading while checking maintenance status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking site status...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 