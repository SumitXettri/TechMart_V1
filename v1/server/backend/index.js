const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Attempt to load Prisma client; fallback to in-memory sample data
const prisma = require('./prisma-client');

const auth = require('./middleware/auth');

const sampleAuctions = [
  { id: 1, title: 'Gaming Laptop', currentBid: 450, endsAt: Date.now() + 3600_000 },
  { id: 2, title: 'Wireless Headphones', currentBid: 80, endsAt: Date.now() + 7200_000 }
];

app.get('/api/auctions', async (req, res) => {
  if (prisma) {
    try {
      const auctions = await prisma.auction.findMany({ take: 50 });
      return res.json(auctions);
    } catch (err) {
      console.error('Prisma error', err);
      return res.status(500).json({ error: 'db error' });
    }
  }
  return res.json(sampleAuctions);
});

app.get('/api/auctions/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (prisma) {
    try {
      const a = await prisma.auction.findUnique({ where: { id } });
      if (!a) return res.status(404).json({ error: 'not found' });
      return res.json(a);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db error' });
    }
  }
  const a = sampleAuctions.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: 'not found' });
  res.json(a);
});

app.post('/api/auctions/:id/bid', auth, async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body;
  if (prisma) {
    try {
      const auction = await prisma.auction.findUnique({ where: { id } });
      if (!auction) return res.status(404).json({ error: 'auction not found' });
      const current = Number(auction.currentHighestBid || 0);
      if (typeof amount !== 'number' || amount <= current) {
        return res.status(400).json({ error: 'bid must be higher than current bid' });
      }
      const updated = await prisma.auction.update({ where: { id }, data: { currentHighestBid: amount, totalBids: (auction.totalBids || 0) + 1 } });
      return res.json({ success: true, auction: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db error' });
    }
  }
  const auction = sampleAuctions.find(x => x.id === id);
  if (!auction) return res.status(404).json({ error: 'auction not found' });
  if (typeof amount !== 'number' || amount <= auction.currentBid) {
    return res.status(400).json({ error: 'bid must be higher than current bid' });
  }
  auction.currentBid = amount;
  return res.json({ success: true, auction });
});

// Test helper: reset auctions (useful for deterministic E2E runs)
// Protected to avoid accidental resets in shared environments
app.post('/api/test/reset-auctions', auth, async (req, res) => {
  if (prisma) {
    try {
      const now = new Date();
      const newEnd = new Date(now.getTime() + 3600_000);
      await prisma.auction.updateMany({ data: { currentHighestBid: 0, totalBids: 0, status: 'live', winnerAnonymized: null, endTime: newEnd } });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db error' });
    }
  }
  // reset sample
  sampleAuctions.forEach((a, i) => {
    a.currentBid = 0;
    a.endsAt = Date.now() + 3600_000;
  });
  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`TechMart backend running on http://localhost:${PORT}`);
});
