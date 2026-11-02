import type { Metadata } from 'next';
import { HomePage } from './components/sections';
export const metadata: Metadata = { title: 'A number when you need one', description: 'Choose one-time SMS access or a monthly virtual number rental. Availability and features vary.' };
export default function Page() { return <HomePage/>; }
