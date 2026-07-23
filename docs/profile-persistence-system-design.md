# Profile persistence system design

## Scope

This first database slice persists only the profile information needed by the user and administrator dashboards. Products, carts, orders, sales and payments deliberately remain outside this schema.

## Ownership and trust boundaries

| Concern | Source of truth | Why |
| --- | --- | --- |
| Sign-in identity, email and OTP verification | Clerk | Clerk already owns credentials, sessions and verification factors. |
| Role | Server-side email rule | `saquibhazari1000@gmail.com` is always `admin`; every other authenticated account is `user`. |
| Delivery profile | Neon PostgreSQL `profiles` table | The app owns this mutable business data. |
| Phone number | Clerk verification, then profile snapshot | A number is written to PostgreSQL only after Clerk reports it verified. |

## Request flow

```text
Dashboard form
  -> TanStack Start server function (authenticated with Clerk)
  -> ProfileService (validation + business rules)
  -> ProfileRepository (Neon/Drizzle)
  -> profiles table
```

Phone changes take a separate path:

```text
Enter phone -> Clerk sends OTP -> Clerk verifies OTP
  -> saveVerifiedPhone server function -> ProfileService confirms Clerk state
  -> profile snapshot is updated
```

The browser never receives `DATABASE_URL` and cannot select its own role or mark a phone as verified.

## OOP-oriented code layout

- `profile.types.ts`: stable DTOs shared by UI and server code.
- `ProfileRepository`: database-only operations, with no Clerk or UI logic.
- `ProfileService`: orchestration, normalization, authorization-sensitive role derivation and Clerk reconciliation.
- `profile.functions.ts`: small authenticated HTTP/server-function boundary.

This separation lets future order, address-book or admin services use the same repository/service pattern without coupling dashboard components directly to SQL.

## Data model

`profiles` uses `clerk_user_id` as a unique external identity key. It contains contact/delivery fields, a role snapshot, Clerk avatar URL, verified phone snapshot and audit timestamps. Writes use an upsert so first dashboard visit creates a profile safely and repeat saves update the same record.

## Future extensions

When catalog and checkout work begins, add separate tables such as `products`, `orders`, `order_items` and `addresses`; do not overload this profile table. For higher-scale role management, replace the single email rule with an application roles/permissions table and audited administrator assignment workflow.
