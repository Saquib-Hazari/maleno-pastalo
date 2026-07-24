import { createFileRoute } from "@tanstack/react-router";

function hex(bytes: ArrayBuffer) {
	return Array.from(new Uint8Array(bytes), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

async function signatureFor(body: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return hex(
		await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
	);
}

function secureEqual(left: string, right: string) {
	if (left.length !== right.length) return false;
	let difference = 0;
	for (let index = 0; index < left.length; index += 1)
		difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
	return difference === 0;
}

type RazorpayWebhook = {
	event?: string;
	payload?: {
		payment?: {
			entity?: {
				id?: string;
				order_id?: string;
				amount?: number;
				currency?: string;
				status?: string;
			};
		};
	};
};

export const Route = createFileRoute("/api/razorpay-webhook")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
				if (!secret)
					return Response.json(
						{ error: "Webhook is not configured." },
						{ status: 503 },
					);
				const signature = request.headers.get("x-razorpay-signature");
				const rawBody = await request.text();
				if (
					!signature ||
					!secureEqual(signature, await signatureFor(rawBody, secret))
				)
					return Response.json(
						{ error: "Invalid webhook signature." },
						{ status: 401 },
					);
				let webhook: RazorpayWebhook;
				try {
					webhook = JSON.parse(rawBody) as RazorpayWebhook;
				} catch {
					return Response.json(
						{ error: "Invalid webhook payload." },
						{ status: 400 },
					);
				}
				if (!["payment.captured", "order.paid"].includes(webhook.event ?? ""))
					return Response.json({ received: true, ignored: true });
				const payment = webhook.payload?.payment?.entity;
				if (!payment?.id || !payment.order_id || payment.currency !== "INR")
					return Response.json(
						{ error: "Incomplete payment webhook." },
						{ status: 400 },
					);
				try {
					const { PaymentService } = await import(
						"../../features/payments/payment.service"
					);
					const result = await new PaymentService().confirmWebhookPayment({
						providerOrderId: payment.order_id,
						providerPaymentId: payment.id,
						amountCents: payment.amount ?? 0,
						currency: payment.currency,
						status: payment.status ?? "",
					});
					return Response.json({ received: true, ...result });
				} catch (error) {
					console.error("Razorpay webhook processing failed", error);
					return Response.json(
						{ error: "Webhook could not be processed." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
