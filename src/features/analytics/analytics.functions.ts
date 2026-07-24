import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "saquibhazari1000@gmail.com";

async function currentUser() {
	const session = await auth();
	if (!session.userId)
		throw new Error("Please sign in to view dashboard data.");
	const user = await clerkClient().users.getUser(session.userId);
	const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
	if (!email) throw new Error("A primary email address is required.");
	return { email, isAdmin: email === ADMIN_EMAIL };
}

export const getAdminDashboardData = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await currentUser();
		if (!user.isAdmin) throw new Error("Administrator access is required.");
		const { AnalyticsService } = await import("./analytics.service");
		return new AnalyticsService().adminDashboard();
	},
);

export const getMyDashboardData = createServerFn({ method: "GET" }).handler(
	async () => {
		const user = await currentUser();
		const { AnalyticsService } = await import("./analytics.service");
		return new AnalyticsService().customerDashboard(user.email);
	},
);

function orderIdInput(data: unknown) {
	if (
		!data ||
		typeof data !== "object" ||
		typeof (data as { orderId?: unknown }).orderId !== "string"
	) {
		throw new Error("Invalid order request.");
	}
	return { orderId: (data as { orderId: string }).orderId };
}

export const getMyOrderDetails = createServerFn({ method: "POST" })
	.validator(orderIdInput)
	.handler(async ({ data }) => {
		const user = await currentUser();
		const { AnalyticsService } = await import("./analytics.service");
		const order = (
			await new AnalyticsService().customerDashboard(user.email)
		).orders.find((candidate) => candidate.id === data.orderId);
		if (!order)
			throw new Error("We could not find this order in your account.");
		return order;
	});

export const resendMyOrderEmail = createServerFn({ method: "POST" })
	.validator(orderIdInput)
	.handler(async ({ data }) => {
		const user = await currentUser();
		const { AnalyticsService } = await import("./analytics.service");
		const order = (
			await new AnalyticsService().customerDashboard(user.email)
		).orders.find((candidate) => candidate.id === data.orderId);
		if (!order)
			throw new Error("We could not find this order in your account.");
		const { OrderEmailService } = await import(
			"../payments/order-email.service"
		);
		await new OrderEmailService().sendConfirmation(order.id);
		return { sent: true };
	});
