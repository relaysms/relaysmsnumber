import type { Metadata } from 'next';
import { AccountPage } from '../components/sections';
export const metadata: Metadata = { title: 'Create an account' };
export default function Page() { return <AccountPage mode="signup"/>; }
