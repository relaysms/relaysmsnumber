import type { Metadata } from 'next';
import { HomePage } from './components/sections';
export const metadata: Metadata = { title: 'A number when you need one', description: 'Browse current one-time SMS number availability and prices by country. Ordering and monthly rentals are not available yet.' };
export default function Page() { return <HomePage/>; }
