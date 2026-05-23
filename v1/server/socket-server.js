#!/usr/bin/env node
/* eslint-disable */
/*
  Dev-only socket server scaffold.
  Install optional deps to enable: `npm install socket.io ioredis`
  Run with: `npm run socket:dev`
*/
try {
  const { createServer } = require('http');
  const { Server } = require('socket.io');

  const port = process.env.SOCKET_PORT || 4000;
  const httpServer = createServer();
  const io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinAuction', (room) => {
      socket.join(room);
      socket.emit('joined', { room });
    });

    socket.on('placeBid', (payload) => {
      // echo as placeholder — production should validate and broadcast via Redis/Bull
      io.to(payload.auctionId).emit('newBid', { auctionId: payload.auctionId, amount: payload.amount, by: payload.by });
    });

    // Allow external clients (worker processes) to emit `newBid` events which we rebroadcast to rooms.
    socket.on('newBid', (payload) => {
      try {
        if (payload && payload.auctionId) {
          io.to(payload.auctionId).emit('newBid', payload);
        }
      } catch (err) {
        // noop
      }
    });

    socket.on('disconnect', () => {
      // noop
    });
  });

  httpServer.listen(port, () => console.log(`Dev socket server listening on :${port}`));
} catch {
  console.error('Socket scaffold requires optional dependencies.');
  console.error('To enable the dev socket server run:');
  console.error('  npm install socket.io ioredis --save-dev');
  console.error('Then run: npm run socket:dev');
}
