import { cookies } from 'next/headers';
import { User } from '@/types';
import ProfilePageClient from '@/components/profile/ProfilePageClient';

async function getUser(): Promise<User | null> {
  'use server';
  try {
    const cookieStore = cookies();
    const jwtCookie = (await cookieStore).get('jwt')?.value;

    if (!jwtCookie) {
      return null;
    }

    // Make a request to the profile endpoint using the JWT cookie
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/profile`, {
      headers: {
        'Cookie': `jwt=${jwtCookie}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {return null;
  }
}

export default async function ProfilePage() {
  const user = await getUser();

  return <ProfilePageClient initialUser={user} />;
}
