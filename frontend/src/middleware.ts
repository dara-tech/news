import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'km'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // If not, redirect to the default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
    // Skip all internal paths (_next, api, login, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|login|robots.txt|sitemap.xml).*)',
  ],
};
