import type { Metadata } from 'next';
import { InfoPage, Steps } from '../components/sections';
export const metadata: Metadata = { title: 'How it works' };
export default function Page() { return <InfoPage eyebrow="How it works" title="Start with the live catalog." intro="RelayNumber currently lets visitors browse provider coverage and prices. Checking a listing does not place an order or reserve a number."><Steps/><div className="info-callout"><b>What is available now:</b> read-only catalog browsing when the GrizzlySMS connection is configured. One-time ordering, accounts, monthly rentals, and support remain unavailable.</div><h2>Monthly rentals</h2><p>We have not verified a rental API with GrizzlySMS, so no rental inventory or recurring plans are listed.</p></InfoPage>; }
