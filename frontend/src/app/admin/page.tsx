import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect /admin to /en/admin (default language)
  redirect('/en/admin/dashboard');
}
