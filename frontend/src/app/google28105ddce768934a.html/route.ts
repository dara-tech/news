import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: google28105ddce768934a.html', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
