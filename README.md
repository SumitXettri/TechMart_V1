This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Setup

1. Create a Supabase project at https://app.supabase.com.
2. In Supabase, go to Settings → API and copy the `URL` and `anon public` key.
3. Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

4. Apply the database schema in `supabase/schema.sql` using the Supabase SQL editor or `supabase db push`.
5. Use `lib/supabaseClient.ts` in your app to query Supabase from the frontend.

## Payment Integration Setup

This project includes a payment-ready checkout flow for eSewa, Khalti, and a manual demo mode.

1. Copy `.env.example` to `.env.local` and fill in your real provider credentials.
2. The checkout route is available at `/checkout`.
3. Payment requests are handled through:
   - `app/api/payments/checkout/route.ts`
   - `app/api/payments/verify/route.ts`
   - `lib/payments.ts`
4. Update the gateway-specific payloads with your live merchant keys and callback URLs before production use.
5. For sandbox testing, the manual mode works without credentials and redirects to the success page.

## Recent Development

- Added a responsive admin login experience with protected admin route-group handling. Unauthenticated users are redirected to `/admin/login`, while the login page remains public.
- Added shared admin navigation for the dashboard, users, and product management pages.
- Added product catalog search, category filtering, maximum-price filtering, product detail pages, and variant/property selection with stock-aware pricing.
- Added checkout shipping details including address, city, district, and postal code.
- Added delivery tracking with shipment statuses, carriers, tracking numbers, estimated delivery dates, locations, and delivery event history.
- Added admin delivery operations reporting with shipment status counts and recent tracking records.
- Added monthly and annual admin activity reports covering products, users, orders, and auctions.
- Added the admin delivery API at `/api/admin/deliveries` for creating shipments and updating shipment status.

### Delivery Database Setup

Apply the latest `supabase/schema.sql` to create the `delivery_shipments` and `delivery_events` tables. The admin delivery API requires an authenticated admin session and the server Supabase credentials.
