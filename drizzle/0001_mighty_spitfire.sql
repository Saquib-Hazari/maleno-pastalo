CREATE TYPE "public"."inventory_movement_type" AS ENUM('receipt', 'adjustment', 'reservation', 'release', 'sale', 'return');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'fulfilled', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"variant_id" integer PRIMARY KEY NOT NULL,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"type" "inventory_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reference" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"recipient_name" text NOT NULL,
	"phone_number" text,
	"address_line_1" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" integer,
	"sku" text NOT NULL,
	"product_name" text NOT NULL,
	"variant_title" text NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"profile_id" integer,
	"email" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"tax_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	"title" text NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"weight_grams" integer,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"image_url" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_movements_variant_created_idx" ON "inventory_movements" USING btree ("variant_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_unique" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_profile_created_idx" ON "orders" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_unique" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_product_title_unique" ON "product_variants" USING btree ("product_id","title");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");
--> statement-breakpoint
INSERT INTO "products" ("id", "slug", "name", "short_description", "description", "category", "image_url", "status") VALUES
	(1, 'spaghetti', 'Traditional Spaghetti No. 5', '500g · bronze die', 'Slow-dried bronze-die spaghetti made from Italian durum wheat.', 'long', '/images/products/molino-spaghetti-package-v2.webp', 'active'),
	(2, 'penne', 'Organic Penne Rigate', '500g · ridged texture', 'Organic bronze-die penne with ridges made for generous sauces.', 'short', '/images/products/molino-penne-package-v2.webp', 'active'),
	(3, 'fusilli', 'Hand-Twisted Fusilli', '500g · slow dried', 'Spiralled pasta with a textured surface for pesto and ragù.', 'short', '/images/products/molino-fusilli-package-v2.webp', 'active'),
	(4, 'bucatini', 'Artisanal Bucatini', '500g · hollow center', 'A bold hollow strand for tomato, cheese and pepper sauces.', 'long', '/images/products/molino-bucatini-package-v2.webp', 'active'),
	(5, 'mezze-rigatoni', 'Mezze Rigatoni', '500g · large ridges', 'Short ridged tubes with structure for baked dishes.', 'short', '/images/products/molino-mezze-rigatoni-package-v2.webp', 'active'),
	(6, 'farfalle', 'Farfalle Classico', '500g · bow-tie', 'Delicate bow-tie pasta for bright seasonal sauces.', 'specialty', '/images/products/molino-farfalle-package-v2.webp', 'active');
--> statement-breakpoint
INSERT INTO "product_variants" ("id", "product_id", "sku", "title", "price_cents", "currency", "weight_grams") VALUES
	(1, 1, 'MP-SPAG-500', '500g', 1200, 'USD', 500),
	(2, 2, 'MP-PENN-500', '500g', 1400, 'USD', 500),
	(3, 3, 'MP-FUSI-500', '500g', 1400, 'USD', 500),
	(4, 4, 'MP-BUCA-500', '500g', 1350, 'USD', 500),
	(5, 5, 'MP-MEZZ-500', '500g', 1200, 'USD', 500),
	(6, 6, 'MP-FARF-500', '500g', 1100, 'USD', 500);
--> statement-breakpoint
INSERT INTO "inventory_levels" ("variant_id", "available_quantity", "reserved_quantity", "reorder_point") VALUES
	(1, 48, 0, 10),
	(2, 36, 0, 10),
	(3, 24, 0, 8),
	(4, 18, 0, 8),
	(5, 12, 0, 6),
	(6, 0, 0, 6);
--> statement-breakpoint
INSERT INTO "inventory_movements" ("variant_id", "type", "quantity_delta", "reference", "note") VALUES
	(1, 'receipt', 48, 'INITIAL-SEED', 'Initial storefront inventory'),
	(2, 'receipt', 36, 'INITIAL-SEED', 'Initial storefront inventory'),
	(3, 'receipt', 24, 'INITIAL-SEED', 'Initial storefront inventory'),
	(4, 'receipt', 18, 'INITIAL-SEED', 'Initial storefront inventory'),
	(5, 'receipt', 12, 'INITIAL-SEED', 'Initial storefront inventory');
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX("id") FROM "products"));
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('product_variants', 'id'), (SELECT MAX("id") FROM "product_variants"));
