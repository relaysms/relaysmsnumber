import 'server-only';

const GRIZZLY_API = 'https://api.grizzlysms.com/stubs/handler_api.php';
const REQUEST_TIMEOUT_MS = 8_000;

export class GrizzlySmsError extends Error {
  constructor(
    message: string,
    readonly kind: 'not_configured' | 'upstream' | 'invalid_response',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GrizzlySmsError';
  }
}

export type GrizzlySmsCountry = { code: string; name: string };
export type GrizzlySmsPrice = {
  service_code: string;
  service_name: string;
  price_cents: number;
  available_count: number;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function apiKey(): string {
  const key = process.env.GRIZZLY_SMS_API_KEY?.trim();
  if (!key) throw new GrizzlySmsError('GrizzlySMS is not configured.', 'not_configured');
  return key;
}

async function request(action: 'getCountries' | 'getServicesList' | 'getPricesV3', extra: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(GRIZZLY_API);
  url.searchParams.set('api_key', apiKey());
  url.searchParams.set('action', action);
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);

  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new GrizzlySmsError('GrizzlySMS is temporarily unavailable.', 'upstream');
  }

  let body: unknown;
  const text = await response.text().catch(() => '');
  try {
    body = JSON.parse(text);
  } catch {
    // The supplier uses short text responses for API errors.
    if (!response.ok || /^(BAD_|NO_|ERROR_|WRONG_|ACCESS_DENIED|SERVICE_UNAVAILABLE|USERS_IP_)/.test(text.trim())) {
      throw new GrizzlySmsError('GrizzlySMS could not complete the catalog request.', 'upstream', response.status);
    }
    throw new GrizzlySmsError('GrizzlySMS returned an invalid catalog response.', 'invalid_response', response.status);
  }
  if (!response.ok) throw new GrizzlySmsError('GrizzlySMS could not complete the catalog request.', 'upstream', response.status);
  return body;
}

function parseCollection(value: unknown, itemParser: (item: unknown, key?: string) => { code: string; name: string }): { code: string; name: string }[] {
  if (Array.isArray(value)) return value.map((item) => itemParser(item));
  const record = asRecord(value);
  if (!record) throw new GrizzlySmsError('GrizzlySMS returned an invalid catalog response.', 'invalid_response');
  return Object.entries(record).map(([key, item]) => itemParser(item, key));
}

function countryItem(item: unknown, key?: string): GrizzlySmsCountry {
  const record = asRecord(item);
  const possibleCountryId = record?.country;
  const code = String(record?.id ?? record?.countryId ?? (typeof possibleCountryId === 'number' || (typeof possibleCountryId === 'string' && /^\d+$/.test(possibleCountryId)) ? possibleCountryId : undefined) ?? key ?? '');
  const name = record?.eng ?? record?.name ?? record?.english ?? record?.countryName;
  if (!/^\d{1,6}$/.test(code) || typeof name !== 'string' || !name.trim()) {
    throw new GrizzlySmsError('GrizzlySMS returned an invalid country catalog.', 'invalid_response');
  }
  return { code, name: name.trim() };
}

function serviceItem(item: unknown, key?: string): { code: string; name: string } {
  const record = asRecord(item);
  const code = String(record?.code ?? record?.service ?? key ?? '');
  const name = record?.name ?? record?.title ?? record?.serviceName ?? code;
  if (!code || typeof name !== 'string') {
    throw new GrizzlySmsError('GrizzlySMS returned an invalid service catalog.', 'invalid_response');
  }
  return { code, name: name.trim() };
}

export async function listCountries(): Promise<GrizzlySmsCountry[]> {
  const payload = await request('getCountries');
  const record = asRecord(payload);
  const collection = record?.countries ?? payload;
  return parseCollection(collection, countryItem);
}

function numeric(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseOffers(payload: unknown, serviceNames: Map<string, string>): GrizzlySmsPrice[] {
  const root = asRecord(payload);
  const data = root?.prices ?? root?.data ?? payload;
  const result: GrizzlySmsPrice[] = [];

  function add(path: string[], entry: unknown) {
    const record = asRecord(entry);
    if (!record) return;
    const serviceCode = String(record.service ?? record.serviceCode ?? record.code ?? [...path].reverse().find((segment) => serviceNames.has(segment)) ?? '');
    if (!serviceCode) return;
    const price = numeric(record.cost ?? record.price ?? record.activationCost ?? record.amount);
    const count = numeric(record.count ?? record.quantity ?? record.available ?? record.stock);
    if (!price || count === undefined || count <= 0) return;
    const priceCents = Math.round(price * 100);
    if (!Number.isSafeInteger(priceCents) || priceCents <= 0) return;
    result.push({ service_code: serviceCode, service_name: serviceNames.get(serviceCode) ?? serviceCode, price_cents: priceCents, available_count: Math.floor(count) });
  }

  function visit(value: unknown, path: string[] = []) {
    if (Array.isArray(value)) {
      for (const item of value) visit(item, path);
      return;
    }
    const record = asRecord(value);
    if (!record) return;
    if ('cost' in record || 'price' in record || 'activationCost' in record || 'amount' in record) {
      add(path, record);
      return;
    }
    for (const [key, item] of Object.entries(record)) {
      if (['status', 'message', 'currency'].includes(key)) continue;
      visit(item, [...path, key]);
    }
  }
  visit(data);

  const unique = new Map<string, GrizzlySmsPrice>();
  for (const offer of result) {
    const existing = unique.get(offer.service_code);
    if (!existing || offer.price_cents < existing.price_cents) unique.set(offer.service_code, offer);
  }
  return [...unique.values()].sort((a, b) => a.service_name.localeCompare(b.service_name));
}

export async function listPrices(countryId: string): Promise<GrizzlySmsPrice[]> {
  if (!/^\d{1,6}$/.test(countryId)) throw new GrizzlySmsError('A valid GrizzlySMS country ID is required.', 'invalid_response');
  const [servicePayload, pricePayload] = await Promise.all([
    request('getServicesList'),
    request('getPricesV3', { country: countryId }),
  ]);
  const serviceRecord = asRecord(servicePayload);
  const services = parseCollection(serviceRecord?.services ?? servicePayload, serviceItem);
  const serviceNames = new Map(services.map((service) => [service.code, service.name]));
  const offers = parseOffers(pricePayload, serviceNames);
  if (!offers.length && asRecord(pricePayload) === undefined && !Array.isArray(pricePayload)) {
    throw new GrizzlySmsError('GrizzlySMS returned an invalid price catalog.', 'invalid_response');
  }
  return offers;
}
