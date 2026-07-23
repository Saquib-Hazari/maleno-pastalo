import { CatalogRepository } from "./catalog.repository";
import type {
	AdminCatalogProduct,
	CatalogProductInput,
	StorefrontProduct,
} from "./catalog.types";

/** Storefront read model. Inventory, not UI state, determines availability. */
export class CatalogService {
	constructor(private readonly repository = new CatalogRepository()) {}

	async listStorefrontProducts(): Promise<StorefrontProduct[]> {
		const rows = await this.repository.findActiveVariants();
		return rows.map((row) => {
			const availableQuantity = Math.max(0, row.availableQuantity ?? 0);
			return {
				id: row.id,
				slug: row.slug,
				name: row.name,
				detail: row.detail,
				price: row.priceCents / 100,
				category: row.category,
				image: row.image,
				variantId: row.variantId,
				availableQuantity,
				isSoldOut: availableQuantity === 0,
			};
		});
	}

	async listAdminProducts(): Promise<AdminCatalogProduct[]> {
		const rows = await this.repository.findAllVariants();
		return rows.map((row) => {
			const availableQuantity = Math.max(0, row.availableQuantity ?? 0);
			return {
				id: row.id,
				slug: row.slug,
				name: row.name,
				detail: row.detail,
				description: row.description,
				category: row.category,
				image: row.image,
				variantId: row.variantId,
				sku: row.sku,
				variantTitle: row.variantTitle,
				price: row.priceCents / 100,
				availableQuantity,
				isSoldOut: availableQuantity === 0,
				status: row.status,
			};
		});
	}

	async saveProduct(input: CatalogProductInput) {
		const name = input.name.trim();
		const description = input.description.trim();
		const imageUrl = input.imageUrl.trim();
		if (!name || !description || !imageUrl)
			throw new Error("Name, description and image URL are required.");
		if (!Number.isFinite(input.price) || input.price < 0)
			throw new Error("Enter a valid non-negative price.");
		if (!Number.isInteger(input.quantity) || input.quantity < 0)
			throw new Error("Quantity must be a non-negative whole number.");
		const normalized = {
			...input,
			name,
			description,
			imageUrl,
			category: input.category || "specialty",
			priceCents: Math.round(input.price * 100),
			quantity: input.quantity,
		};
		if (input.id) {
			await this.repository.updateProduct(
				normalized as typeof normalized & { id: number },
			);
		} else {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");
			await this.repository.createProduct({ ...normalized, slug });
		}
		return this.listAdminProducts();
	}

	async deleteProduct(productId: number) {
		if (!Number.isInteger(productId) || productId < 1)
			throw new Error("Invalid product.");
		await this.repository.deleteProduct(productId);
		return this.listAdminProducts();
	}
}
