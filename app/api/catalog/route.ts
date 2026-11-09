import { NextResponse } from 'next/server';
import { GrizzlySmsError, listCountries, listPrices } from '../../../lib/providers/grizzlysms';

export const dynamic = 'force-dynamic';

type CountryPolicy = { mode: 'all' } | { mode: 'restricted'; codes: string[] } | { mode: 'invalid' };

function countryPolicy(): CountryPolicy {
  const raw = process.env.GRIZZLY_ALLOWED_COUNTRIES?.trim();
  if (!raw) return { mode: 'all' };
  const codes = raw.split(',').map((code) => code.trim().toUpperCase());
  if (codes.length > 250 || codes.some((code) => !/^\d{1,6}$/.test(code))) return { mode: 'invalid' };
  return { mode: 'restricted', codes: [...new Set(codes)] };
}

function unavailable(message: string) {
  return NextResponse.json({ status: 'unavailable', message }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}

// This endpoint is a read-only catalog. It never allocates a number or starts a rental.
export async function GET(request: Request) {
  const policy = countryPolicy();
  if (!process.env.GRIZZLY_SMS_API_KEY || policy.mode === 'invalid' || (policy.mode === 'restricted' && policy.codes.length === 0)) {
    return unavailable('Live GrizzlySMS catalog is not configured.');
  }

  const countryCode = new URL(request.url).searchParams.get('country_code')?.trim().toUpperCase();
  if (countryCode) {
    if (!/^\d{1,6}$/.test(countryCode)) {
      return NextResponse.json({ status: 'invalid_request', message: 'Choose a valid country.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    if (policy.mode === 'restricted' && !policy.codes.includes(countryCode)) {
      return NextResponse.json({ status: 'not_available', message: 'Live catalog is not available for this country.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  try {
    const providerCountries = await listCountries();
    const countries = policy.mode === 'all'
      ? providerCountries
      : providerCountries.filter((country) => policy.codes.includes(country.code.toUpperCase()));
    if (countryCode) {
      const selected = countries.find((country) => country.code.toUpperCase() === countryCode);
      if (!selected) {
        return NextResponse.json({ status: 'not_available', message: 'Live catalog is not available for this country.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ status: 'ok', country: selected, offerings: await listPrices(countryCode) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ status: 'ok', countries }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof GrizzlySmsError && error.kind === 'not_configured'
      ? 'Live GrizzlySMS catalog is not configured.'
      : 'Live supplier catalog is temporarily unavailable.';
    return unavailable(message);
  }
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
