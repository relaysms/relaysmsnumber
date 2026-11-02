import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Provider boundary: intentionally unavailable until a reviewed supplier adapter
// implements authenticated inventory, provisioning, and price verification.
export async function GET() {
  return NextResponse.json({ status: 'not_configured', message: 'Live number availability is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ status: 'invalid_request', message: 'Request body must be valid JSON.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ status: 'invalid_request', message: 'A valid selection is required.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const input = body as Record<string, unknown>;
  if (!['onetime', 'rental'].includes(String(input.mode)) || typeof input.country !== 'string' || input.country.trim().length < 2 || input.country.length > 80 || typeof input.service !== 'string' || input.service.trim().length < 2 || input.service.length > 100) {
    return NextResponse.json({ status: 'invalid_request', message: 'Choose a valid mode, country, and service.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ status: 'not_configured', message: 'Ordering is disabled until a verified number supplier, account authorization, and secure payment provider are configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
