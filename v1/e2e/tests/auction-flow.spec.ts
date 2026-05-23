import { test, expect } from '@playwright/test';

test('auction bid flow end-to-end', async ({ page }) => {
  const auctionId = 'sony-a7iv-body';
  const auctionUrl = `/auctions/${auctionId}`;
  test.setTimeout(60_000);
  const base = process.env.BASE_URL || 'http://localhost:3000';
  await fetch(`${base}/api/v1/test/reset-auctions`, { method: 'POST' });
  await page.goto(auctionUrl);

  await expect(page.getByRole('heading', { name: 'Sony A7 IV Body' })).toBeVisible();

  await page.getByRole('button', { name: 'Min Auto-Fill' }).click();
  const bidAmount = await page.getByRole('spinbutton').inputValue();

  await page.getByRole('button', { name: 'Transmit Sealed Bid' }).click();

  await expect(page.getByText(/Bid successfully locked/i)).toBeVisible({ timeout: 10_000 });
  const formatted = `Rs. ${Number(bidAmount).toLocaleString()}`;
  await expect(page.locator('span.text-2xl').filter({ hasText: formatted })).toBeVisible();
});
