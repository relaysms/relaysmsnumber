import type { Metadata } from 'next';
import { PolicyPage } from '../components/sections';
export const metadata: Metadata = { title: 'Acceptable use' };
export default function Page() { return <PolicyPage kind="acceptable-use"/>; }
