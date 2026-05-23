# Sentry Integration Notes

To enable Sentry error monitoring in TechMart, set the `SENTRY_DSN` environment variable and install the Sentry SDK.

Server-side

1. Install the SDK:

```bash
npm install @sentry/node @sentry/integrations
```

2. Set `SENTRY_DSN` in your environment (CI/staging/production).

3. The code includes a lightweight initializer at `lib/sentry.ts`. Call `initSentry()` during server startup (for example in a custom server or middleware) and use `captureException(err)` to report caught errors.

Client-side

- For client/browser errors, consider adding `@sentry/react` and initializing it from a client entrypoint.
- Do NOT commit DSN to source. Use environment variables or secret management.

Example server call in Node entrypoint:

```js
import { initSentry } from './lib/sentry';
initSentry();
```

If you want, I can wire `initSentry()` into `middleware.ts` so it's initialized on server requests.
Sentry integration — notes

Purpose
- Provide a guide to integrate Sentry for error reporting and performance monitoring in the TechMart app.

Quick steps
1. Create a Sentry project and obtain a DSN.
2. Add `SENTRY_DSN` to environment variables (server-side only).
3. Install `@sentry/nextjs` and follow the official setup docs.

Example (server-side init)
```js
// in sentry.server.config.js or a server entry point
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // adjust for production
})
```

Notes
- Keep DSN out of client-side bundles — configure Next.js to only expose a public DSN if needed.
- Add source maps upload during CI (Sentry CLI or GitHub Action).
- Use `Sentry.captureException(err)` in catch blocks or middleware.
