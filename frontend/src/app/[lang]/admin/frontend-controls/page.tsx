/**
 * Multilingual Frontend Controls Admin Page
 * Comprehensive frontend management interface
 */

import FrontendControlPanel from '@/components/admin/FrontendControlPanel';

export const metadata = {
  title: 'Frontend Controls | Admin Dashboard',
  description: 'Manage frontend settings, AdSense, appearance, and features',
};

export default function FrontendControlsPage() {
  return <FrontendControlPanel />;
}
