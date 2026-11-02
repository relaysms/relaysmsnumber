import type { Metadata } from 'next';
import { HelpPage } from '../components/sections';
export const metadata: Metadata = { title: 'Help and support' };
export default function Page() { return <HelpPage/>; }
