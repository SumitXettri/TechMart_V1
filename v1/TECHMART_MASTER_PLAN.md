# TechMart Master Plan

## Overview
TechMart is a B2C tech ecommerce platform focused on technology products only. The scope includes customer shopping, live auctions, store services, loyalty, trade-ins, notifications, and an admin dashboard.

## Project Plans

### 1. Product Scope
- Build a customer-facing ecommerce web app.
- Support categories like smartphones, laptops, audio, gaming, networking, TV, cameras, and accessories.
- Support fixed-price sales and live auction purchases.
- Support physical store features such as store locator, click and collect, and repair bookings.
- Support loyalty points, referrals, wishlists, reviews, and trade-ins.

### 2. Technology Plan
- Use Next.js for the frontend.
- Use React for UI components.
- Use Node.js and Express for backend APIs.
- Use PostgreSQL for transactional data.
- Use Redis for caching, sessions, queueing, and auction support.
- Use Socket.io for live auction updates.
- Use Prisma as the ORM.
- Use Elasticsearch or OpenSearch for search.
- Use Docker, GitHub Actions, Sentry, and monitoring tools for delivery and operations.

### 3. Delivery Plan
- Follow Agile Scrum with 2-week sprints.
- Complete planning and discovery first.
- Finalize requirements, design, and architecture next.
- Build core ecommerce features before advanced modules.
- Add auction, store, loyalty, and trade-in features afterward.
- Finish with testing, hardening, staging, and production launch.

## Task List

### Phase 1: Planning and Discovery
- [ ] Confirm project charter and success metrics.
- [ ] Identify stakeholders and responsibilities.
- [ ] Gather user research and competitor analysis.
- [ ] Define personas and MoSCoW priorities.
- [ ] Create risk register and initial timeline.
- [ ] Set up repo, Jira/Linear, Slack, and Figma.

### Phase 2: Requirements and Design
- [ ] Finalize the SRS document.
- [ ] Design sitemap and information architecture.
- [ ] Create wireframes for all major pages.
- [ ] Build the design system in Figma.
- [ ] Produce interactive prototypes for key journeys.
- [ ] Finalize the database ERD.
- [ ] Write the OpenAPI specification.
- [ ] Create data flow diagrams for checkout and auctions.

### Phase 3: Foundation and Core Build
- [ ] Set up project scaffolding and environment configuration.
- [ ] Build CI/CD pipeline and Docker setup.
- [ ] Implement authentication, login, registration, and 2FA.
- [ ] Build profile and address management.
- [ ] Implement product catalogue and category browsing.
- [ ] Build admin product CRUD and bulk import.
- [ ] Implement cart and checkout flow.
- [ ] Integrate payment methods and order confirmation.
- [ ] Build order management and review features.
- [ ] Add wishlist, compare, and basic email notifications.

### Database migration notes
- A Postgres-ready Prisma schema is available at `prisma/schema.postgres.prisma`.
- See `docs/PRISMA_POSTGRES_MIGRATION.md` for step-by-step migration instructions from the local SQLite dev DB to Postgres.

### Phase 4: Advanced Features
- [ ] Add search with autocomplete and filtering.
- [ ] Implement voice search.
- [ ] Build auction listing, detail, and bidding system.
- [ ] Add auto-bid, sniping guard, and buy-it-now.
- [ ] Implement auction notifications.
- [ ] Add store locator and store pickup flow.
- [ ] Build loyalty points engine.
- [ ] Implement referral program.
- [ ] Add trade-in submission and admin valuation flow.
- [ ] Add promo code and extended warranty support.

### Phase 5: Testing and Hardening
- [ ] Write unit tests for core logic.
- [ ] Add API integration tests.
- [ ] Add end-to-end tests for critical journeys.
- [ ] Run performance testing and fix bottlenecks.
- [ ] Run security testing and remediate issues.
- [ ] Validate accessibility against WCAG 2.1 AA.
- [ ] Review and improve UX before release.

### Phase 6: Deployment and Launch
- [ ] Prepare production infrastructure.
- [ ] Configure DNS, SSL, monitoring, and alerting.
- [ ] Load initial product and store data.
- [ ] Run UAT with stakeholders and beta users.
- [ ] Fix launch blockers and sign off release.
- [ ] Perform soft launch and post-launch monitoring.

## Immediate Build Backlog
1. Confirm the landing page and navigation structure.
2. Scaffold authentication pages and API routes.
3. Scaffold catalogue pages and product data models.
4. Define cart, checkout, and order data flow.
5. Scaffold auction room UI and websocket events.
6. Create admin dashboard layout and role-based access.
7. Set up testing and linting standards.

## Implementation Status (concise)

- **Workspace root:** `v1/` — Next.js (App Router) TypeScript project with Tailwind.
- **Dev server:** `npm run dev` from `v1/` (Next.js running on :3000 during development).

### Done — UI scaffolds & routes
- Home / shell: `app/page.tsx`, `app/_components/route-shell.tsx`
- Authentication UI: `app/auth/login/page.tsx`, `app/auth/register/page.tsx`
- Account & profile: `app/account/page.tsx`, `app/api/v1/account/route.ts`
- Products: `app/products`, `lib/catalog.ts` (list + detail pages)
- Cart & Checkout: `app/cart/page.tsx`, `app/checkout/page.tsx`, `lib/cart.ts`
- Orders: `app/orders`, `app/orders/[id]`, `lib/orders.ts`, `app/api/v1/orders`
- Auctions: `app/auctions`, `app/auctions/[id]`, `lib/auctions.ts`, `app/api/v1/auctions`
- Admin dashboard: `app/admin/page.tsx`, `lib/admin.ts`, `app/api/v1/admin/*`

### Done — API stubs
- Health check: `app/api/v1/health/route.ts`
- Auth: `app/api/v1/auth/*` (login, register, me, verify-2fa)
- Catalog / products: admin product read/create/update/delete stubs at `app/api/v1/admin/products`
- Cart/Checkout: `app/api/v1/cart`, `app/api/v1/checkout`
- Auctions: `app/api/v1/auctions` and bid endpoint `app/api/v1/auctions/[id]/bid`

### Done — Developer tooling
- ESLint configured; `npm run lint` used regularly and currently passes on the workspace.
- Testing: `vitest` configured with a sample test. `npm test` runs the suite (`vitest run`).
- CI: GitHub Actions workflow at `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, and `npm test` on push/PR.

## Notes on current mock/data strategy
- Mock data lives in `lib/` (catalog.ts, cart.ts, customer.ts, auctions.ts, admin.ts, orders.ts).
- Pages consume `lib/*` directly; API routes mirror that shape and return the same mock payloads.
- This keeps interfaces stable while backend wiring (Prisma/Postgres, Redis, Socket.io) is planned.

## Remaining high-priority work (next sprint)
1. Replace `lib/*` mocks with API-backed sources (Prisma + Postgres) and protect APIs by auth.
2. Implement real authentication/session (JWT or cookie sessions, 2FA optional).
3. Real-time auction engine (Socket.io + Redis pub/sub) and auction persistence.
4. Search indexing (OpenSearch/Elasticsearch) and autocomplete endpoints.
5. Payments integration (gateway stubs → live providers) and order lifecycle wiring.

## Short-term next actions taken now
- Documented implementation status (this file).
- Scaffolding notifications micro-surface and API (see new files under `lib/notifications.ts`, `app/notifications`, `app/api/v1/notifications`).

## How to continue
- I will continue implementing the notifications surface and add observability scaffolding (logs/metrics endpoints, Sentry integration notes) next. After that I will pick the top-priority backend wiring (auth → data).

---
This document is the working state of the project; move items into sprint tickets after prioritization.

## Notes
- This document is a working backlog extracted from the master requirements.
- Items can be moved into sprint tickets after prioritization.

## Completion Notes (updated May 22, 2026)

- Implemented observability middleware and metrics endpoint: see `app/api/v1/metrics` and `middleware.ts`.
- Added server-side JWT helpers and protected admin API routes: see `lib/serverAuth.ts` and `app/api/v1/admin/*`.
- Hardened auction bid flow: atomic DB update in `app/api/v1/auctions/[id]/bid/route.ts` with optimistic version checks and in-memory fallback.
- Replaced read APIs for products and auctions to prefer Prisma-backed queries with safe mock fallbacks: `app/api/v1/admin/products/route.ts`, `app/api/v1/auctions`.
- Added real-time dev scaffolds: `server/socket-server.js` and `lib/socketClient.ts` (dev-only, requires `socket.io`).
- Added background job scaffolds: `lib/bidQueue.ts` and `server/worker.js` (BullMQ + Redis dev scaffolds) and `docs/BULLMQ_SETUP.md`.
- Prepared Postgres migration artifacts: `prisma/schema.postgres.prisma` and `docs/PRISMA_POSTGRES_MIGRATION.md`.
- Integrated Sentry initializer and docs: `lib/sentry.ts` and `docs/SENTRY_INTEGRATION.md` (wired into `middleware.ts`).

### How to run dev extras

- Dev socket server (optional):

```bash
npm install socket.io ioredis --save-dev
npm run socket:dev
```

- Dev worker (optional, requires Redis):

```bash
npm install bullmq ioredis socket.io-client --save-dev
docker run --name techmart-redis -p 6379:6379 -d redis:7
npm run worker:dev
```

### Recommended next priorities

- Seed an admin user and enable RBAC enforcement across admin APIs in the DB-backed flows.
- Move from SQLite dev DB to Postgres for production; follow `docs/PRISMA_POSTGRES_MIGRATION.md`.
- Replace in-memory auction runtime with persistent auction rows and enable Redis pub/sub for cross-instance notifications.
- Harden auth (refresh tokens, CSRF protection) and add integration tests for critical flows (checkout, auctions).

If you want, I can now:
- Wire `enqueueBid()` into frontend bid flows for optimistic UX + background processing.
- Add seed scripts to create an admin user and sample products/auctions.
- Start wiring Redis pub/sub and wire the socket server to broadcast worker events.

