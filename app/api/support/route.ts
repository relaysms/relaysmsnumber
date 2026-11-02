import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ status: 'invalid_request', message: 'Request body must be valid JSON.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ status: 'invalid_request', message: 'A valid support request is required.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  const fields = body as Record<string, unknown>;
  const email = typeof fields.email === 'string' ? fields.email.trim() : '';
  const subject = typeof fields.subject === 'string' ? fields.subject.trim() : '';
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || subject.length > 120 || message.length < 5 || message.length > 4000) {
    return NextResponse.json({ status: 'invalid_request', message: 'Check the email, subject, and message length.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  // Do not persist or forward customer text until an approved support processor is configured.
  return NextResponse.json({ status: 'not_configured', message: 'No support service is connected, so RelayNumber did not create a support ticket.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
