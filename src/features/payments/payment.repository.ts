import { neon } from "@neondatabase/serverless";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
	inventoryLevels,
	inventoryMovements,
	orderAddresses,
	orderItems,
	orders,
	payments,
	products,
	productVariants,
} from "../../db/schema";

function database() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not configured.");
	return drizzle(neon(connectionString));
}

export class PaymentRepository {
	async findCheckoutVariants(variantIds: number[]) {
		return database()
			.select({
				variantId: productVariants.id,
				sku: productVariants.sku,
				variantTitle: productVariants.title,
				unitPriceCents: productVariants.priceCents,
				productName: products.name,
				availableQuantity: inventoryLevels.availableQuantity,
			})
			.from(productVariants)
			.innerJoin(products, eq(products.id, productVariants.productId))
			.leftJoin(
				inventoryLevels,
				eq(inventoryLevels.variantId, productVariants.id),
			)
			.where(
				and(
					inArray(productVariants.id, variantIds),
					eq(products.status, "active"),
					eq(productVariants.isActive, true),
				),
			);
	}

	async createPendingOrder(input: {
		orderNumber: string;
		providerOrderId: string;
		email: string;
		shippingCents: number;
		subtotalCents: number;
		totalCents: number;
		address: {
			recipientName: string;
			phoneNumber?: string;
			addressLine1: string;
			city: string;
			state: string;
			postalCode: string;
			country: string;
		};
		items: Array<{
			variantId: number;
			sku: string;
			productName: string;
			variantTitle: string;
			unitPriceCents: number;
			quantity: number;
		}>;
	}) {
		const [order] = await database()
			.insert(orders)
			.values({
				orderNumber: input.orderNumber,
				email: input.email,
				currency: "INR",
				subtotalCents: input.subtotalCents,
				shippingCents: input.shippingCents,
				totalCents: input.totalCents,
			})
			.returning({ id: orders.id });
		await database()
			.insert(orderItems)
			.values(
				input.items.map((item) => ({
					orderId: order.id,
					...item,
					lineTotalCents: item.unitPriceCents * item.quantity,
				})),
			);
		await database()
			.insert(orderAddresses)
			.values({ orderId: order.id, ...input.address });
		await database().insert(payments).values({
			orderId: order.id,
			provider: "razorpay",
			providerOrderId: input.providerOrderId,
			amountCents: input.totalCents,
			currency: "INR",
		});
		return order;
	}

	async findPayment(providerOrderId: string) {
		const [payment] = await database()
			.select({
				id: payments.id,
				orderId: payments.orderId,
				status: payments.status,
				amountCents: payments.amountCents,
			})
			.from(payments)
			.where(
				and(
					eq(payments.provider, "razorpay"),
					eq(payments.providerOrderId, providerOrderId),
				),
			);
		return payment;
	}

	async getOrderEmailData(orderId: string) {
		return database()
			.select({
				orderNumber: orders.orderNumber,
				email: orders.email,
				totalCents: orders.totalCents,
				createdAt: orders.createdAt,
				recipientName: orderAddresses.recipientName,
				addressLine1: orderAddresses.addressLine1,
				city: orderAddresses.city,
				state: orderAddresses.state,
				postalCode: orderAddresses.postalCode,
				country: orderAddresses.country,
				productName: orderItems.productName,
				quantity: orderItems.quantity,
				imageUrl: products.imageUrl,
			})
			.from(orders)
			.innerJoin(orderItems, eq(orderItems.orderId, orders.id))
			.leftJoin(orderAddresses, eq(orderAddresses.orderId, orders.id))
			.leftJoin(productVariants, eq(productVariants.id, orderItems.variantId))
			.leftJoin(products, eq(products.id, productVariants.productId))
			.where(eq(orders.id, orderId));
	}

	async markPaid(input: {
		providerOrderId: string;
		providerPaymentId: string;
	}) {
		await database()
			.update(payments)
			.set({
				status: "paid",
				providerPaymentId: input.providerPaymentId,
				paidAt: new Date(),
			})
			.where(eq(payments.providerOrderId, input.providerOrderId));
		await database()
			.update(orders)
			.set({ status: "confirmed", updatedAt: new Date() })
			.where(
				eq(
					orders.id,
					(await this.findPayment(input.providerOrderId))?.orderId ?? "",
				),
			);
	}

	/**
	 * Commits stock, payment and order state as one PostgreSQL transaction.
	 * The pending-payment row is locked, making retries from Checkout and a
	 * Razorpay webhook safely idempotent.
	 */
	async finalizePaidOrder(input: {
		providerOrderId: string;
		providerPaymentId: string;
	}) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) throw new Error("DATABASE_URL is not configured.");
		const sql = neon(connectionString);
		const [[result]] = await sql.transaction(
			(tx) => [
				tx`
					WITH pending AS (
						SELECT p.order_id
						FROM payments p
						WHERE p.provider = 'razorpay'
							AND p.provider_order_id = ${input.providerOrderId}
							AND p.status = 'created'
						FOR UPDATE
					), requested AS (
						SELECT oi.variant_id, oi.quantity
						FROM order_items oi
						JOIN pending p ON p.order_id = oi.order_id
						WHERE oi.variant_id IS NOT NULL
					), stock AS (
						SELECT r.variant_id, r.quantity, l.available_quantity
						FROM requested r
						JOIN inventory_levels l ON l.variant_id = r.variant_id
					), inventory_is_available AS (
						SELECT
							(SELECT count(*) FROM requested) = (SELECT count(*) FROM stock)
							AND COALESCE(bool_and(stock.available_quantity >= stock.quantity), false) AS ok
						FROM stock
					), decremented AS (
						UPDATE inventory_levels l
						SET available_quantity = l.available_quantity - stock.quantity,
							updated_at = now()
						FROM stock, pending, inventory_is_available availability
						WHERE l.variant_id = stock.variant_id AND availability.ok
						RETURNING l.variant_id
					), movements AS (
						INSERT INTO inventory_movements (variant_id, type, quantity_delta, reference, note)
						SELECT requested.variant_id, 'sale', -requested.quantity, pending.order_id,
							'Razorpay payment confirmed'
						FROM requested, pending, inventory_is_available availability
						WHERE availability.ok
					), paid AS (
						UPDATE payments p
						SET status = 'paid', provider_payment_id = ${input.providerPaymentId}, paid_at = now()
						FROM pending, inventory_is_available availability
						WHERE p.provider = 'razorpay'
							AND p.provider_order_id = ${input.providerOrderId}
							AND p.status = 'created'
							AND availability.ok
						RETURNING p.order_id
					), confirmed AS (
						UPDATE orders o
						SET status = 'confirmed', updated_at = now()
						FROM paid
						WHERE o.id = paid.order_id
					)
					SELECT
						(SELECT count(*)::int FROM pending) AS pending_count,
						COALESCE((SELECT ok FROM inventory_is_available), false) AS inventory_available,
						(SELECT count(*)::int FROM paid) AS paid_count;
				`,
			],
			{ isolationLevel: "Serializable" },
		);
		return result as {
			pending_count: number;
			inventory_available: boolean;
			paid_count: number;
		};
	}

	async reduceInventoryForOrder(orderId: string) {
		const items = await database()
			.select({
				variantId: orderItems.variantId,
				quantity: orderItems.quantity,
			})
			.from(orderItems)
			.where(eq(orderItems.orderId, orderId));
		for (const item of items) {
			if (!item.variantId) continue;
			const [level] = await database()
				.select({ availableQuantity: inventoryLevels.availableQuantity })
				.from(inventoryLevels)
				.where(eq(inventoryLevels.variantId, item.variantId));
			if (!level || level.availableQuantity < item.quantity)
				throw new Error("This item just sold out. Please try another pasta.");
			await database()
				.update(inventoryLevels)
				.set({
					availableQuantity: level.availableQuantity - item.quantity,
					updatedAt: new Date(),
				})
				.where(eq(inventoryLevels.variantId, item.variantId));
			await database().insert(inventoryMovements).values({
				variantId: item.variantId,
				type: "sale",
				quantityDelta: -item.quantity,
				reference: orderId,
				note: "Razorpay test payment confirmed",
			});
		}
	}
}
