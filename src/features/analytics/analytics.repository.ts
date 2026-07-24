import { neon } from "@neondatabase/serverless";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
	orderAddresses,
	orderItems,
	orders,
	payments,
	profiles,
} from "../../db/schema";

function database() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error("DATABASE_URL is not configured.");
	return drizzle(neon(connectionString));
}

export class AnalyticsRepository {
	async listOrders(email?: string) {
		const query = database()
			.select({
				id: orders.id,
				orderNumber: orders.orderNumber,
				email: orders.email,
				status: orders.status,
				totalCents: orders.totalCents,
				currency: orders.currency,
				createdAt: orders.createdAt,
				productName: orderItems.productName,
				itemQuantity: orderItems.quantity,
				addressLine1: orderAddresses.addressLine1,
				city: orderAddresses.city,
				state: orderAddresses.state,
				postalCode: orderAddresses.postalCode,
			})
			.from(orders)
			.leftJoin(orderItems, eq(orderItems.orderId, orders.id))
			.leftJoin(orderAddresses, eq(orderAddresses.orderId, orders.id))
			.orderBy(desc(orders.createdAt));
		return email ? query.where(eq(orders.email, email)) : query;
	}

	async listPaidOrderIds() {
		return database()
			.select({ orderId: payments.orderId })
			.from(payments)
			.where(eq(payments.status, "paid"));
	}

	async countProfiles() {
		return database().select({ id: profiles.id }).from(profiles);
	}

	async listProfiles() {
		return database()
			.select({
				email: profiles.email,
				firstName: profiles.firstName,
				lastName: profiles.lastName,
				phoneNumber: profiles.phoneNumber,
				imageUrl: profiles.imageUrl,
				city: profiles.city,
				state: profiles.state,
				country: profiles.country,
				createdAt: profiles.createdAt,
			})
			.from(profiles)
			.orderBy(desc(profiles.createdAt));
	}
}
