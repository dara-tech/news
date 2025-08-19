'use client';

import SentinelAutoPublishManager from '@/components/admin/sentinel-auto-publish/SentinelAutoPublishManager';

export default function SentinelAutoPublishPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sentinel Auto-Publish</h1>
          <p className="text-muted-foreground">
            Manage automated publishing of Sentinel-generated articles and monitor the auto-publish system
          </p>
        </div>
      </div>

      <SentinelAutoPublishManager />
    </div>
  );
}
