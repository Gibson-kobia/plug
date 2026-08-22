import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toast';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = rawSiteUrl && rawSiteUrl !== ''
  ? rawSiteUrl
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://electronics.co.ke');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kenya Electronics Marketplace — Smartphones, Laptops, TVs, Audio',
    template: '%s | Kenya Electronics Marketplace',
  },
  description:
    "Kenya's trusted electronics marketplace for new and used electronics. Verified sellers, WhatsApp-first checkout, same-day Nairobi delivery, nationwide shipping.",
  keywords: [
    'electronics Kenya', 'phones Kenya', 'laptops Nairobi', 'smartphones Kenya',
    'used electronics Kenya', 'TVs Nairobi', 'earbuds Kenya', 'Oppo Kenya',
    'itel Kenya', 'Samsung Kenya',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: siteUrl,
    siteName: 'Kenya Electronics Marketplace',
    title: 'Kenya Electronics Marketplace',
    description: "Kenya's trusted marketplace for new and used electronics with WhatsApp-first ordering.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kenya Electronics Marketplace',
    description: "Verified sellers, same-day Nairobi delivery, WhatsApp checkout.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EA6A0C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE" suppressHydrationWarning>
      <body className="bg-surface text-body font-sans antialiased">
        <TooltipProvider delayDuration={200}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400"
          >
            Skip to content
          </a>
          <Suspense fallback={
            <header className="sticky top-0 z-40 h-16 w-full border-b border-b-neutral-200 bg-white/90 backdrop-blur-md sm:h-20" />
          }>
            <SiteHeader />
          </Suspense>
          {children}
          <SiteFooter />
          <Toaster position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
