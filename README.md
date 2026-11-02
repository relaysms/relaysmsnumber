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

`.env.example` documents every current setting, its purpose, whether it is secret, and where it should be set. Copy it to `.env.local` for local development. For deployment, set values in the hosting provider's encrypted project/environment settings (for example, separate Preview/Staging and Production scopes). Do not commit `.env.local` or paste credentials into source control. No adapter currently reads these placeholders; adding values does not turn on an integration.

| Variables | Belongs to / where to get it | Secret? |
| --- | --- | --- |
| `APP_ENV` | Deployment environment label set in app host | No |
| `NEXT_PUBLIC_SITE_URL` | Canonical site domain configured in app host | No; browser-visible |
| `AUTH_PROVIDER` | Selected auth adapter name | No |
| `AUTH_SECRET` | Auth adapter/server session configuration; generate or retrieve from auth provider | **Yes** |
| `DATABASE_URL` | Connection string from selected database provider | **Yes** |
| `NUMBER_PROVIDER` | Selected number/SMS supplier adapter name | No |
| `NUMBER_PROVIDER_API_KEY` | Supplier console API credential | **Yes** |
| `NUMBER_PROVIDER_WEBHOOK_SECRET` | Supplier signing secret configured for SMS webhook endpoint | **Yes** |
| `PAYMENT_PROVIDER` | Selected payment processor adapter name | No |
| `PAYMENT_SECRET_KEY` | Payment processor server API credential | **Yes** |
| `PAYMENT_WEBHOOK_SECRET` | Payment processor webhook signing secret | **Yes** |
| `SUPPORT_PROVIDER` | Selected support system adapter name | No |
| `SUPPORT_PROVIDER_API_KEY` | Support system credential | **Yes** |
| `REFUND_POLICY_URL`, `CANCELLATION_POLICY_URL`, `PRIVACY_POLICY_URL`, `TERMS_POLICY_URL` | Owner/counsel-approved policy page URLs set in app host | No |

Secrets must remain server-side. Never prefix a credential with `NEXT_PUBLIC_`. A provider account, an adapter implementation, verified webhooks, and deployment configuration are all required; environment values alone are not a connection.

## Current integration state

The application is not ready to accept real customers. It contains the customer-facing routes, responsive layouts, accessible forms, FAQ, catalog search UI, and server-side API boundaries. The site banner says preview mode; catalog, checkout, auth, SMS/payment webhooks, and support return explicit unavailable responses. No number, price, reservation, message, payment, receipt, account, or support ticket is fabricated. Login and sign-up do not collect credentials. The dashboard contains no customer data and is not protected until authentication is implemented. This deployment must not be advertised as a live service.

The support endpoint validates request fields but does not create or forward a ticket. Provider integration, persistent rate limiting, CSRF/origin controls as applicable, webhook signature verification, idempotency, authorization, data retention, and abuse controls must be implemented before public launch. These require chosen providers, policies, and infrastructure. The current API stubs are not a production security layer.

## Launch progress snapshot

- **Repository work present:** Next.js routes and UI, server-side unavailable stubs, preview-only messaging, editable legal placeholders, and documented configuration/checklist. These files are currently untracked and have not been committed.
- **Verified in Vercel preview:** Nothing. There is no linked Vercel project or deployment URL for this checkout.
- **Provider accounts/configuration needed:** number/SMS supplier, authentication and database, payment processor, support destination, plus Vercel project access. Keep credentials in secure provider/host settings, not chat or source control.
- **Business/legal decisions needed:** legal business country and operating countries; company identity/contact; permitted use cases; refund and expiry/non-delivery rules; rental renewal/cancellation terms; SMS content retention; owner/counsel-approved Terms, Privacy, and Acceptable Use.

## Launch readiness gate

Do not enable customer acquisition, number assignment, or payment until every item below is verified. Keep the public site in preview mode while any required item is incomplete.

- [ ] **Business and geography:** record the legal business country, business identity/contact, applicable jurisdictions, initial customer countries, and permitted use cases. Do not derive these from device locale.
- [ ] **Number/SMS supplier:** create the business account, confirm intended countries and use cases are allowed, agree supplier terms, and implement/verify live inventory, price, provisioning, inbound SMS delivery, webhook signature validation, replay protection, and safe failure handling.
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

The repository does not currently specify the business country or operating countries; supplier; auth/database providers; payment processor; support destination; or approved policies. Provide those decisions and provider sandbox access (or invite credentials through the providers' secure configuration workflow, not chat). Also provide the public business identity/contact details, target domain/hosting choice, permitted use cases, refund and non-delivery policy, rental renewal/cancellation terms, SMS retention limit, and policy approver. We can complete provider-neutral implementation work until then, but cannot honestly mark the service live.

## Deployment

The app uses the standard Next.js Node.js server output. Build with `npm run build`, then run `npm run start` on the configured host. A managed Next.js platform is also suitable. Configure `NEXT_PUBLIC_SITE_URL`, all required server-side environment variables, HTTPS, provider webhooks, and authentication/payment redirect URLs in the host dashboard. Static export is not suitable for the server-side API boundaries.
