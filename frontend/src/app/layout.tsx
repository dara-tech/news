// app/layout.tsx
import type { Metadata } from "next";
import { Kantumruy_Pro } from 'next/font/google';
import './globals.css'
import '../styles/enterprise.css';
import AppProviders from "@/components/layout/AppProviders";
import AdSenseScript from "@/components/adsense/AdSenseScript";

const kantumruyPro = Kantumruy_Pro({
  variable: '--font-kantumruy-pro',
  subsets: ['khmer', 'latin'],
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
  manifest: '/manifest.json',
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
  const fontVariables = kantumruyPro.variable;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <AdSenseScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}