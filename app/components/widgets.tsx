'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export function Accordion({items}:{items:[string,string][]}) {
  return <div className="faq-list">{items.map(([question,answer])=><details key={question}><summary>{question}<span className="faq-plus"/></summary><p>{answer}</p></details>)}</div>;
}

export function CoverageSearch() {
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState<'idle'|'loading'|'unavailable'>('idle');
  const [message,setMessage]=useState('');
  async function search(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('loading'); setMessage('');
    try {
      const response=await fetch(`/api/catalog?query=${encodeURIComponent(query)}`,{cache:'no-store'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Live coverage is unavailable right now.');
      setMessage('No verified supplier results were returned.');
    } catch(error) { setMessage(error instanceof Error?error.message:'Live coverage is unavailable right now.'); }
    finally { setStatus('unavailable'); }
  }
  return <><form className="coverage-search" onSubmit={search}><span aria-hidden="true">⌕</span><input aria-label="Search live country or service coverage" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search country or service"/><button type="submit" aria-label="Search coverage" disabled={status==='loading'}>{status==='loading'?'…':'→'}</button></form>{status==='unavailable'&&<div className="coverage-unavailable" role="status"><span className="setup-dot"/>{message}</div>}</>;
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
