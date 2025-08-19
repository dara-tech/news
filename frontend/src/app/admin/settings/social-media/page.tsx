'use client';

import { useState } from 'react';
import SocialMediaManagement from '@/components/admin/SocialMediaManagement';

interface SocialMediaSettings {
  socialLinks: any[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  socialSharingEnabled: boolean;
  socialLoginEnabled: boolean;
  socialAnalyticsEnabled: boolean;
  autoPostEnabled: boolean;
  socialPreviewEnabled: boolean;
}

export default function SocialMediaSettingsPage() {
  const [settings, setSettings] = useState<SocialMediaSettings | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media & Contact</h1>
          <p className="text-muted-foreground">Manage your social media profiles, contact information, and social media settings</p>
        </div>
      </div>

      <SocialMediaManagement 
        onSettingsChange={(newSettings) => {
          setSettings(newSettings);
        }}
      />
    </div>
  );
} 