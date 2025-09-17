import { Metadata } from 'next';
import LinkPreviewDemo from '@/components/admin/LinkPreviewDemo';

export const metadata: Metadata = {
  title: 'Link Preview - Admin Dashboard',
  description: 'Test link previews like Vercel',
};

export default function LinkPreviewPage() {
  return (
    <div className="container mx-auto py-6">
      <LinkPreviewDemo />
    </div>
  );
}
