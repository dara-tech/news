'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MonitoringSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';

  useEffect(() => {
    // Redirect to the new system monitoring location
    router.replace(`/${lang}/admin/system-monitoring`);
  }, [router, lang]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to System Monitoring...</p>
      </div>
    </div>
  );
}
