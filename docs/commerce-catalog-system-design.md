# Commerce catalog and order foundation

## Scope

This migration adds the database foundation for a professional storefront before Stripe is introduced. The shop reads active product variants and their current inventory directly from Neon PostgreSQL. A variant with `available_quantity = 0` is rendered as **Sold out** and cannot be added or bought from the shop.

## Core model

```text
profiles (application user linked to Clerk)
  └─ orders
      ├─ order_items -> product_variants -> products
      └─ order_addresses (immutable delivery snapshot)

product_variants
  ├─ inventory_levels (current availability)
  └─ inventory_movements (auditable stock ledger)
```

`profiles` is the application user table: its `clerk_user_id` remains the secure identity key. Orders join to `profiles.id`, which avoids duplicating identity data while preserving the option to retain a guest-order email later.

## Inventory policy

- Store money as integer cents, never floating-point values.
- Products describe merchandising content; variants are what customers actually buy.
- `inventory_levels` is the fast storefront read model.
- `inventory_movements` is append-only operational history for receipts, adjustments, reservations, sales, returns and releases.
- Checkout will reserve stock transactionally before payment and record a `sale` movement only after payment succeeds.

## Stripe-ready boundary

No payment, Stripe customer, checkout-session or webhook data is stored yet. When Stripe is added, use a dedicated `payments` table keyed to `orders.id`; keep Stripe identifiers there, validate webhooks server-side, and use the reservation/release movement types to avoid overselling.

## Seeded storefront data

The migration seeds the six existing pasta packs as active products. Farfalle starts at zero quantity intentionally, so the live Sold out state can be verified immediately in the shop. `npm run db:seed:catalog` idempotently adds nine more shapes and bundles, bringing the initial catalog to fifteen products.

## Admin catalog workflow

The Admin dashboard's **Products** workspace is the source of truth for catalog operations. It creates or edits active/draft products, price, description, image URL and stock. Stock edits also write an `inventory_movements` adjustment record. For a production image upload flow, replace the URL field with an R2 signed-upload endpoint; the database model already stores the durable URL rather than local file data.
