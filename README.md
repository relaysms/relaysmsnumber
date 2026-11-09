# RelayNumber

RelayNumber is a Next.js App Router and TypeScript application for one-time virtual number sessions and monthly number rentals. The existing navy, teal, and off-white visual identity is retained across the application.

## Local development

Requirements: Node.js 20.9 or later and npm.

```sh
npm install
Copy-Item .env.example .env.local   # PowerShell
npm run dev
```

Open <http://localhost:3000>. On macOS/Linux, copy `.env.example` to `.env.local` with `cp .env.example .env.local`.

Available scripts:

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run typecheck` runs TypeScript checking.

## Routes

- `/` landing page
- `/how-it-works`, `/pricing`, `/coverage`, `/help`
- `/pricing/onetime`, `/pricing/rental`
- `/login`, `/signup`, `/dashboard`
- `/terms`, `/privacy`, `/acceptable-use`
- `/api/catalog`, `/api/checkout`, `/api/auth`, `/api/support`, `/api/webhooks/sms`, and `/api/webhooks/payment` are server-side integration boundaries

## Environment variables

`.env.example` documents each current setting, its purpose, secret status, and where to configure it. Copy it to `.env.local` for development. In Vercel, add server variables under the intended project's **Settings → Environment Variables**, selecting Preview for preview deployments and Production only after launch approval. Do not commit `.env.local` or paste credentials into source control. The server-only GrizzlySMS client powers a read-only catalog when configured; ordering, rentals, and customer webhook handling remain unavailable. Adding a key does not enable those customer features.

| Variables | Belongs to / where to get it | Secret? |
| --- | --- | --- |
| `APP_ENV` | Deployment environment label set in app host | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical site domain configured in app host | No; browser-visible |
| `AUTH_PROVIDER` | Selected auth adapter name | No |
| `AUTH_SECRET` | Auth adapter/server session configuration; generate or retrieve from auth provider | **Yes** |
| `DATABASE_URL` | Connection string from selected database provider | **Yes** |
| `NUMBER_PROVIDER` | GrizzlySMS catalog adapter selection (`grizzlysms`) | No |
| `GRIZZLY_ALLOWED_COUNTRIES` | Optional server-only comma-separated GrizzlySMS numeric country IDs for emergency restrictions; blank shows every country the provider returns | No |
| `GRIZZLY_SMS_API_KEY` | GrizzlySMS account API settings; set in local `.env.local` or as a sensitive Vercel Preview variable for the chosen project | **Yes** |
| `PAYMENT_PROVIDER` | Selected payment processor adapter name | No |
| `PAYMENT_SECRET_KEY` | Payment processor server API credential | **Yes** |
| `PAYMENT_WEBHOOK_SECRET` | Payment processor webhook signing secret | **Yes** |
| `SUPPORT_PROVIDER` | Selected support system adapter name | No |
| `SUPPORT_PROVIDER_API_KEY` | Support system credential | **Yes** |
| `REFUND_POLICY_URL`, `CANCELLATION_POLICY_URL`, `PRIVACY_POLICY_URL`, `TERMS_POLICY_URL` | Owner/counsel-approved policy page URLs set in app host | No |

Secrets must remain server-side. Never prefix a credential with `NEXT_PUBLIC_`. A provider account, an adapter implementation, verified webhooks, and deployment configuration are all required; environment values alone are not a connection.

## Current integration state

The application is not ready to accept real customers. It contains the customer-facing routes, responsive layouts, accessible forms, FAQ, read-only supplier catalog, and server-side API boundaries. The site banner says preview mode; customer ordering, checkout, auth, SMS/payment webhooks, and support remain unavailable. No number, reservation, message, payment, receipt, account, or support ticket is fabricated. Login and sign-up do not collect credentials. The dashboard contains no customer data and is not protected until authentication is implemented. When configured, the public catalog is intended to return every country GrizzlySMS reports; `GRIZZLY_ALLOWED_COUNTRIES` can optionally restrict that list. This deployment must not be advertised as a live service.

GrizzlySMS is the selected number/SMS supplier. The server-side catalog adapter uses the documented `getCountries`, `getServicesList`, and `getPricesV3` actions only; it does not allocate numbers, read activation messages, or access balance-affecting endpoints. `/api/catalog` is read-only and is intended to return all countries GrizzlySMS reports unless `GRIZZLY_ALLOWED_COUNTRIES` is set to a server-side list of provider country IDs. The owner reports `GRIZZLY_SMS_API_KEY` is configured as a sensitive Preview variable in `relaysmsnumber-7hcq`; this checkout's `.vercel/project.json` points to `relaysmsnumber`, so the intended deployment project still needs to be confirmed. No authenticated catalog request or returned data has yet been verified. Specific phone numbers are allocated only during a purchase and are not exposed by a catalog lookup. GrizzlySMS's public documentation describes one-time activation and status APIs but does not document monthly customer rental provisioning, renewals, or cancellations; monthly rentals remain disabled. See [GrizzlySMS API documentation](https://grizzlysms.com/docs) and its [official API client](https://github.com/GrizzlySMS-Git/grizzly-sms-mcp).

The support endpoint validates request fields but does not create or forward a ticket. Provider integration, persistent rate limiting, CSRF/origin controls as applicable, webhook signature verification, idempotency, authorization, data retention, and abuse controls must be implemented before public launch. These require chosen providers, policies, and infrastructure. The current API stubs are not a production security layer.

## Launch progress snapshot

- **Repository work present:** Next.js routes and UI, server-side unavailable stubs, preview-only messaging, editable legal placeholders, and documented configuration/checklist. The repository is `relaysms/relaysmsnumber`; `codex/vercel-preview` is the intended preview branch and `master` remains the default branch.
- **Vercel connection:** The `relaysmsnumber` project is connected to this GitHub repository. The reviewed deployment is `https://relaysmsnumber-8tmzmd44m-relay-8665.vercel.app` (Preview, READY, protected by Vercel Authentication); the homepage was served and the preview/customer-disabled banner was verified.
- **Deployment caveat:** The first Git-triggered build for `codex/vercel-preview` in the existing project was unexpectedly labeled Production and ended in Error. A later explicit Preview deployment succeeded after setting that project's framework to Next.js. The owner subsequently confirmed a separate Vercel flow that reported a Production deployment for a newly named `relaysmsnumber-7hcq` project was intentional; that separate project's current settings and live status have not been independently verified. Choose one canonical project before configuring production secrets or pushing further changes.
- **Provider accounts/configuration needed:** GrizzlySMS Preview key is reported configured on `relaysmsnumber-7hcq`; it is not on this checkout's currently linked `relaysmsnumber` project. The live catalog request and returned data remain unverified. GrizzlySMS does not document a monthly rental API or provider webhook for this implementation. The auth/database provider, payment processor, support destination, and production environment configuration remain. Keep credentials in provider/host settings, not chat or source control.
- **Business/legal decisions needed:** legal business country and operating countries; company identity/contact; permitted use cases; refund and expiry/non-delivery rules; rental renewal/cancellation terms; SMS content retention; owner/counsel-approved Terms, Privacy, and Acceptable Use.

## Launch readiness gate

Do not enable customer acquisition, number assignment, or payment until every item below is verified. Keep the public site in preview mode while any required item is incomplete.

- [ ] **Business and geography:** record the legal business country, business identity/contact, applicable jurisdictions, initial customer countries, and permitted use cases. Do not derive these from device locale.
- [ ] **Number/SMS supplier (GrizzlySMS selected):** confirm offered countries/use cases are permitted and agree supplier terms. Add the API key as a sensitive server-side Preview variable on the project actually used for deployment. Verify live country, service, price, and availability data before relying on the catalog. The public catalog defaults to every country GrizzlySMS returns; optionally configure `GRIZZLY_ALLOWED_COUNTRIES` with numeric provider country IDs as a server-side restriction. Keep one-time orders disabled until payment, customer authorization, provisioning, SMS delivery, support, policy, and abuse controls are implemented and verified. Do not enable rentals without a documented and verified rental API.
- [ ] **Authentication and database:** choose providers, configure verified email, password reset, session security, encrypted connection, retention/deletion, and owner-scoped authorization on every private read/write.
- [ ] **Payments:** choose a processor eligible for the legal business country and recurring billing. Implement hosted checkout, signed webhook validation, idempotency, subscription state/renewal, cancellation, receipts, and safe reconciliation. Verify test and live modes separately.
- [ ] **Support:** choose the support destination, implement validation and rate limiting, disclose data handling, and confirm delivery/retention with a real request before launch.
- [ ] **Commercial and legal policies:** owner and counsel approve Terms, Privacy, Acceptable Use, refund/no-message policy, expiry, renewal, cancellation, data retention, prohibited use, and jurisdictional disclosures. Replace every review placeholder.
- [ ] **Security and operations:** add persistent rate limits/abuse controls, webhook monitoring, alerting, backups, incident response, log redaction, and secret rotation. Confirm passwords, payment details, and SMS codes are never logged and SMS content retention follows the approved policy.
- [ ] **Domain and HTTPS:** configure the production domain, TLS/HTTPS, canonical `NEXT_PUBLIC_SITE_URL`, secure redirect/origin allowlists, DNS, and production host settings.
- [ ] **Webhooks:** configure production SMS and payment webhook URLs in each provider dashboard; verify exact signing secrets, event types, replay/idempotency behavior, and observable failure alerts.
- [ ] **Environment separation:** set required server secrets in the production host's encrypted environment settings; confirm preview/staging credentials cannot reach live money or numbers. Verify no secret is bundled into client JavaScript.
- [ ] **Launch verification:** generate and commit `package-lock.json`, use `npm ci`, run `npm run typecheck` and `npm run build`, perform provider sandbox end-to-end checkout/provisioning/inbox/cancellation/support verification, inspect mobile/accessibility and error states, then obtain owner sign-off before enabling customer features or announcing availability.

## Decisions and access required to continue

The repository does not currently specify the legal business country; authentication/database providers; payment processor; support destination; business identity/contact; permitted use cases; or approved policies. The owner reports the GrizzlySMS API key is configured as a sensitive Preview variable on `relaysmsnumber-7hcq`, while this workspace is linked to `relaysmsnumber`. The key value was not inspected, and no live catalog request has been made. Decide which Vercel project is canonical for the preview before requesting or verifying live data. Also provide the target domain, refund and expiry/non-delivery policy, rental renewal/cancellation terms, SMS content retention limit, and policy approver. We can continue provider-neutral work until these are decided, but cannot honestly mark the service live.

## Deployment

The app uses the standard Next.js Node.js server output. Build with `npm run build`, then run `npm run start` on the configured host. A managed Next.js platform is also suitable. Configure `NEXT_PUBLIC_SITE_URL`, all required server-side environment variables, HTTPS, provider webhooks, and authentication/payment redirect URLs in the host dashboard. Static export is not suitable for the server-side API boundaries.
