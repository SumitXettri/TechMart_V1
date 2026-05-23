export type AuctionSocket = {
  sendBid: (auctionId: string, amount: number, by?: string) => void;
  onNewBid: (cb: (data: unknown) => void) => void;
  joinRoom: (room: string) => void;
  disconnect: () => void;
};

export async function connectAuctionSocket(url = 'http://localhost:4000'): Promise<AuctionSocket | null> {
  if (typeof window === 'undefined') return null;

  // Try dynamic import of socket.io-client first (preferred)
  try {
    const mod = await import('socket.io-client');
    const candidate = mod as unknown as Record<string, unknown>;
    const possible = candidate.io ?? candidate.default ?? candidate;
    if (typeof possible === 'function') {
      const ioFactory = possible as unknown as (url: string, opts?: Record<string, unknown>) => unknown;
      const socket = ioFactory(url, { transports: ['websocket'], autoConnect: true });
      const s = socket as unknown as { emit?: (ev: string, payload?: unknown) => void; on?: (ev: string, cb?: (...args: unknown[]) => void) => void; disconnect?: () => void };
      return {
        sendBid(auctionId: string, amount: number, by = 'anon') {
          try { s.emit?.('placeBid', { auctionId, amount, by }); } catch {}
        },
        onNewBid(cb: (data: unknown) => void) {
          try { s.on?.('newBid', cb); } catch {}
        },
        joinRoom(room: string) {
          try { s.emit?.('joinAuction', room); } catch {}
        },
        disconnect() {
          try { s.disconnect?.(); } catch {}
        },
      } as AuctionSocket;
    }
  } catch {
    // fallthrough to global or websocket fallback
  }

  // Prefer a globally injected socket.io client (`window.io`) if present (dev-only)
  const globalIo = (window as unknown as Record<string, unknown>).io as unknown;
  if (globalIo && typeof globalIo === 'function') {
    try {
      const ioFactory = globalIo as unknown as (url: string, opts?: Record<string, unknown>) => unknown;
      const socket = ioFactory(url, { transports: ['websocket'], autoConnect: true });
      const s = socket as unknown as { emit?: (...args: unknown[]) => void; on?: (...args: unknown[]) => void; disconnect?: () => void };
      return {
        sendBid(auctionId: string, amount: number, by = 'anon') {
          try { s.emit?.('placeBid', { auctionId, amount, by }); } catch {}
        },
        onNewBid(cb) {
          try { s.on?.('newBid', cb); } catch {}
        },
        joinRoom(room: string) {
          try { s.emit?.('joinAuction', room); } catch {}
        },
        disconnect() {
          try { s.disconnect?.(); } catch {}
        },
      } as AuctionSocket;
    } catch {
      // fallthrough to native ws
    }
  }

  // Fallback to native WebSocket
  try {
    const ws = new WebSocket(url.replace(/^http/, 'ws'));
    const listeners: ((d: unknown) => void)[] = [];

    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        listeners.forEach((l) => l(data));
      } catch {}
    });

    return {
      sendBid(auctionId: string, amount: number, by = 'anon') {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'placeBid', auctionId, amount, by }));
      },
      onNewBid(cb) {
        listeners.push(cb);
      },
      joinRoom(room: string) {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'joinAuction', room }));
      },
      disconnect() {
        try { ws.close(); } catch {}
      },
    };
  } catch {
    return null;
  }
}
