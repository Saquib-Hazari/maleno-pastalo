export type StorefrontProduct = {
	id: number;
	slug: string;
	name: string;
	detail: string;
	price: number;
	category: string;
	image: string;
	variantId: number;
	availableQuantity: number;
	isSoldOut: boolean;
};

export type AdminCatalogProduct = StorefrontProduct & {
	description: string;
	sku: string;
	variantTitle: string;
	status: "draft" | "active" | "archived";
};

export type CatalogProductInput = {
	id?: number;
	name: string;
	description: string;
	category: string;
	price: number;
	quantity: number;
	imageUrl: string;
	status: "draft" | "active" | "archived";
};
