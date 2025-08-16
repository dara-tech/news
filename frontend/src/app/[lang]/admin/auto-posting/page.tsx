'use client';

import AutoPostingManager from '@/components/admin/AutoPostingManager';

export default function AutoPostingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto-Posting Management</h1>
          <p className="text-muted-foreground">
            Manage your social media auto-posting system and monitor platform connections
          </p>
        </div>
      </div>

      <AutoPostingManager />
    </div>
  );
}
