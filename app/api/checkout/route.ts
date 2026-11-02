import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ status: 'invalid_request', message: 'Request body must be valid JSON.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ status: 'invalid_request', message: 'A catalog selection is required.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const selection = body as Record<string, unknown>;
  if (!['onetime', 'rental'].includes(String(selection.mode)) || typeof selection.catalogItemId !== 'string' || selection.catalogItemId.length < 1 || selection.catalogItemId.length > 160) {
    return NextResponse.json({ status: 'invalid_request', message: 'Choose a valid catalog item and purchase mode.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ status: 'not_configured', message: 'Checkout is disabled until authentication, verified supplier inventory, and hosted payment checkout are implemented.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
