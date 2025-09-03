import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle ads.txt file for AdSense verification
  if (request.nextUrl.pathname === '/ads.txt') {
    const adsContent = 'google.com, pub-8955989254579960, DIRECT, f08c47fec0942fa0';
    
    return new NextResponse(adsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Handle robots.txt
  if (request.nextUrl.pathname === '/robots.txt') {
    const robotsContent = `User-agent: *
Allow: /

Sitemap: https://www.razewire.online/sitemap.xml`;
    
    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ads.txt',
    '/robots.txt',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};