import { NextResponse } from 'next/server';

// Do not accept provider callbacks until a provider adapter validates signatures.
export async function POST() {
  return NextResponse.json({ status: 'not_configured', message: 'SMS webhooks are disabled until a provider-specific signature verifier and event handler are configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
