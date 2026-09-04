# TechMart Admin Panel Backend

This document describes the backend and data layer used by the TechMart admin panel. It intentionally focuses on authentication, database access, schema, repositories, API routes, validation, security, and deployment configuration. It does not document the visual UI implementation.

## 1. Backend Architecture

The admin backend is implemented with:

- Next.js App Router route handlers under `app/api/**/route.ts`.
- Server components under `app/admin/**/page.tsx`.
- Repository modules under `lib/*-repo.ts`.
- PostgreSQL access through `lib/db.ts` and the `pg` package.
- Supabase service-role access through `lib/supabaseAdmin.ts` as a fallback or direct access path.
- Zod validation colocated with API route handlers.
- A signed, HTTP-only JWT session cookie for admin authentication.

### Request flow

```text
Admin browser
    |
    | HTTP request with session cookie
    v
Next.js page or route handler
    |
    | requireAdmin()
    v
Session verification + database role check
    |
    v
Repository function
    |
    +--> PostgreSQL pg Pool (primary where implemented)
    |
    +--> Supabase service-role client (fallback/direct path)
    |
    v
JSON response or server-rendered data
```

## 2. Environment Configuration

Create `.env.local` in the project root. Never commit this file.

```env
# Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin session signing
SESSION_SECRET=use-a-long-random-secret-at-least-16-characters
SESSION_COOKIE_NAME=techmart_admin_session

# PostgreSQL connection used by lib/db.ts
DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
# NEXT_PUBLIC_DATABASE_URL may also be used, but DATABASE_URL is preferred.

# Optional application and payment configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
ESEWA_MERCHANT_CODE=EPAYTEST
```

### Required credentials

| Variable                        | Used by                           | Required for                                         |
| ------------------------------- | --------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `supabaseClient`, `supabaseAdmin` | Supabase access and admin login                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabaseClient`                  | Browser-side Supabase access                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | `supabaseAdmin`                   | Server-side privileged queries                       |
| `SESSION_SECRET`                | `lib/auth.ts`                     | Creating and verifying admin sessions                |
| `DATABASE_URL`                  | `lib/db.ts`                       | PostgreSQL repository primary paths and transactions |

The service-role key bypasses Supabase Row Level Security. It must only be used in server-side code. Never expose it in a `NEXT_PUBLIC_*` variable in production.

## 3. Database Connection Strategy

### PostgreSQL: `lib/db.ts`

`lib/db.ts` creates a `pg.Pool` from `NEXT_PUBLIC_DATABASE_URL` or `DATABASE_URL`.

The connection is accepted only when it:

- Is non-empty.
- Starts with `postgres://` or `postgresql://`.
- Does not contain placeholder values such as `[PROJECT_REF]`, `[PASSWORD]`, or `[POOLER_HOST]`.

The module exports:

```ts
query<T>(sql, params);
withTransaction(callback);
pool;
```

Use parameterized values (`$1`, `$2`, etc.). Do not interpolate user input into SQL.

`withTransaction()` starts a transaction, commits on success, rolls back on failure, and releases the client.

### Supabase service client: `lib/supabaseAdmin.ts`

The service client is created with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or the legacy `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

The client is used for privileged server-side reads and writes. It is also used as a fallback by product and user repository code when the PostgreSQL query path fails.

### Current consistency rule

The project currently uses a hybrid strategy:

- `lib/users-repo.ts`: PostgreSQL primary path for list/create/update/delete, with Supabase fallback for `listUsers()`.
- `lib/products-repo.ts`: PostgreSQL primary path with Supabase fallback for product operations.
- `lib/dashboard-repo.ts`: PostgreSQL primary path with Supabase fallback for dashboard metrics and recent records.
- `lib/auth.ts`: Supabase service client directly for the session user's current role.
- `lib/roles.ts`: PostgreSQL directly to inspect the `user_role` enum.

This means production should configure both valid Supabase credentials and a valid PostgreSQL connection until the project is standardized on one client.

## 4. Database Schema

The canonical schema is `supabase/schema.sql`. Run it in the Supabase SQL editor or using the Supabase CLI.

### Enums

- `user_role`: `CUSTOMER`, `ADMIN`, `SUPPORT`
- `auction_status`: `SCHEDULED`, `LIVE`, `ENDED`, `CANCELLED`
- `order_status`: payment and fulfillment states
- `payment_provider`: `ESEWA`, `KHALTI`
- `payment_status`: `INITIATED`, `VERIFIED`, `FAILED`

### Core admin tables

#### `users`

| Column           | Type          | Notes                                              |
| ---------------- | ------------- | -------------------------------------------------- |
| `id`             | `text`        | UUID generated by `gen_random_uuid()`; primary key |
| `email`          | `text`        | Required and unique                                |
| `phone`          | `text`        | Optional and unique                                |
| `password_hash`  | `text`        | Required bcrypt hash                               |
| `full_name`      | `text`        | Required                                           |
| `role`           | `user_role`   | Defaults to `CUSTOMER`                             |
| `email_verified` | `boolean`     | Defaults to `false`                                |
| `created_at`     | `timestamptz` | Defaults to `now()`                                |
| `updated_at`     | `timestamptz` | Updated by trigger                                 |

#### `categories`

| Column      | Type   | Notes                      |
| ----------- | ------ | -------------------------- |
| `id`        | `text` | UUID-generated primary key |
| `name`      | `text` | Required                   |
| `slug`      | `text` | Required and unique        |
| `parent_id` | `text` | Optional self-reference    |

#### `products`

| Column        | Type            | Notes                                        |
| ------------- | --------------- | -------------------------------------------- |
| `id`          | `text`          | UUID-generated primary key                   |
| `sku`         | `text`          | Required and unique                          |
| `name`        | `text`          | Required                                     |
| `slug`        | `text`          | Required and unique                          |
| `description` | `text`          | Required                                     |
| `brand`       | `text`          | Optional                                     |
| `category_id` | `text`          | Required FK to `categories.id`               |
| `base_price`  | `numeric(12,2)` | Required; preserve as a string in TypeScript |
| `currency`    | `text`          | Defaults to `NPR`                            |
| `is_active`   | `boolean`       | Defaults to `true`                           |
| `created_at`  | `timestamptz`   | Defaults to `now()`                          |
| `updated_at`  | `timestamptz`   | Updated by trigger                           |

An index exists on `products.category_id`.

### Product-related foreign keys

Product deletion may be blocked by related records in:

- `product_images.product_id`
- `product_variants.product_id`
- `cart_items.product_id`
- `order_items.product_id`
- `auctions.product_id`
- `reviews.product_id`

The product repository checks the first five operational dependency tables before attempting hard deletion. When dependencies exist, the API returns a conflict and recommends archiving the product by setting `is_active = false`.

### Other operational tables

The schema also contains:

- `refresh_tokens`
- `addresses`
- `product_images`
- `product_variants`
- `auctions`
- `bids`
- `auto_bids`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `loyalty_accounts`
- `loyalty_transactions`
- `reviews`
- `store_locations`
- `repair_bookings`

The complete column definitions and constraints are maintained in `supabase/schema.sql`.

## 5. Admin Authentication

Authentication is implemented in `lib/auth.ts`.

### Login behavior

`POST /api/auth/login`:

1. Parses the request with the shared login Zod schema.
2. Looks up the user by email through `supabaseAdmin`.
3. Verifies `password` against `password_hash` with bcrypt.
4. Rejects non-admin accounts with HTTP `403`.
5. Creates an eight-hour HS256 JWT session.
6. Stores the JWT in the HTTP-only cookie configured by `SESSION_COOKIE_NAME`.

Invalid login responses intentionally use a generic message to avoid revealing whether an email exists.

### Session behavior

`requireAdmin()`:

1. Reads the session cookie.
2. Verifies the JWT signature and expiry using `SESSION_SECRET`.
3. Re-queries `users` by the session subject.
4. Rejects missing users with `401`.
5. Rejects users whose current role is not `ADMIN` with `403`.

Every protected admin page and every mutating admin route must call `requireAdmin()` before reading or changing data.

### Logout

`POST /api/auth/logout` clears the session cookie and returns `{ "ok": true }`.

## 6. Admin API Routes

All errors use the JSON shape:

```json
{ "error": "Human-readable message" }
```

### Admin health route

#### `GET /api/admin`

Returns a basic availability response:

```json
{ "ok": true, "message": "Admin API is available." }
```

#### `POST /api/admin`

Returns a basic POST handler availability response. It is not a data mutation endpoint.

### Users

#### `POST /api/admin/users`

Creates a user.

Request body:

```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "phone": "9800000000",
  "role": "CUSTOMER",
  "emailVerified": false,
  "password": "at-least-six-characters"
}
```

Validation:

- `fullName`: trimmed, required.
- `email`: valid email.
- `phone`: optional.
- `role`: `ADMIN`, `CUSTOMER`, or `SUPPORT`.
- `password`: at least six characters.

#### `PUT /api/admin/users/:id`

Updates full name, email, phone, role, verification state, or password fields supplied in the body.

Self-protection rules:

- An administrator cannot delete their own account.
- An administrator cannot change their own role away from `ADMIN`.
- Role validation is also checked against the database enum through `getUserRoles()`.

#### `DELETE /api/admin/users/:id`

Deletes a user only when no referencing foreign-key rows exist. Related rows are inspected transactionally and a conflict is returned when deletion would violate relationships.

### Products

#### `GET /api/admin/products`

Returns a paginated product list.

Supported query parameters:

- `page`: one-based page number.
- `pageSize`: capped at 100.
- `search`: searches product name, SKU, and brand.
- `categoryId`: filters by category.
- `active`: `all`, `active`, or `inactive`.
- `sort`: `created_at`, `name`, or `base_price`.
- `direction`: `asc` or `desc`.

Example:

```text
/api/admin/products?page=1&pageSize=10&search=laptop&active=active&sort=name&direction=asc
```

#### `POST /api/admin/products`

Creates a product. `basePrice` is accepted and stored as a decimal string so PostgreSQL numeric precision is not lost in the database layer.

Request body:

```json
{
  "sku": "TM-LAP-001",
  "name": "TechMart Laptop",
  "slug": "techmart-laptop",
  "description": "A product description.",
  "brand": "TechMart",
  "categoryId": "category-id",
  "categoryName": "Laptops",
  "basePrice": "125000.00",
  "currency": "NPR",
  "isActive": true
}
```

Category behavior:

- Send `categoryId` to use an existing category.
- Send `categoryName` when creating a new category inline.
- At least one of these values is required.
- The category slug is generated from the category name.

Slug behavior:

- `lib/slug.ts` normalizes slugs.
- `generateUniqueSlug()` checks existing product slugs and adds a numeric suffix when needed.
- The database unique constraint remains the final protection.

#### `GET /api/admin/products/:id`

Returns one product by ID.

#### `PUT /api/admin/products/:id`

Updates only supplied product fields. Slug uniqueness is checked before updating. `basePrice` remains a string.

#### `DELETE /api/admin/products/:id`

Performs a protected hard delete only when no related images, variants, cart items, order items, or auctions exist. If references exist, it returns HTTP `409` with an archive recommendation.

### CSRF and same-origin protection

Mutating admin routes call `isSameOrigin()` from `lib/csrf.ts` after authentication.

The helper compares `Origin` and `Referer` headers with the request URL origin:

- A different `Origin` is rejected.
- A different `Referer` origin is rejected.
- Missing headers are accepted for same-origin server-side or tool requests.

Rejected requests return HTTP `403`:

```json
{ "error": "Invalid request origin" }
```

## 7. Repository Responsibilities

### `lib/users-repo.ts`

- `getDashboardStats()`
- `listUsers()` with search, role, verification, pagination, sorting, and PostgreSQL fallback
- `getUserById()`
- `createUser()` with bcrypt password hashing
- `updateUser()` with self-demotion protection
- `deleteUser()` with self-delete and FK safety

### `lib/products-repo.ts`

- `listProducts()` with search, category/status filters, pagination, sorting, and fallback
- `listCategories()`
- `createCategory()`
- `getProductById()`
- `createProduct()`
- `updateProduct()`
- `deleteProduct()` with FK checks and archive guidance

### `lib/dashboard-repo.ts`

- `getProductStats()` returns total, active, and inactive products.
- `getAuctionStats()` returns total, live, scheduled, and ended auctions.
- `getRecentProducts()` returns recently created products.
- `getRecentAuctions()` returns recent auctions joined to product names.
- `getMonthlyProductActivity()` returns chart-ready monthly product activity.

## 8. Admin Pages and Data Dependencies

### `/admin/dashboard`

Protected by `requireAdmin()` and loads:

- User totals from `getDashboardStats()`.
- Product totals from `getProductStats()`.
- Auction totals from `getAuctionStats()`.
- Recent users from `listUsers()`.
- Recent products from `getRecentProducts()`.
- Recent auctions from `getRecentAuctions()`.
- Monthly activity from `getMonthlyProductActivity()`.

All dashboard queries are read-only.

### `/admin/users`

Protected server page. Query parameters control search, role, verification, sorting, direction, and pagination. CRUD operations are performed by the client component through the admin API routes.

### `/admin/products`

Protected server page. Query parameters control product search, category, active state, sorting, direction, and pagination. CRUD operations are performed through the product API routes.

## 9. Database Setup

1. Create a Supabase project.
2. Copy Supabase URL and keys into `.env.local`.
3. Configure a valid PostgreSQL connection string in `DATABASE_URL`.
4. Execute `supabase/schema.sql` in the Supabase SQL editor.
5. Confirm the `pgcrypto` extension exists.
6. Confirm all enums and tables were created.
7. Create an initial admin user using the project’s admin creation script or a controlled database operation.
8. Start the app:

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
npm run start
```

## 10. Operational Checks

Before using the admin panel, verify:

- `SESSION_SECRET` is at least 16 characters and is not a placeholder.
- `SUPABASE_SERVICE_ROLE_KEY` is configured only on the server.
- `DATABASE_URL` is a complete PostgreSQL URL and contains no placeholders.
- `categories` contains at least one row, or use inline category creation when adding a product.
- The `products` table has the required unique constraints on `sku` and `slug`.
- `set_updated_at_timestamp()` exists and the `products_updated_at` trigger is installed.
- The logged-in user exists in `users` and currently has role `ADMIN`.
- Product deletion is expected to fail with `409` when related commerce or auction rows exist.

## 11. Known Project Notes

- The project currently has both PostgreSQL and Supabase access paths. Keep both configured unless the codebase is intentionally standardized on one client.
- PostgreSQL `numeric(12,2)` values should remain strings in repository types and API payloads. Convert only for display or validated external calculations.
- The payments area currently has separate TypeScript issues unrelated to the admin data layer. They should be resolved before treating a full `npx tsc --noEmit` or production build as clean.
- `app/api/admin/route.ts` is a health-style endpoint and should not be treated as a general CRUD gateway.
- Database constraints remain authoritative even when application validation passes. Handle duplicate SKU, duplicate slug, invalid category, and FK errors as expected API failures.
