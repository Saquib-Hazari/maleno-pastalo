DROP INDEX "inventory_movements_variant_created_idx";--> statement-breakpoint
DROP INDEX "orders_profile_created_idx";--> statement-breakpoint
CREATE INDEX "inventory_movements_variant_created_idx" ON "inventory_movements" USING btree ("variant_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_profile_created_idx" ON "orders" USING btree ("profile_id","created_at");