import { cookies } from 'next/headers';
import api from '@/lib/api';
import { User } from '@/types';
import ProfilePageClient from '@/components/profile/ProfilePageClient';

async function getUser(): Promise<User | null> {
  'use server';
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    if (!token) {
      return null;
    }

    // Use the api instance, assuming it's configured for server-side use
    // or can handle the token appropriately.
    const res = await api.get('/auth/me', {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    
    return res.data;
  } catch {
    // It's common for this to fail if the user is not authenticated.
    // We can log this for debugging but shouldn't treat it as a critical error.
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getUser();

  return <ProfilePageClient initialUser={user} />;
}
