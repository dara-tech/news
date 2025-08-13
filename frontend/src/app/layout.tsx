// app/layout.tsx
import type { Metadata } from "next";
import { Kantumruy_Pro } from 'next/font/google';
import './globals.css';
import AppProviders from "@/components/layout/AppProviders";

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
  verification: {
    google: 'google28105ddce768934a',
  },
  openGraph: {
    title: 'Razewire - Your Daily Source of News',
    description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    url: 'https://www.razewire.online',
    siteName: 'Razewire',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'Razewire Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Razewire - Your Daily Source of News',
    description: 'Your daily source for the latest news in tech, business, and sports. Stay informed, stay ahead.',
    images: ['/placeholder.jpg'],
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}