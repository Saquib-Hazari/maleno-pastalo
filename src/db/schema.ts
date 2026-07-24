import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
	id: serial().primaryKey(),
	title: text().notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const profileRole = pgEnum("profile_role", ["admin", "user"]);
export const productStatus = pgEnum("product_status", [
	"draft",
	"active",
	"archived",
]);
export const orderStatus = pgEnum("order_status", [
	"pending",
	"confirmed",
	"processing",
	"fulfilled",
	"cancelled",
	"refunded",
]);
export const inventoryMovementType = pgEnum("inventory_movement_type", [
	"receipt",
	"adjustment",
	"reservation",
	"release",
	"sale",
	"return",
]);
export const paymentProvider = pgEnum("payment_provider", ["razorpay"]);
export const paymentStatus = pgEnum("payment_status", [
	"created",
	"paid",
	"failed",
]);

/**
 * Application-owned profile data. Clerk remains the identity and verification
 * provider; this table holds the delivery profile Molino Pastello owns.
 */
export const profiles = pgTable(
	"profiles",
	{
		id: serial("id").primaryKey(),
		clerkUserId: text("clerk_user_id").notNull(),
		role: profileRole("role").notNull().default("user"),
		email: text("email").notNull(),
		firstName: text("first_name").notNull().default(""),
		lastName: text("last_name").notNull().default(""),
		addressLine1: text("address_line_1").notNull().default(""),
		city: text("city").notNull().default(""),
		state: text("state").notNull().default(""),
		postalCode: text("postal_code").notNull().default(""),
		country: text("country").notNull().default("India"),
		imageUrl: text("image_url"),
		phoneNumber: text("phone_number"),
		phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("profiles_clerk_user_id_unique").on(table.clerkUserId),
	],
);

/** Product-level merchandising information. Saleable details live in variants. */
export const products = pgTable(
	"products",
	{
		id: serial("id").primaryKey(),
		slug: text("slug").notNull(),
		name: text("name").notNull(),
		shortDescription: text("short_description").notNull().default(""),
		description: text("description").notNull().default(""),
		category: text("category").notNull(),
		imageUrl: text("image_url").notNull(),
		status: productStatus("status").notNull().default("draft"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [uniqueIndex("products_slug_unique").on(table.slug)],
);

/** One product can have many weights, bundles or future regional variants. */
export const productVariants = pgTable(
	"product_variants",
	{
		id: serial("id").primaryKey(),
		productId: integer("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		sku: text("sku").notNull(),
		title: text("title").notNull(),
		priceCents: integer("price_cents").notNull(),
		currency: text("currency").notNull().default("USD"),
		weightGrams: integer("weight_grams"),
		attributes: jsonb("attributes").notNull().default({}),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("product_variants_sku_unique").on(table.sku),
		uniqueIndex("product_variants_product_title_unique").on(
			table.productId,
			table.title,
		),
	],
);

/** Current availability is read from this table; inventory movements provide auditability. */
export const inventoryLevels = pgTable("inventory_levels", {
	variantId: integer("variant_id")
		.primaryKey()
		.references(() => productVariants.id, { onDelete: "cascade" }),
	availableQuantity: integer("available_quantity").notNull().default(0),
	reservedQuantity: integer("reserved_quantity").notNull().default(0),
	reorderPoint: integer("reorder_point").notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const inventoryMovements = pgTable(
	"inventory_movements",
	{
		id: serial("id").primaryKey(),
		variantId: integer("variant_id")
			.notNull()
			.references(() => productVariants.id),
		type: inventoryMovementType("type").notNull(),
		quantityDelta: integer("quantity_delta").notNull(),
		reference: text("reference"),
		note: text("note"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("inventory_movements_variant_created_idx").on(
			table.variantId,
			table.createdAt,
		),
	],
);

/** Orders are payment-provider agnostic until Stripe is added. */
export const orders = pgTable(
	"orders",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		orderNumber: text("order_number").notNull(),
		profileId: integer("profile_id").references(() => profiles.id, {
			onDelete: "set null",
		}),
		email: text("email").notNull(),
		status: orderStatus("status").notNull().default("pending"),
		currency: text("currency").notNull().default("USD"),
		subtotalCents: integer("subtotal_cents").notNull().default(0),
		discountCents: integer("discount_cents").notNull().default(0),
		shippingCents: integer("shipping_cents").notNull().default(0),
		taxCents: integer("tax_cents").notNull().default(0),
		totalCents: integer("total_cents").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("orders_order_number_unique").on(table.orderNumber),
		index("orders_profile_created_idx").on(table.profileId, table.createdAt),
	],
);

export const orderItems = pgTable("order_items", {
	id: serial("id").primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	variantId: integer("variant_id").references(() => productVariants.id, {
		onDelete: "set null",
	}),
	sku: text("sku").notNull(),
	productName: text("product_name").notNull(),
	variantTitle: text("variant_title").notNull(),
	unitPriceCents: integer("unit_price_cents").notNull(),
	quantity: integer("quantity").notNull(),
	lineTotalCents: integer("line_total_cents").notNull(),
});

/** Immutable delivery snapshot so historical orders never change with a profile edit. */
export const orderAddresses = pgTable("order_addresses", {
	id: serial("id").primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	recipientName: text("recipient_name").notNull(),
	phoneNumber: text("phone_number"),
	addressLine1: text("address_line_1").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	postalCode: text("postal_code").notNull(),
	country: text("country").notNull(),
});

/**
 * A provider-neutral payment record. Razorpay identifiers are stored for
 * reconciliation, while the order remains the source of fulfilment truth.
 */
export const payments = pgTable(
	"payments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		orderId: uuid("order_id")
			.notNull()
			.references(() => orders.id, { onDelete: "cascade" }),
		provider: paymentProvider("provider").notNull().default("razorpay"),
		providerOrderId: text("provider_order_id").notNull(),
		providerPaymentId: text("provider_payment_id"),
		status: paymentStatus("status").notNull().default("created"),
		amountCents: integer("amount_cents").notNull(),
		currency: text("currency").notNull().default("INR"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		paidAt: timestamp("paid_at", { withTimezone: true }),
	},
	(table) => [
		uniqueIndex("payments_provider_order_unique").on(
			table.provider,
			table.providerOrderId,
		),
		uniqueIndex("payments_provider_payment_unique").on(
			table.provider,
			table.providerPaymentId,
		),
	],
);
