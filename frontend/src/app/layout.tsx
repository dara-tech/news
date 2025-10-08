// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css'
import '../styles/enterprise.css';
import AppProviders from "@/components/layout/AppProviders";
import AdSenseScript from "@/components/adsense/AdSenseScript";

// Modern font stack for English
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// Kontumruy Pro for Khmer text
const kontumruyPro = localFont({
  src: [
    {
      path: '../../public/fonts/KantumruyPro-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/KantumruyPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/KantumruyPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-kontumruy-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.razewire.online'),
  title: {
    default: 'Razewire - Your Daily Source of News',
    template: '%s | Razewire',
  },
  description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-modern.svg', type: 'image/svg+xml' },
      { url: '/favicon-advanced.svg', type: 'image/svg+xml' },
      { url: '/favicon-animated.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon-modern.svg',
  },
  verification: {
    google: 'google28105ddce768934a',
  },
  other: {
    'google-adsense-account': 'ca-pub-8955989254579960',
  },
  openGraph: {
    title: 'Razewire - Your Daily Source of News',
    description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    url: 'https://www.razewire.online',
    siteName: 'Razewire',
    images: [
      {
        url: 'https://www.razewire.online/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Razewire - Your Daily Source of News',
        type: 'image/svg+xml',
      },
    ],
    locale: 'en_US',
    type: 'website',
    countryName: 'Cambodia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Razewire - Your Daily Source of News',
    description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    images: ['https://www.razewire.online/og-image.svg'],
    site: '@razewire',
    creator: '@razewire',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = `${inter.variable} ${plusJakartaSans.variable} ${poppins.variable} ${kontumruyPro.variable}`;

  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${fontVariables} ${inter.className} antialiased`}>
        <AdSenseScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}