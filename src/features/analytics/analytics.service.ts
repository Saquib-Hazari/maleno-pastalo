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

export class AnalyticsService {
	constructor(private readonly repository = new AnalyticsRepository()) {}

	async adminDashboard() {
		const [rows, paidRows, profiles] = await Promise.all([
			this.repository.listOrders(),
			this.repository.listPaidOrderIds(),
			this.repository.countProfiles(),
		]);
		const paidOrderIds = new Set(paidRows.map((row) => row.orderId));
		const orders = groupOrders(rows);
		const paidOrders = orders.filter((order) => paidOrderIds.has(order.id));
		const totalRevenueCents = paidOrders.reduce(
			(total, order) => total + order.totalCents,
			0,
		);
		return {
			orders,
			revenueData: monthBuckets(paidOrders),
			metrics: {
				totalRevenueCents,
				paidOrders: paidOrders.length,
				newCustomers: new Set(orders.map((order) => order.email)).size,
				profiles: profiles.length,
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
