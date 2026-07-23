import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import type { CatalogProductInput } from "./catalog.types";

async function adminOnly() {
	const session = await auth();
	if (!session.userId) throw new Error("Please sign in as an administrator.");
	const user = await clerkClient().users.getUser(session.userId);
	if (
		user.primaryEmailAddress?.emailAddress?.toLowerCase() !==
		"saquibhazari1000@gmail.com"
	)
		throw new Error("Administrator access is required.");
}

function productInput(data: unknown) {
	if (!data || typeof data !== "object")
		throw new Error("Invalid product data.");
	return data as CatalogProductInput;
}

function productIdInput(data: unknown) {
	if (
		!data ||
		typeof data !== "object" ||
		typeof (data as { id?: unknown }).id !== "number"
	) {
		throw new Error("Invalid product.");
	}
	return { id: (data as { id: number }).id };
}

export const getStorefrontProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		const { CatalogService } = await import("./catalog.service");
		return new CatalogService().listStorefrontProducts();
	},
);

export const getAdminCatalog = createServerFn({ method: "GET" }).handler(
	async () => {
		await adminOnly();
		const { CatalogService } = await import("./catalog.service");
		return new CatalogService().listAdminProducts();
	},
);

export const saveCatalogProduct = createServerFn({ method: "POST" })
	.validator(productInput)
	.handler(async ({ data }) => {
		await adminOnly();
		const { CatalogService } = await import("./catalog.service");
		return new CatalogService().saveProduct(data);
	});

export const deleteCatalogProduct = createServerFn({ method: "POST" })
	.validator(productIdInput)
	.handler(async ({ data }) => {
		await adminOnly();
		const { CatalogService } = await import("./catalog.service");
		return new CatalogService().deleteProduct(data.id);
	});
