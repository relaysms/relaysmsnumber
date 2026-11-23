'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export function Accordion({items}:{items:[string,string][]}) {
  return <div className="faq-list">{items.map(([question,answer])=><details key={question}><summary>{question}<span className="faq-plus"/></summary><p>{answer}</p></details>)}</div>;
}

type CatalogCountry = { code: string; name: string };
type CatalogOffer = { service_code: string; service_name: string; price_cents: number; available_count: number };

export function CoverageSearch() {
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState<'idle'|'loading'|'ready'|'unavailable'>('idle');
  const [message,setMessage]=useState('');
  const [countries,setCountries]=useState<CatalogCountry[]>([]);
  const [selectedCountry,setSelectedCountry]=useState<CatalogCountry|null>(null);
  const [offerings,setOfferings]=useState<CatalogOffer[]>([]);
  async function search(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('loading'); setMessage(''); setCountries([]); setSelectedCountry(null); setOfferings([]);
    try {
      if(query.trim().length<2) throw new Error('Enter at least two characters to search countries or a provider ID.');
      const response=await fetch('/api/catalog',{cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Live coverage is unavailable right now.');
      const term=query.trim().toLocaleLowerCase();
      const matches=(data.countries as CatalogCountry[]).filter(country=>country.name.toLocaleLowerCase().includes(term)||country.code.toLocaleLowerCase()===term);
      setCountries(matches);
      if(matches.length===0) setMessage('No matching countries were returned by the live GrizzlySMS catalog.');
      setStatus('ready');
    } catch(error) { setMessage(error instanceof Error?error.message:'Live coverage is unavailable right now.'); setStatus('unavailable'); }
  }
  async function loadCountry(country:CatalogCountry) {
    setStatus('loading'); setMessage(''); setSelectedCountry(country); setOfferings([]);
    try {
      const response=await fetch(`/api/catalog?country_code=${encodeURIComponent(country.code)}`,{cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Live prices are unavailable right now.');
      setOfferings(data.offerings as CatalogOffer[]);
      setStatus('ready');
    } catch(error) { setMessage(error instanceof Error?error.message:'Live prices are unavailable right now.'); setStatus('unavailable'); }
  }
  return <><form className="coverage-search" onSubmit={search}><span aria-hidden="true">⌕</span><input aria-label="Search GrizzlySMS supported countries" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search a country"/><button type="submit" aria-label="Search coverage" disabled={status==='loading'}>{status==='loading'?'…':'→'}</button></form>{(status==='unavailable'||(status==='ready'&&message))&&<div className="coverage-unavailable" role="status"><span className="setup-dot"/>{message}</div>}{countries.length>0&&<div className="coverage-results" aria-label="Live GrizzlySMS country results">{countries.map(country=><button className="coverage-result coverage-country" type="button" key={country.code} onClick={()=>loadCountry(country)} disabled={status==='loading'}><span className="country-mark">{country.code}</span><span className="country-name">{country.name}<small>GrizzlySMS country ID {country.code}</small></span><span className="sample-label">SEE PRICES →</span></button>)}</div>}{selectedCountry&&<div className="coverage-results" aria-live="polite"><h3 className="coverage-selected">{selectedCountry.name} ({selectedCountry.code})</h3>{offerings.length===0&&status==='ready'&&<p className="coverage-empty">No live services are currently listed for this country.</p>}{offerings.map(offer=><div className="coverage-result" key={offer.service_code}><span className="country-name">{offer.service_name}<small>{offer.available_count} currently available · code {offer.service_code}</small></span><span className="coverage-price">${(offer.price_cents/100).toFixed(2)} USD</span></div>)}</div>}<p className="coverage-disclaimer">Read-only GrizzlySMS catalog. Prices and available counts can change. Checking listings does not reserve or purchase a number. One-time activation only.</p></>;
}

export function FlowPanel({mode}:{mode:'rental'|'login'|'signup'|'reset'}) {
  const account=mode==='login'||mode==='signup'||mode==='reset';
  if(account) return <div className="integration-card"><span className="setup-pill">Coming later</span><h2>Customer accounts are not open yet.</h2><p>Account creation, sign-in, and password reset will be enabled after security setup is complete. No credentials are collected here.</p></div>;
  return <div className="flow-panel"><span className="setup-pill">Not available yet</span><h2>Monthly rentals are not available yet.</h2><p>GrizzlySMS’s public API documentation describes one-time activations, catalog, and activation-status operations. It does not document customer monthly rental inventory, provisioning, renewal, or cancellation endpoints.</p><div className="rental-terms"><b>No rental can be started here</b><span>We need the supplier’s supported rental API and approved renewal and cancellation policies before listing or selling monthly numbers.</span></div></div>;
}
export function SupportForm() {
  const [status,setStatus]=useState<'idle'|'loading'|'success'|'error'>('idle');
  const [notice,setNotice]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget; const fields=new FormData(form);
    setStatus('loading');setNotice('');
    try {
      const response=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fields.get('email'),subject:fields.get('subject'),message:fields.get('message')}),cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Support is not configured.');
      form.reset();setNotice(data.message||'Your support request was accepted.');setStatus('success');
    } catch(error) { setNotice(error instanceof Error?error.message:'Support is not configured.');setStatus('error'); }
  }
  return <form className="support-form" onSubmit={submit}><label>Email address<input type="email" name="email" required maxLength={254} autoComplete="email"/></label><label>Subject<input name="subject" required maxLength={120}/></label><label>How can we help?<textarea name="message" required maxLength={4000} rows={5}/></label><p>Do not include passwords, payment details, or SMS verification codes. The form cannot send requests until a support provider is configured.</p><button className="button" disabled={status==='loading'}>{status==='loading'?'Checking support status…':'Send support request'} <span>→</span></button>{(status==='success'||status==='error')&&<div className={`form-notice ${status==='success'?'form-success':''}`} role="status">{notice}</div>}</form>;
}
