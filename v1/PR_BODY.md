Chore: complete local integration, seed, socket, worker, E2E and tests

Summary
-------

This branch adds a local integration stack and end-to-end tests for the auction flow.

Key changes
- Database: Prisma schema pushed and seeded (`prisma/seed.mjs`).
- Background worker: `server/worker.js` with Redis/Bull fallback.
- Socket server: `server/socket-server.js` for dev realtime updates.
- Queue: `lib/bidQueue.ts` with BullMQ optional import and in-process fallback.
- Live auctions: `lib/auctions.ts` + `/api/v1/test/reset-auctions` for deterministic E2E runs.
- E2E: Playwright test `e2e/tests/auction-flow.spec.ts` validating optimistic bids and finalization.
- CI: workflow added to bring up Postgres/Redis and run Playwright tests.

How to run locally
-------------------

1. Install deps: `npm install`
2. Push Prisma schema & seed: `npx prisma db push --accept-data-loss && npm run seed`
3. Start dev server: `npm run dev`
4. Start socket server: `npm run socket:dev`
5. Start worker (or rely on in-process fallback): `npm run worker:dev`
6. Run E2E: `npx playwright test --project=chromium`

Notes
-----
- Optional dependencies (BullMQ, Redis, Sentry) are guarded; the app falls back to in-process services when unavailable for local dev.
- Docker Compose is included for running Postgres+Redis+worker locally via Docker; CI uses this compose file to run integration tests.

Tests added
- Unit tests for admin endpoints
- Playwright E2E for auction bid flow

If you want any edits to the PR title/body or reviewers, tell me and I will update the PR.
