# BullMQ + Redis Worker Setup (Dev)

This project includes a dev scaffold for processing bid jobs using BullMQ and Redis.

Install deps:

```bash
npm install bullmq ioredis socket.io-client
```

Start Redis (example using Docker):

```bash
docker run --name techmart-redis -p 6379:6379 -d redis:7
```

Run worker:

```bash
npm run worker:dev
```

How it works
- `server/worker.js` starts a `Worker` that consumes jobs from queue `bidQueue` and attempts a DB atomic update.
- `lib/bidQueue.ts` provides `enqueueBid(job)` which pushes jobs to BullMQ (if installed) or an in-memory queue.
- The worker also broadcasts `newBid` events to the dev socket server when available.

If you want, I can wire `enqueueBid` into the auction bid API so bids enqueue background jobs automatically.
