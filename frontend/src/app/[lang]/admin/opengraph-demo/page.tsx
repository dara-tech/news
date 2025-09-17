import { Metadata } from 'next';
import OpenGraphDemo from '@/components/admin/OpenGraphDemo';

export const metadata: Metadata = {
  title: 'OpenGraph Demo - Admin Dashboard',
  description: 'Test how your articles will look when shared on social media platforms',
};

export default function OpenGraphDemoPage() {
  return (
    <div className="container mx-auto py-6">
      <OpenGraphDemo />
    </div>
  );
}
