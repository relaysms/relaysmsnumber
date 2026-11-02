import type { Metadata } from 'next';
import { PolicyPage } from '../components/sections';
export const metadata: Metadata = { title: 'Privacy' };
export default function Page() { return <PolicyPage kind="privacy"/>; }
