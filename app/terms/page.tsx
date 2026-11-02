import type { Metadata } from 'next';
import { PolicyPage } from '../components/sections';
export const metadata: Metadata = { title: 'Terms' };
export default function Page() { return <PolicyPage kind="terms"/>; }
