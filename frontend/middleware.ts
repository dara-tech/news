import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'kh'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Domains can be used to configure locale-specific domains
  // domains: [
  //   {
  //     domain: 'example.com',
  //     defaultLocale: 'en'
  //   },
  //   {
  //     domain: 'example.kh',
  //     defaultLocale: 'kh'
  //   }
  // ]
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(kh|en)/:path*']
};
