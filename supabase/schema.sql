-- Supabase / PostgreSQL schema based on your Prisma data model

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('CUSTOMER', 'ADMIN', 'SUPPORT');
create type auction_status as enum ('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');
create type order_status as enum ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
create type payment_provider as enum ('ESEWA', 'KHALTI');
create type payment_status as enum ('INITIATED', 'VERIFIED', 'FAILED');

-- Users and auth
create table users (
  id text primary key default gen_random_uuid(),
  email text not null unique,
  phone text unique,
  password_hash text not null,
  full_name text not null,
  role user_role not null default 'CUSTOMER',
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on users(email);

create table refresh_tokens (
  id text primary key default gen_random_uuid(),
  user_id text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by text,
  created_at timestamptz not null default now(),
  constraint fk_refresh_tokens_user foreign key (user_id) references users(id) on delete cascade
);
create index on refresh_tokens(user_id);

create table addresses (
  id text primary key default gen_random_uuid(),
  user_id text not null,
  label text not null,
  line1 text not null,
  line2 text,
  city text not null,
  district text not null,
  postal_code text,
  is_default boolean not null default false,
  constraint fk_addresses_user foreign key (user_id) references users(id) on delete cascade
);

-- Catalog
create table categories (
  id text primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id text,
  constraint fk_categories_parent foreign key (parent_id) references categories(id)
);

create table products (
  id text primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  description text not null,
  brand text,
  category_id text not null,
  base_price numeric(12,2) not null,
  currency text not null default 'NPR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_products_category foreign key (category_id) references categories(id)
);
create index on products(category_id);

create table product_images (
  id text primary key default gen_random_uuid(),
  product_id text not null,
  url text not null,
  alt_text text,
  position integer not null default 0,
  constraint fk_product_images_product foreign key (product_id) references products(id) on delete cascade
);

create table product_variants (
  id text primary key default gen_random_uuid(),
  product_id text not null,
  name text not null,
  price_delta numeric(12,2) not null default 0,
  stock_qty integer not null default 0,
  stock_version integer not null default 0,
  sku text not null unique,
  constraint fk_product_variants_product foreign key (product_id) references products(id) on delete cascade
);
create index on product_variants(product_id);

-- Auctions
create table auctions (
  id text primary key default gen_random_uuid(),
  product_id text not null unique,
  start_price numeric(12,2) not null,
  reserve_price numeric(12,2),
  buy_it_now_price numeric(12,2),
  bid_increment numeric(12,2) not null default 100,
  current_price numeric(12,2) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status auction_status not null default 'SCHEDULED',
  version integer not null default 0,
  winning_bid_id text unique,
  constraint fk_auctions_product foreign key (product_id) references products(id)
);


create table bids (
  id text primary key default gen_random_uuid(),
  auction_id text not null,
  user_id text not null,
  amount numeric(12,2) not null,
  is_auto_bid boolean not null default false,
  placed_at timestamptz not null default now(),
  constraint fk_bids_auction foreign key (auction_id) references auctions(id),
  constraint fk_bids_user foreign key (user_id) references users(id)
);
create index on bids(auction_id, amount);

create table auto_bids (
  id text primary key default gen_random_uuid(),
  auction_id text not null,
  user_id text not null,
  max_amount numeric(12,2) not null,
  is_active boolean not null default true,
  constraint fk_auto_bids_auction foreign key (auction_id) references auctions(id),
  constraint fk_auto_bids_user foreign key (user_id) references users(id),
  unique(auction_id, user_id)
);

-- Cart, orders, payments
create table carts (
  id text primary key default gen_random_uuid(),
  user_id text not null unique,
  updated_at timestamptz not null default now(),
  constraint fk_carts_user foreign key (user_id) references users(id)
);

create table cart_items (
  id text primary key default gen_random_uuid(),
  cart_id text not null,
  product_id text not null,
  variant_id text,
  qty integer not null,
  constraint fk_cart_items_cart foreign key (cart_id) references carts(id) on delete cascade,
  constraint fk_cart_items_product foreign key (product_id) references products(id),
  unique(cart_id, product_id, variant_id)
);

create table orders (
  id text primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id text not null,
  status order_status not null default 'PENDING_PAYMENT',
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  shipping_address_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_orders_user foreign key (user_id) references users(id)
);

-- Delivery tracking
create type delivery_status as enum ('PENDING', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION');

create table delivery_shipments (
  id text primary key default gen_random_uuid(),
  order_id text not null unique,
  carrier text,
  tracking_number text unique,
  status delivery_status not null default 'PENDING',
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz,
  last_location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_delivery_shipments_order foreign key (order_id) references orders(id) on delete cascade
);
create index on delivery_shipments(status);
create index on delivery_shipments(estimated_delivery);

create table delivery_events (
  id text primary key default gen_random_uuid(),
  shipment_id text not null,
  status delivery_status not null,
  location text,
  description text not null,
  occurred_at timestamptz not null default now(),
  constraint fk_delivery_events_shipment foreign key (shipment_id) references delivery_shipments(id) on delete cascade
);
create index on delivery_events(shipment_id, occurred_at desc);

create table order_items (
  id text primary key default gen_random_uuid(),
  order_id text not null,
  product_id text not null,
  variant_id text,
  qty integer not null,
  unit_price numeric(12,2) not null,
  constraint fk_order_items_order foreign key (order_id) references orders(id) on delete cascade,
  constraint fk_order_items_product foreign key (product_id) references products(id)
);

create table payments (
  id text primary key default gen_random_uuid(),
  order_id text not null unique,
  provider payment_provider not null,
  provider_ref text not null unique,
  amount numeric(12,2) not null,
  status payment_status not null default 'INITIATED',
  idempotency_key text not null unique,
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  constraint fk_payments_order foreign key (order_id) references orders(id)
);

-- Loyalty, reviews, stores
create table loyalty_accounts (
  id text primary key default gen_random_uuid(),
  user_id text not null unique,
  points_balance integer not null default 0,
  tier text not null default 'BRONZE',
  constraint fk_loyalty_accounts_user foreign key (user_id) references users(id)
);

create table loyalty_transactions (
  id text primary key default gen_random_uuid(),
  account_id text not null,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint fk_loyalty_transactions_account foreign key (account_id) references loyalty_accounts(id) on delete cascade
);

create table reviews (
  id text primary key default gen_random_uuid(),
  product_id text not null,
  user_id text not null,
  rating integer not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint fk_reviews_product foreign key (product_id) references products(id),
  constraint fk_reviews_user foreign key (user_id) references users(id),
  unique(product_id, user_id)
);

create table store_locations (
  id text primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  hours jsonb
);

create table repair_bookings (
  id text primary key default gen_random_uuid(),
  user_id text not null,
  store_id text not null,
  device_type text not null,
  issue_desc text not null,
  scheduled_at timestamptz not null,
  status text not null default 'PENDING',
  constraint fk_repair_bookings_user foreign key (user_id) references users(id),
  constraint fk_repair_bookings_store foreign key (store_id) references store_locations(id)
);

alter table auctions
  add constraint fk_auctions_winning_bid foreign key (winning_bid_id) references bids(id);

-- updated_at trigger helper for tables with updated_at columns
create or replace function set_updated_at_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function set_updated_at_timestamp();
create trigger products_updated_at before update on products for each row execute function set_updated_at_timestamp();
create trigger carts_updated_at before update on carts for each row execute function set_updated_at_timestamp();
create trigger orders_updated_at before update on orders for each row execute function set_updated_at_timestamp();
create trigger delivery_shipments_updated_at before update on delivery_shipments for each row execute function set_updated_at_timestamp();
