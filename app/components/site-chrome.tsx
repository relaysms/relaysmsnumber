'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Coverage', '/coverage'], ['Help', '/help']] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="RelayNumber home"><span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"/><path d="M11 11h10M11 16h6M11 21h10"/></svg></span><span>Relay<span className="brand-light">Number</span></span></Link>
    <button className="menu-toggle" aria-expanded={open} aria-controls="primary-nav" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}><span/><span/></button>
    <nav id="primary-nav" aria-label="Main navigation" className={open ? 'nav-open' : ''}>
      {links.map(([name, href]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{name}</Link>)}
      <Link className="nav-signin" href="/login" onClick={() => setOpen(false)}>Sign in</Link><Link className="button button-small" href="/signup" onClick={() => setOpen(false)}>Create account <span aria-hidden="true">↗</span></Link>
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="section-wrap footer-main"><div className="footer-about"><Link className="brand brand-footer" href="/"><span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"/><path d="M11 11h10M11 16h6M11 21h10"/></svg></span><span>Relay<span className="brand-light">Number</span></span></Link><p>A number when you need one.<br/>Simple, flexible access to phone numbers.</p><small>Availability, capabilities, and acceptance vary.</small></div><div className="footer-links"><div><h4>Explore</h4><Link href="/how-it-works">How it works</Link><Link href="/pricing">Pricing</Link><Link href="/coverage">Coverage</Link></div><div><h4>Support</h4><Link href="/help">Help center</Link><Link href="/login">My account</Link></div><div><h4>Legal</h4><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/acceptable-use">Acceptable Use</Link></div></div></div><div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} RelayNumber. All rights reserved.</span><span>Built for clarity. <span className="footer-heart">♥</span></span></div></footer>;
}
