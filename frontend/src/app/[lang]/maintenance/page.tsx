'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  const checkMaintenanceStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/maintenance-status`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.maintenance || data.canAccess) {
          window.location.href = '/';
        }
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const handleRefresh = () => {
    checkMaintenanceStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-medium text-black">Under Maintenance</h1>
          <p className="text-black/60 text-sm">
            We'll be back soon
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button 
            onClick={handleRefresh}
            className="bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isAdmin && (
            <Link href="/admin">
              <Button 
                className="bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-colors"
                size="sm"
              >
                Admin Panel
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}