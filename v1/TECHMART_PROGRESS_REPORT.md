# TechMart — Progress Report

**Institution:** Tribhuvan University — Faculty of Humanities and Social Sciences

**Report:** PROGRESS REPORT ON TECHMART — TECHNOLOGY ECOMMERCE PLATFORM

**Submitted to:** Department of Computer Application, Prithvi Narayan Campus

**Submitted by:** Sumit Chhetri (4802087), Bishal Subedi (4802065), Sudarshan Baral (4802083)

**Supervisor:** Gyaneshwor Dhungana

**Year:** 2026

---

## Table of Contents
- Executive Summary
- Project Health Snapshot
- UI/UX & Frontend Progress
- Backend & Database Progress
- Auction System (Primary Focus)
- Prioritised Next Steps
- Technologies Used
- SDLC Methodology
- Future Work
- Conclusion
- References

---

## Executive Summary

This document summarises current development progress for TechMart, a B2C ecommerce platform focused on technology products and live auctions. Planning, analysis, and architecture phases are complete. Active implementation is underway: frontend UI/UX (~50–60%), backend services and DB (~40–45%), and the Auction System is the primary active development area.

## Project Health Snapshot

- Planning & Analysis: 100% — Completed
- UI/UX Design & Frontend: 60% — In Progress
- Backend Development: 40% — In Progress
- Database Implementation: 45% — In Progress
- Auction System: 70% — In Progress
- Loyalty Points: 40% — In Progress
- Shopping Cart: 70% — In Progress
- Checkout Flow: 0% — Pending
- Testing & QA: 0% — Pending
- Deployment & DevOps: 0% — Pending

## UI/UX Design & Frontend (Summary)

- Design System (colours, fonts, components): 60% — In Progress
- Homepage & Navigation: 70% — In Progress
- Product Listing & Detail: 50% — In Progress
- Search Results Page: 20% — In Progress
- User Account & Profile: 80% — In Progress
- Auction Listing Page: 70% — In Progress
- Store Locator Page: 90% — In Progress
- Admin Layout: 60% — In Progress

## Backend & Database (Summary)

- Project scaffolding: 100% — Completed
- PostgreSQL schema: 80% — In Progress
- Vercel & GitHub setup: 70% — In Progress
- User Auth: 85% — In Progress
- Payment integration (eSewa / Khalti): 30% — In Progress
- Order management API: 35% — In Progress
- Notification service (email + SMS): 25% — In Progress
- Search: 20% — In Progress
- Admin API: 45% — In Progress
- Loyalty & Trade-in API: 15% — In Progress

## Auction System — Primary Focus

The auction subsystem includes real-time WebSocket updates, auto-bid support, reserve-price handling and an admin control UI.

- Auction DB schema: 100% — Completed
- Auction REST API (create/list/detail): 90% — Completed
- WebSocket server: 85% — In Progress
- Reserve price logic: 80% — In Progress
- Auction admin UI: 70% — In Progress
- Buy It Now / Instant purchase: 55–75% — In Progress
- Auction listing & detail pages: 90% — Completed
- Outbid notifications: 55% — In Progress
- Auction winner checkout flow: 30% — In Progress
- E2E & concurrency testing for auctions: 0% — Pending

## Prioritised Next Steps

Critical
- Complete checkout flow & payment integration (eSewa, Khalti)
- Finalise live bid sync and WebSocket reliability
- Implement auction-winner checkout and notification emails

High
- Finish Product Detail Page UI
- Complete Admin Panels
- Store Locator map embedding and store pages
- Federated search improvements

Medium
- User account pages completion
- Notification service (email/SMS) completion
- Loyalty points system
- Stress and load testing

Low
- Unit test coverage and CI polishing

## Technologies Used

- Frontend: Next.js (App Router), React, Tailwind, Zustand, Socket.io client
- Backend: Node.js + Express, Socket.io, optional BullMQ, Sharp + Multer (uploads)
- Data & infra: PostgreSQL, Redis, Elasticsearch (planned), AWS S3 (object storage), Docker Compose for local integration
- Payments: eSewa, Khalti (local gateways)
- DevOps: GitHub Actions, Cloudflare
- Testing: Playwright (E2E), Postman

## SDLC Methodology

Agile Scrum with 2-week sprints. Phases: Planning & Discovery → Requirements & Design → Foundation & Core Build → Advanced Features → Testing & Hardening → Deployment & Launch.

## Future Work

- Finalise frontend UI and product catalogue
- Complete authentication APIs and shopping cart/checkout flows
- Integrate payment gateways and finalize tax/shipping logic
- Harden auction engine and add concurrency/E2E tests
- Deploy staging environment and perform UAT

## Conclusion

Core design and architecture are established. Implementation focus now shifts to frontend completeness, checkout/payment integration, and real-time auction reliability. Local integration tooling (Postgres/Redis/worker/socket) and E2E tests have been added to support repeatable validation.

## References

- Next.js, React, Node.js, PostgreSQL, Redis, Socket.io, Prisma, Docker documentation

---

If you want this saved back into `PR_BODY.md` instead, or exported to PDF, tell me and I will update accordingly.
