import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'not_configured', message: 'Authentication is disabled until a trusted provider, verification flows, secure sessions, and server-side authorization are configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
