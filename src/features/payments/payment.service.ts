import { PaymentRepository } from "./payment.repository";
import type {
	CreatePaymentInput,
	RazorpayCheckoutOrder,
} from "./payment.types";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const RAZORPAY_PAYMENTS_URL = "https://api.razorpay.com/v1/payments";

function razorpayCredentials() {
	const keyId = process.env.VITE_RAZORPAY_KEY_ID;
	const keySecret = process.env.RAZORPAY_KEY_SECRET;
	if (!keyId || !keySecret)
		throw new Error("Razorpay test keys are not configured on the server.");
	return { keyId, keySecret };
}

function basicAuth(keyId: string, keySecret: string) {
	return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

async function hmacSha256(message: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(message),
	);
	return Array.from(new Uint8Array(signature), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

function cleanInput(input: CreatePaymentInput) {
	const email = input.email.trim().toLowerCase();
	if (!/^\S+@\S+\.\S+$/.test(email))
		throw new Error("Enter a valid email address.");
	for (const [label, value] of Object.entries({
		"Full name": input.fullName,
		Address: input.addressLine1,
		City: input.city,
		State: input.state,
		"Postal code": input.postalCode,
		Country: input.country,
	})) {
		if (!value.trim()) throw new Error(`${label} is required.`);
	}
	if (!input.items.length) throw new Error("Your basket is empty.");
	const quantities = new Map<number, number>();
	for (const item of input.items) {
		if (
			!Number.isInteger(item.variantId) ||
			!Number.isInteger(item.quantity) ||
			item.quantity < 1
		)
			throw new Error("Invalid basket item.");
		quantities.set(
			item.variantId,
			(quantities.get(item.variantId) ?? 0) + item.quantity,
		);
	}
	return {
		...input,
		email,
		items: [...quantities].map(([variantId, quantity]) => ({
			variantId,
			quantity,
		})),
	};
}

export class PaymentService {
	constructor(private readonly repository = new PaymentRepository()) {}

	private async finalizeAndSendReceipt(input: {
		providerOrderId: string;
		providerPaymentId: string;
		orderId: string;
	}) {
		const finalized = await this.repository.finalizePaidOrder({
			providerOrderId: input.providerOrderId,
			providerPaymentId: input.providerPaymentId,
		});
		if (!finalized.inventory_available)
			throw new Error(
				"This item sold out while your payment was processing. Please contact support for help with your payment.",
			);
		if (!finalized.paid_count) {
			const latest = await this.repository.findPayment(input.providerOrderId);
			if (latest?.status === "paid")
				return { orderId: latest.orderId, alreadyVerified: true };
			throw new Error(
				"We could not finalize this payment. Please contact support.",
			);
		}
		try {
			const { OrderEmailService } = await import("./order-email.service");
			await new OrderEmailService().sendConfirmation(input.orderId);
		} catch (error) {
			// Payment confirmation is never rolled back because an email provider is unavailable.
			console.error("Order confirmation email failed", error);
		}
		return { orderId: input.orderId, alreadyVerified: false };
	}

	async createRazorpayOrder(
		input: CreatePaymentInput,
	): Promise<RazorpayCheckoutOrder> {
		const cleaned = cleanInput(input);
		const variants = await this.repository.findCheckoutVariants(
			cleaned.items.map((item) => item.variantId),
		);
		if (variants.length !== cleaned.items.length)
			throw new Error("One or more pasta selections are no longer available.");
		const items = cleaned.items.map((item) => {
			const variant = variants.find(
				(candidate) => candidate.variantId === item.variantId,
			);
			if (!variant || (variant.availableQuantity ?? 0) < item.quantity)
				throw new Error("One of your selected pasta shapes is sold out.");
			return { ...variant, quantity: item.quantity };
		});
		const subtotalCents = items.reduce(
			(total, item) => total + item.unitPriceCents * item.quantity,
			0,
		);
		const shippingCents = cleaned.shippingMethod === "express" ? 890 : 0;
		const totalCents = subtotalCents + shippingCents;
		const orderNumber = `MP-${Date.now()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
		const { keyId, keySecret } = razorpayCredentials();
		const response = await fetch(RAZORPAY_ORDERS_URL, {
			method: "POST",
			headers: {
				Authorization: basicAuth(keyId, keySecret),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: totalCents,
				currency: "INR",
				receipt: orderNumber,
				notes: { order_number: orderNumber, environment: "showcase-test" },
			}),
		});
		if (!response.ok) {
			const reason = await response.text();
			throw new Error(`Razorpay could not create the payment order: ${reason}`);
		}
		const razorpayOrder = (await response.json()) as {
			id: string;
			amount: number;
			currency: string;
		};
		await this.repository.createPendingOrder({
			orderNumber,
			providerOrderId: razorpayOrder.id,
			email: cleaned.email,
			shippingCents,
			subtotalCents,
			totalCents,
			address: {
				recipientName: cleaned.fullName.trim(),
				phoneNumber: cleaned.phoneNumber?.trim() || undefined,
				addressLine1: cleaned.addressLine1.trim(),
				city: cleaned.city.trim(),
				state: cleaned.state.trim(),
				postalCode: cleaned.postalCode.trim(),
				country: cleaned.country.trim(),
			},
			items: items.map((item) => ({
				variantId: item.variantId,
				sku: item.sku,
				productName: item.productName,
				variantTitle: item.variantTitle,
				unitPriceCents: item.unitPriceCents,
				quantity: item.quantity,
			})),
		});
		return {
			keyId,
			providerOrderId: razorpayOrder.id,
			amount: razorpayOrder.amount,
			currency: "INR",
			orderNumber,
		};
	}

	async verifyRazorpayPayment(input: {
		razorpayOrderId: string;
		razorpayPaymentId: string;
		razorpaySignature: string;
	}) {
		const { keyId, keySecret } = razorpayCredentials();
		const payment = await this.repository.findPayment(input.razorpayOrderId);
		if (!payment) throw new Error("We could not find that payment order.");
		if (payment.status === "paid")
			return { orderId: payment.orderId, alreadyVerified: true };
		const expectedSignature = await hmacSha256(
			`${input.razorpayOrderId}|${input.razorpayPaymentId}`,
			keySecret,
		);
		if (expectedSignature !== input.razorpaySignature)
			throw new Error("Payment signature verification failed.");
		const response = await fetch(
			`${RAZORPAY_PAYMENTS_URL}/${input.razorpayPaymentId}`,
			{
				headers: { Authorization: basicAuth(keyId, keySecret) },
			},
		);
		if (!response.ok)
			throw new Error("Razorpay payment confirmation could not be retrieved.");
		const razorpayPayment = (await response.json()) as {
			order_id: string;
			amount: number;
			currency: string;
			status: string;
		};
		if (
			razorpayPayment.order_id !== input.razorpayOrderId ||
			razorpayPayment.amount !== payment.amountCents ||
			razorpayPayment.currency !== "INR" ||
			!["authorized", "captured"].includes(razorpayPayment.status)
		) {
			throw new Error("Razorpay did not confirm this payment.");
		}
		return this.finalizeAndSendReceipt({
			providerOrderId: input.razorpayOrderId,
			providerPaymentId: input.razorpayPaymentId,
			orderId: payment.orderId,
		});
	}

	async confirmWebhookPayment(input: {
		providerOrderId: string;
		providerPaymentId: string;
		amountCents: number;
		currency: string;
		status: string;
	}) {
		const payment = await this.repository.findPayment(input.providerOrderId);
		if (!payment) return { ignored: true };
		if (payment.status === "paid")
			return { ignored: false, alreadyVerified: true };
		if (
			input.amountCents !== payment.amountCents ||
			input.currency !== "INR" ||
			!["authorized", "captured"].includes(input.status)
		)
			throw new Error(
				"Razorpay webhook payment details did not match the order.",
			);
		const result = await this.finalizeAndSendReceipt({
			providerOrderId: input.providerOrderId,
			providerPaymentId: input.providerPaymentId,
			orderId: payment.orderId,
		});
		return { ignored: false, ...result };
	}
}
