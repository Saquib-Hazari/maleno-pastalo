import { describe, expect, it, vi } from "vitest";
import type { CatalogRepository } from "../../src/features/catalog/catalog.repository";
import { CatalogService } from "../../src/features/catalog/catalog.service";

function repositoryStub(overrides: Partial<CatalogRepository> = {}) {
	return {
		findActiveVariants: vi.fn(),
		findAllVariants: vi.fn(),
		createProduct: vi.fn(),
		updateProduct: vi.fn(),
		deleteProduct: vi.fn(),
		...overrides,
	} as unknown as CatalogRepository;
}

describe("CatalogService", () => {
	it("derives sold-out state from inventory, never browser state", async () => {
		const repository = repositoryStub({
			findActiveVariants: vi.fn().mockResolvedValue([
				{
					id: 1,
					slug: "penne-rigate",
					name: "Penne Rigate",
					detail: "Bronze die pasta",
					priceCents: 1400,
					category: "pasta",
					image: "/penne.webp",
					variantId: 2,
					availableQuantity: -3,
				},
			]),
		});

		await expect(new CatalogService(repository).listStorefrontProducts()).resolves.toEqual([
			expect.objectContaining({
				price: 14,
				availableQuantity: 0,
				isSoldOut: true,
			}),
		]);
	});

	it("rejects an invalid product price before touching the database", async () => {
		const repository = repositoryStub();
		await expect(
			new CatalogService(repository).saveProduct({
				name: "Penne",
				description: "Bronze-die pasta",
				imageUrl: "/penne.webp",
				price: -1,
				quantity: 4,
				category: "pasta",
				status: "active",
			}),
		).rejects.toThrow("non-negative price");
		expect(repository.createProduct).not.toHaveBeenCalled();
	});
});
