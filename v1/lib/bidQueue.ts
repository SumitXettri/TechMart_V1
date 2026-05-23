/* eslint-disable @typescript-eslint/no-explicit-any */

export type BidJob = {
  auctionId: string;
  amount: number;
  userId?: string;
};

// enqueueBid tries to use BullMQ at runtime; if unavailable it falls back to an in-memory queue.
export async function enqueueBid(job: BidJob): Promise<void> {
  try {
    const mod = await import('bullmq');
    const { Queue } = mod as any;
    const connectionOpt = process.env.REDIS_URL ? { connection: { url: process.env.REDIS_URL } } : {};
    const q = new (Queue as any)('bidQueue', connectionOpt as any);
    // job name and options are simple for dev
    await q.add('bid', job as any, { removeOnComplete: true, removeOnFail: 100 });
    return;
  } catch {
    // fallback: simple in-process queue
    const globalAny = global as any;
    globalAny.__inMemoryBidQueue = globalAny.__inMemoryBidQueue || [];
    globalAny.__inMemoryBidQueue.push(job);
    // process asynchronously
    setTimeout(() => {
      import('./auctions').then(({ placeLiveBid }) => {
        try {
          while (globalAny.__inMemoryBidQueue.length) {
            const j = globalAny.__inMemoryBidQueue.shift();
            placeLiveBid(j.auctionId, j.amount, 0);
          }
        } catch {}
      }).catch(() => undefined);
    }, 10);
    return;
  }
}
