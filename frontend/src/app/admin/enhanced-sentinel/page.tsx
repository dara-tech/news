'use client';

import EnhancedSentinel from '@/components/admin/system-monitoring/EnhancedSentinel';

export default function EnhancedSentinelPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Sentinel Management</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered content generation, translation, and publishing decisions
          </p>
        </div>
      </div>

      <EnhancedSentinel />
    </div>
  );
}
