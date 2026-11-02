import type { Metadata } from 'next';
import { FlowPage } from '../../components/sections';
export const metadata: Metadata = { title: 'One-time number' };
export default function Page() { return <FlowPage mode="onetime"/>; }
