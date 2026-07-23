import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
	inventoryLevels,
	inventoryMovements,
	products,
	productVariants,
} from "../../db/schema";

function database() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not configured.");
	return drizzle(neon(connectionString));
}

export class CatalogRepository {
	async findAllVariants() {
		return database()
			.select({
				id: products.id,
				slug: products.slug,
				name: products.name,
				detail: products.shortDescription,
				description: products.description,
				category: products.category,
				image: products.imageUrl,
				status: products.status,
				variantId: productVariants.id,
				sku: productVariants.sku,
				variantTitle: productVariants.title,
				priceCents: productVariants.priceCents,
				availableQuantity: inventoryLevels.availableQuantity,
			})
			.from(products)
			.innerJoin(productVariants, eq(productVariants.productId, products.id))
			.leftJoin(
				inventoryLevels,
				eq(inventoryLevels.variantId, productVariants.id),
			)
			.orderBy(products.id);
	}

	async findActiveVariants() {
		return database()
			.select({
				id: products.id,
				slug: products.slug,
				name: products.name,
				detail: products.shortDescription,
				category: products.category,
				image: products.imageUrl,
				variantId: productVariants.id,
				priceCents: productVariants.priceCents,
				availableQuantity: inventoryLevels.availableQuantity,
			})
			.from(products)
			.innerJoin(productVariants, eq(productVariants.productId, products.id))
			.leftJoin(
				inventoryLevels,
				eq(inventoryLevels.variantId, productVariants.id),
			)
			.where(
				and(eq(products.status, "active"), eq(productVariants.isActive, true)),
			)
			.orderBy(products.id);
	}

	async createProduct(input: {
		slug: string;
		name: string;
		description: string;
		category: string;
		priceCents: number;
		quantity: number;
		imageUrl: string;
		status: "draft" | "active" | "archived";
	}) {
		const [product] = await database()
			.insert(products)
			.values({
				slug: input.slug,
				name: input.name,
				shortDescription: "500g · artisan pasta",
				description: input.description,
				category: input.category,
				imageUrl: input.imageUrl,
				status: input.status,
			})
			.returning();
		const [variant] = await database()
			.insert(productVariants)
			.values({
				productId: product.id,
				sku: `MP-${input.slug.toUpperCase().slice(0, 12)}-500`,
				title: "500g",
				priceCents: input.priceCents,
				weightGrams: 500,
			})
			.returning();
		await database().insert(inventoryLevels).values({
			variantId: variant.id,
			availableQuantity: input.quantity,
		});
		if (input.quantity > 0) {
			await database().insert(inventoryMovements).values({
				variantId: variant.id,
				type: "receipt",
				quantityDelta: input.quantity,
				reference: "ADMIN-CATALOG",
				note: "Initial catalog stock",
			});
		}
	}

	async updateProduct(input: {
		id: number;
		name: string;
		description: string;
		category: string;
		priceCents: number;
		quantity: number;
		imageUrl: string;
		status: "draft" | "active" | "archived";
	}) {
		const current = await this.findAllVariants();
		const existing = current.find((product) => product.id === input.id);
		if (!existing) throw new Error("Product not found.");
		await database()
			.update(products)
			.set({
				name: input.name,
				description: input.description,
				category: input.category,
				imageUrl: input.imageUrl,
				status: input.status,
				updatedAt: new Date(),
			})
			.where(eq(products.id, input.id));
		await database()
			.update(productVariants)
			.set({ priceCents: input.priceCents, updatedAt: new Date() })
			.where(eq(productVariants.id, existing.variantId));
		const before = existing.availableQuantity ?? 0;
		await database()
			.update(inventoryLevels)
			.set({ availableQuantity: input.quantity, updatedAt: new Date() })
			.where(eq(inventoryLevels.variantId, existing.variantId));
		const delta = input.quantity - before;
		if (delta !== 0) {
			await database().insert(inventoryMovements).values({
				variantId: existing.variantId,
				type: "adjustment",
				quantityDelta: delta,
				reference: "ADMIN-CATALOG",
				note: "Stock adjusted from catalog workspace",
			});
		}
	}

	async deleteProduct(productId: number) {
		const catalog = await this.findAllVariants();
		const variants = catalog.filter((item) => item.id === productId);
		if (!variants.length) throw new Error("Product not found.");
		for (const variant of variants) {
			await database()
				.delete(inventoryMovements)
				.where(eq(inventoryMovements.variantId, variant.variantId));
		}
		await database().delete(products).where(eq(products.id, productId));
	}
}
