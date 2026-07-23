import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
	throw new Error("DATABASE_URL is required to seed catalog data.");
const sql = neon(connectionString);

const additions = [
	[
		"linguine",
		"Silken Linguine",
		"long",
		1300,
		28,
		"/images/products/molino-spaghetti-package-v2.webp",
		"Long ribbons for delicate sauces.",
	],
	[
		"tagliatelle",
		"Egg Tagliatelle",
		"long",
		1550,
		22,
		"/images/products/molino-spaghetti-package-v2.webp",
		"Wide golden ribbons for slow Sunday ragù.",
	],
	[
		"conchiglie",
		"Conchiglie Shells",
		"short",
		1250,
		20,
		"/images/products/molino-penne-package-v2.webp",
		"Sauce-catching shells with a generous bite.",
	],
	[
		"orecchiette",
		"Orecchiette Pugliesi",
		"specialty",
		1450,
		16,
		"/images/products/molino-fusilli-package-v2.webp",
		"Little ear-shaped pasta for greens and sausage.",
	],
	[
		"pappardelle",
		"Pappardelle Classico",
		"long",
		1650,
		14,
		"/images/products/molino-spaghetti-package-v2.webp",
		"Broad ribbons for rich, slow-cooked sauces.",
	],
	[
		"family-trio",
		"La Famiglia Trio",
		"specialty",
		3600,
		18,
		"/images/products/molino-famiglia-trio-bundle-v2.png",
		"Three beloved pasta shapes in one beautiful giftable bundle.",
	],
	[
		"weeknight-trio",
		"Weeknight Dinner Trio",
		"specialty",
		3450,
		15,
		"/images/products/molino-famiglia-trio-bundle-v2.png",
		"A fast, versatile trio for pasta nights all week.",
	],
	[
		"sunday-feast",
		"Sunday Feast Bundle",
		"specialty",
		4200,
		10,
		"/images/products/molino-famiglia-trio-bundle-v2.png",
		"A generous pasta collection for the whole table.",
	],
	[
		"cucina-collection",
		"Cucina Collection",
		"specialty",
		5200,
		8,
		"/images/products/molino-famiglia-trio-bundle-v2.png",
		"Our six-shape pantry collection, ready to gift or discover.",
	],
] as const;

for (const [
	slug,
	name,
	category,
	priceCents,
	quantity,
	imageUrl,
	description,
] of additions) {
	const existing =
		await sql`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
	if (existing.length) {
		await sql`UPDATE products SET image_url = ${imageUrl}, updated_at = now() WHERE id = ${existing[0].id}`;
		continue;
	}
	const [product] = await sql`
		INSERT INTO products (slug, name, short_description, description, category, image_url, status)
		VALUES (${slug}, ${name}, ${"500g · artisan pasta"}, ${description}, ${category}, ${imageUrl}, 'active')
		RETURNING id`;
	const sku = `MP-${slug.toUpperCase().replaceAll("-", "").slice(0, 12)}-500`;
	const [variant] = await sql`
		INSERT INTO product_variants (product_id, sku, title, price_cents, currency, weight_grams)
		VALUES (${product.id}, ${sku}, '500g', ${priceCents}, 'USD', 500)
		RETURNING id`;
	await sql`INSERT INTO inventory_levels (variant_id, available_quantity, reserved_quantity, reorder_point) VALUES (${variant.id}, ${quantity}, 0, 5)`;
	await sql`INSERT INTO inventory_movements (variant_id, type, quantity_delta, reference, note) VALUES (${variant.id}, 'receipt', ${quantity}, 'CATALOG-SEED', 'Expanded catalog seed')`;
}

console.log("Catalog seed complete.");
