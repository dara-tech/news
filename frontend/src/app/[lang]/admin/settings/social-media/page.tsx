'use client';

import SocialMediaManagement from '@/components/admin/SocialMediaManagement';

export default function SocialMediaSettingsPage() {

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media & Contact</h1>
          <p className="text-muted-foreground">Manage your social media profiles, contact information, and social media settings</p>
        </div>
      </div>

      <SocialMediaManagement />
    </div>
  );
} 