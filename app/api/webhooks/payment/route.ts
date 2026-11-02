import { NextResponse } from 'next/server';

// Do not accept payment events until signature verification, idempotency,
// account mapping, and durable event handling are implemented.
export async function POST() {
  return NextResponse.json({ status: 'not_configured', message: 'Payment webhooks are disabled until provider signature verification and idempotent event handling are configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
