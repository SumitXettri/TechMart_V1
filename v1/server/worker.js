/* eslint-disable */
// Dev worker scaffold for processing bid jobs using BullMQ.
// Install with: npm install bullmq ioredis
// Run with: npm run worker:dev
try {
  if (!process.env.REDIS_URL) {
    console.log('Bid worker running in local fallback mode');
    setInterval(() => undefined, 60_000);
  } else {
    const { Worker, Queue } = require('bullmq');
    const IORedis = require('ioredis');
    const { placeLiveBid } = require('../lib/auctions');
    const prisma = require('../lib/db').default;

    const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    const queueName = 'bidQueue';

    const bidQueue = new Queue(queueName, { connection });

    const worker = new Worker(
      queueName,
      async (job) => {
        const { auctionId, amount, userId } = job.data;
        console.log('Processing bid job', job.id, auctionId, amount, userId);

        try {
          // Try DB atomic update
          const aid = Number(auctionId);
          const updated = await prisma.auction.updateMany({
            where: { id: aid, currentHighestBid: { lt: amount } },
            data: { currentHighestBid: amount, totalBids: { increment: 1 }, version: { increment: 1 } },
          });

          if (updated.count === 0) {
            // fallback to in-memory updater
            placeLiveBid(auctionId, amount, 0);
          }

          // Broadcast via socket.io if available (dev helper)
          try {
            const io = require('socket.io-client')('http://localhost:' + (process.env.SOCKET_PORT || 4000));
            io.emit('newBid', { auctionId, amount, by: userId });
            io.close();
          } catch {}

          return { ok: true };
        } catch (err) {
          console.error('Worker job error', err);
          throw err;
        }
      },
      { connection }
    );

    worker.on('completed', (job) => console.log('Completed job', job.id));
    worker.on('failed', (job, err) => console.error('Failed job', job?.id, err));

    console.log('Bid worker running');
  }
} catch (err) {
  console.error('BullMQ worker scaffold requires optional deps.');
  console.error('Install with: npm install bullmq ioredis');
}
