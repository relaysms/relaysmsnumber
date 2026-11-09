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
      const matches=(data.countries as CatalogCountry[]).filter(country=>country.name.toLocaleLowerCase().includes(term)||country.code.toLocaleLowerCase()===term||country.phone_prefix.includes(term));
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
  return <><form className="coverage-search" onSubmit={search}><span aria-hidden="true">⌕</span><input aria-label="Search GrizzlySMS supported countries" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search a country"/><button type="submit" aria-label="Search coverage" disabled={status==='loading'}>{status==='loading'?'…':'→'}</button></form>{(status==='unavailable'||(status==='ready'&&message))&&<div className="coverage-unavailable" role="status"><span className="setup-dot"/>{message}</div>}{countries.length>0&&<div className="coverage-results" aria-label="Live GrizzlySMS country results">{countries.map(country=><button className="coverage-result coverage-country" type="button" key={country.code} onClick={()=>loadCountry(country)} disabled={status==='loading'}><span className="country-mark">{country.code}</span><span className="country-name">{country.name}<small>GrizzlySMS country ID {country.code}</small></span><span className="sample-label">SEE PRICES →</span></button>)}</div>}{selectedCountry&&<div className="coverage-results" aria-live="polite"><h3 className="coverage-selected">{selectedCountry.name} ({selectedCountry.code})</h3>{offerings.length===0&&status==='ready'&&<p className="coverage-empty">No live services are currently listed for this country.</p>}{offerings.map(offer=><div className="coverage-result" key={offer.service_code}><span className="country-name">{offer.service_name}<small>{offer.available_count} currently available · code {offer.service_code}</small></span><span className="coverage-price">${(offer.price_cents/100).toFixed(2)} USD</span></div>)}</div>}<p className="coverage-disclaimer">Live GrizzlySMS catalog, where configured. Prices and available counts can change; specific phone numbers are allocated only after an order. One-time activation only.</p></>;
}

export function FlowPanel({mode}:{mode:'onetime'|'rental'|'login'|'signup'|'reset'}) {
  const rental=mode==='rental';
  const account=mode==='login'||mode==='signup'||mode==='reset';
  const [country,setCountry]=useState('');
  const [service,setService]=useState('');
  const [status,setStatus]=useState<'idle'|'loading'|'unavailable'>('idle');
  const [notice,setNotice]=useState('');
  async function check(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setStatus('loading');setNotice('');
    try {
      const response=await fetch('/api/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:rental?'rental':'onetime',country,service}),cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Ordering is unavailable.');
      setNotice('No verified availability was returned.');
    } catch(error) { setNotice(error instanceof Error?error.message:'Ordering is unavailable.'); }
    finally { setStatus('unavailable'); }
  }
  if(account) return <div className="integration-card"><span className="setup-pill">Setup required</span><h2>{mode==='login'?'Sign-in is unavailable':mode==='signup'?'Account creation is unavailable':'Password reset is unavailable'}</h2><p>Authentication is not configured. This page does not collect passwords or create accounts.</p><ul><li>Configure an authentication provider and verified email flow.</li><li>Set secure session cookies and password reset.</li><li>Authorize every private record on the server.</li></ul></div>;
  if(rental) return <div className="flow-panel"><span className="setup-pill">Rental setup required</span><h2>Monthly rentals are not available yet.</h2><p>GrizzlySMS’s public API documentation describes one-time activations, catalog, and activation-status operations. It does not document customer monthly rental inventory, provisioning, renewal, or cancellation endpoints.</p><div className="rental-terms"><b>No rental can be started here</b><span>We need the supplier’s supported rental API and approved renewal and cancellation policies before listing or selling monthly numbers.</span></div></div>;
  return <form className="flow-panel" onSubmit={check}>
    <div className="flow-steps"><span className="flow-current">1 <small>Choose</small></span><i/><span>2 <small>Review</small></span><i/><span>3 <small>Checkout</small></span></div>
    <h2>{rental?'Check rental options':'Check one-time options'}</h2>
    <p>{rental?'Choose the country and capabilities you need. Recurring billing and cancellation terms must be confirmed before payment.':'Enter a country and service to check when a verified supplier catalog becomes available.'}</p>
    <div className="flow-fields"><label>Country or region<input required maxLength={80} value={country} onChange={event=>setCountry(event.target.value)} placeholder="Enter a country" autoComplete="country-name"/></label><label>{rental?'Capability needed':'Service or general SMS'}<input required maxLength={100} value={service} onChange={event=>setService(event.target.value)} placeholder={rental?'SMS, voice, or both':'Enter a service or general SMS'}/></label></div>
    {rental&&<div className="rental-terms"><b>Recurring billing disclosure</b><span>Monthly amount, renewal date, cancellation rules, and included capabilities are unavailable until live catalog and business policy are configured.</span></div>}
    <button className="button" type="submit" disabled={status==='loading'}>{status==='loading'?'Checking…':'Check live availability'} <span>→</span></button>
    {status==='unavailable'&&<div className="form-notice" role="status"><strong>Unavailable in this preview.</strong><span>{notice} No number, price, payment, or reservation was created.</span></div>}
  </form>;
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
