import type { Metadata } from 'next';
import { AccountPage } from '../components/sections';
export const metadata: Metadata = { title: 'Sign in' };
export default function Page() { return <AccountPage mode="login"/>; }
