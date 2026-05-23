type Metrics = {
  uptimeSeconds: number;
  requestCount: number;
  errorCount: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
};

const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;

export function recordRequest() {
  requestCount += 1;
}

export function recordError() {
  errorCount += 1;
}

export function getMetrics(): Metrics {
  const mem = process.memoryUsage() as NodeJS.MemoryUsage;
  return {
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    requestCount,
    errorCount,
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external ?? 0,
    },
  };
}

const observability = {
  recordRequest,
  recordError,
  getMetrics,
};

export default observability;
