import { AnalyticsRepository } from "./analytics.repository";

export type LiveOrder = {
	id: string;
	orderNumber: string;
	email: string;
	status: string;
	totalCents: number;
	currency: string;
	createdAt: string;
	itemCount: number;
	items: Array<{ name: string; quantity: number }>;
	deliveryAddress: string | null;
};

export type AdminCustomer = {
	email: string;
	name: string;
	phoneNumber: string | null;
	imageUrl: string | null;
	location: string | null;
	registeredAt: string | null;
	lastOrderAt: string | null;
	orderCount: number;
	paidOrderCount: number;
	totalSpentCents: number;
	averageOrderValueCents: number;
	segment: "Prospect" | "New" | "Repeat";
};

export type AdminDashboardData = {
	orders: LiveOrder[];
	customers: AdminCustomer[];
	revenueData: Array<{ month: string; revenue: number }>;
	orderStatusData: Array<{ status: string; orders: number }>;
	customerGrowthData: Array<{ month: string; customers: number }>;
	metrics: {
		totalRevenueCents: number;
		paidOrders: number;
		newCustomers: number;
		profiles: number;
		averageOrderValueCents: number;
		repeatCustomers: number;
		pendingOrders: number;
		confirmedOrders: number;
	};
	updatedAt: string;
};

function groupOrders(
	rows: Awaited<ReturnType<AnalyticsRepository["listOrders"]>>,
): LiveOrder[] {
	const grouped = new Map<string, LiveOrder>();
	for (const row of rows) {
		const existing = grouped.get(row.id);
		if (existing) {
			existing.itemCount += row.itemQuantity ?? 0;
			if (row.productName && row.itemQuantity) {
				existing.items.push({
					name: row.productName,
					quantity: row.itemQuantity,
				});
			}
			continue;
		}
		grouped.set(row.id, {
			id: row.id,
			orderNumber: row.orderNumber,
			email: row.email,
			status: row.status,
			totalCents: row.totalCents,
			currency: row.currency,
			createdAt: row.createdAt.toISOString(),
			itemCount: row.itemQuantity ?? 0,
			items:
				row.productName && row.itemQuantity
					? [{ name: row.productName, quantity: row.itemQuantity }]
					: [],
			deliveryAddress: row.addressLine1
				? [row.addressLine1, row.city, row.state, row.postalCode]
						.filter(Boolean)
						.join(", ")
				: null,
		});
	}
	return [...grouped.values()];
}

function monthBuckets(orders: LiveOrder[]) {
	const buckets = Array.from({ length: 6 }, (_, index) => {
		const date = new Date();
		date.setMonth(date.getMonth() - (5 - index), 1);
		return {
			key: `${date.getFullYear()}-${date.getMonth()}`,
			month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
			revenue: 0,
		};
	});
	for (const order of orders) {
		if (order.status === "pending" || order.status === "cancelled") continue;
		const date = new Date(order.createdAt);
		const bucket = buckets.find(
			(candidate) =>
				candidate.key === `${date.getFullYear()}-${date.getMonth()}`,
		);
		if (bucket) bucket.revenue += order.totalCents / 100;
	}
	return buckets.map(({ month, revenue }) => ({ month, revenue }));
}

function weekBuckets(orders: LiveOrder[]) {
	const now = new Date();
	return Array.from({ length: 4 }, (_, index) => {
		const end = new Date(now);
		end.setDate(now.getDate() - index * 7);
		const start = new Date(end);
		start.setDate(end.getDate() - 7);
		const meals = orders
			.filter((order) => {
				const date = new Date(order.createdAt);
				return order.status !== "pending" && date >= start && date < end;
			})
			.reduce((total, order) => total + order.itemCount, 0);
		return { week: `W${4 - index}`, meals };
	}).reverse();
}

function customerGrowthBuckets(customers: AdminCustomer[]) {
	const buckets = Array.from({ length: 6 }, (_, index) => {
		const date = new Date();
		date.setMonth(date.getMonth() - (5 - index), 1);
		return {
			key: `${date.getFullYear()}-${date.getMonth()}`,
			month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
			customers: 0,
		};
	});
	for (const customer of customers) {
		const date = new Date(customer.registeredAt ?? customer.lastOrderAt ?? 0);
		if (Number.isNaN(date.getTime())) continue;
		const bucket = buckets.find(
			(candidate) =>
				candidate.key === `${date.getFullYear()}-${date.getMonth()}`,
		);
		if (bucket) bucket.customers += 1;
	}
	return buckets.map(({ month, customers }) => ({ month, customers }));
}

function buildCustomers(
	orders: LiveOrder[],
	paidOrderIds: Set<string>,
	profiles: Awaited<ReturnType<AnalyticsRepository["listProfiles"]>>,
): AdminCustomer[] {
	const profileByEmail = new Map(
		profiles.map((profile) => [profile.email.toLowerCase(), profile]),
	);
	const ordersByEmail = new Map<string, LiveOrder[]>();
	for (const order of orders) {
		const email = order.email.toLowerCase();
		ordersByEmail.set(email, [...(ordersByEmail.get(email) ?? []), order]);
	}
	const emails = new Set([...profileByEmail.keys(), ...ordersByEmail.keys()]);
	return [...emails]
		.map((email) => {
			const profile = profileByEmail.get(email);
			const customerOrders = ordersByEmail.get(email) ?? [];
			const paidOrders = customerOrders.filter((order) =>
				paidOrderIds.has(order.id),
			);
			const totalSpentCents = paidOrders.reduce(
				(total, order) => total + order.totalCents,
				0,
			);
			const latest = [...customerOrders].sort(
				(a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
			)[0];
			const name = [profile?.firstName, profile?.lastName]
				.filter(Boolean)
				.join(" ");
			const location = [profile?.city, profile?.state, profile?.country]
				.filter(Boolean)
				.join(", ");
			const segment: AdminCustomer["segment"] =
				paidOrders.length > 1
					? "Repeat"
					: paidOrders.length === 1
						? "New"
						: "Prospect";
			return {
				email,
				name: name || "Guest customer",
				phoneNumber: profile?.phoneNumber ?? null,
				imageUrl: profile?.imageUrl ?? null,
				location: location || null,
				registeredAt: profile?.createdAt?.toISOString() ?? null,
				lastOrderAt: latest?.createdAt ?? null,
				orderCount: customerOrders.length,
				paidOrderCount: paidOrders.length,
				totalSpentCents,
				averageOrderValueCents: paidOrders.length
					? Math.round(totalSpentCents / paidOrders.length)
					: 0,
				segment,
			};
		})
		.sort((a, b) => b.totalSpentCents - a.totalSpentCents);
}

export class AnalyticsService {
	constructor(private readonly repository = new AnalyticsRepository()) {}

	async adminDashboard(): Promise<AdminDashboardData> {
		const [rows, paidRows, profiles] = await Promise.all([
			this.repository.listOrders(),
			this.repository.listPaidOrderIds(),
			this.repository.listProfiles(),
		]);
		const paidOrderIds = new Set(paidRows.map((row) => row.orderId));
		const orders = groupOrders(rows);
		const paidOrders = orders.filter((order) => paidOrderIds.has(order.id));
		const totalRevenueCents = paidOrders.reduce(
			(total, order) => total + order.totalCents,
			0,
		);
		const customers = buildCustomers(orders, paidOrderIds, profiles);
		const orderStatusData = [
			"pending",
			"confirmed",
			"processing",
			"fulfilled",
			"cancelled",
			"refunded",
		]
			.map((status) => ({
				status: status.charAt(0).toUpperCase() + status.slice(1),
				orders: orders.filter((order) => order.status === status).length,
			}))
			.filter((item) => item.orders > 0);
		return {
			orders,
			customers,
			revenueData: monthBuckets(paidOrders),
			orderStatusData,
			customerGrowthData: customerGrowthBuckets(customers),
			metrics: {
				totalRevenueCents,
				paidOrders: paidOrders.length,
				newCustomers: customers.length,
				profiles: profiles.length,
				averageOrderValueCents: paidOrders.length
					? Math.round(totalRevenueCents / paidOrders.length)
					: 0,
				repeatCustomers: customers.filter(
					(customer) => customer.segment === "Repeat",
				).length,
				pendingOrders: orders.filter((order) => order.status === "pending")
					.length,
				confirmedOrders: orders.filter((order) => order.status === "confirmed")
					.length,
			},
			updatedAt: new Date().toISOString(),
		};
	}

	async customerDashboard(email: string) {
		const orders = groupOrders(await this.repository.listOrders(email));
		return {
			orders,
			weeklyMeals: weekBuckets(orders),
			updatedAt: new Date().toISOString(),
		};
	}
}
