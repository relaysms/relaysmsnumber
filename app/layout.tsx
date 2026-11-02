import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteFooter, SiteHeader } from './components/site-chrome';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'RelayNumber — A number when you need one', template: '%s | RelayNumber' },
  description: 'Explore one-time SMS access and monthly virtual number rentals. Availability and features vary by country and provider.',
  applicationName: 'RelayNumber',
  icons: { icon: '/icon.svg' },
  openGraph: { title: 'RelayNumber — A number when you need one', description: 'Flexible virtual phone number options, with details up front.', type: 'website' },
};

const deploymentLabel = process.env.APP_ENV === 'production'
  ? 'PRODUCTION DEPLOYMENT · CUSTOMER FEATURES DISABLED'
  : 'PREVIEW MODE · CUSTOMER FEATURES DISABLED';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body><div className="dev-banner"><span className="status-dot" /> {deploymentLabel} <span>•</span> Orders, accounts, messages, and support are disabled until verified integrations are connected</div><SiteHeader />{children}<SiteFooter /></body></html>;
}
