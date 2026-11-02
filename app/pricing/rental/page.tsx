import type { Metadata } from 'next';
import { FlowPage } from '../../components/sections';
export const metadata: Metadata = { title: 'Monthly rental' };
export default function Page() { return <FlowPage mode="rental"/>; }
