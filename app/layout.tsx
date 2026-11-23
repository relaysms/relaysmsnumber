import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteFooter, SiteHeader } from './components/site-chrome';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'RelayNumber — A number when you need one', template: '%s | RelayNumber' },
  description: 'Browse current one-time SMS number availability and pricing by country. Ordering and monthly rentals are not available yet.',
  applicationName: 'RelayNumber',
  icons: { icon: '/icon.svg' },
  openGraph: { title: 'RelayNumber — A number when you need one', description: 'Browse current one-time provider coverage. Customer orders are not open yet.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body><div className="dev-banner"><span className="status-dot" /> BROWSE THE CATALOG <span>•</span> Number orders, SMS delivery, accounts, and support are not available yet</div><SiteHeader />{children}<SiteFooter /></body></html>;
}
