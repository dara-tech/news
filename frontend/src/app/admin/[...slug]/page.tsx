import { redirect } from 'next/navigation';

interface AdminCatchAllProps {
  params: Promise<{ slug: string[] }>;
}

export default async function AdminCatchAll({ params }: AdminCatchAllProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');
  
  // Redirect /admin/... to /en/admin/... (default language)
  redirect(`/en/admin/${slug}`);
}
