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
  metadataBase: new URL('http://localhost:3000'), // Replace with your actual domain
  title: {
    default: 'NewsApp - Your Daily Source of News',
    template: '%s | NewsApp',
  },
  description: 'The latest news in technology, business, sports, and more. Stay informed with NewsApp.',
  openGraph: {
    title: 'NewsApp - Your Daily Source of News',
    description: 'The latest news in technology, business, sports, and more.',
    url: 'https://your-domain.com',
    siteName: 'NewsApp',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'NewsApp Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsApp - Your Daily Source of News',
    description: 'The latest news in technology, business, sports, and more.',
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
    <html lang="en">
      <body className={`${fontVariables} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}