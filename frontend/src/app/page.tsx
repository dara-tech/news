import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect root path to /en (default language)
  redirect('/en');
}
