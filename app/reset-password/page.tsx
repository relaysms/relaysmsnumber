import type { Metadata } from 'next';
import { AccountPage } from '../components/sections';
export const metadata: Metadata = { title: 'Reset password' };
export default function Page() { return <AccountPage mode="reset"/>; }
