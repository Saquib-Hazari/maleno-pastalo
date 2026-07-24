import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentRepository } from "../../src/features/payments/payment.repository";
import { PaymentService } from "../../src/features/payments/payment.service";

const sendConfirmation = vi.fn();

vi.mock("../../src/features/payments/order-email.service", () => ({
	OrderEmailService: class {
		sendConfirmation = sendConfirmation;
	},
}));

function repositoryStub(overrides: Partial<PaymentRepository> = {}) {
	return {
		findCheckoutVariants: vi.fn(),
		createPendingOrder: vi.fn(),
		findPayment: vi.fn(),
		finalizePaidOrder: vi.fn(),
		...overrides,
	} as unknown as PaymentRepository;
}

async function signature(message: string, secret: string) {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const bytes = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(message),
	);
	return Array.from(new Uint8Array(bytes), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

describe("PaymentService", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_RAZORPAY_KEY_ID", "rzp_test_key");
		vi.stubEnv("RAZORPAY_KEY_SECRET", "test-secret");
		vi.stubGlobal("fetch", vi.fn());
		sendConfirmation.mockReset();
	});

	afterEach(() => vi.unstubAllEnvs());

	it("rejects malformed checkout data before creating a provider order", async () => {
		const repository = repositoryStub();
		const service = new PaymentService(repository);

		await expect(
			service.createRazorpayOrder({
				email: "not-an-email",
				fullName: "A customer",
				addressLine1: "1 Pasta Street",
				city: "Mumbai",
				state: "Maharashtra",
				postalCode: "400001",
				country: "India",
				items: [{ variantId: 2, quantity: 1 }],
				shippingMethod: "standard",
			}),
		).rejects.toThrow("valid email");
		expect(repository.findCheckoutVariants).not.toHaveBeenCalled();
	});

	it("calculates the amount from trusted catalogue prices, not browser input", async () => {
		const repository = repositoryStub({
			findCheckoutVariants: vi.fn().mockResolvedValue([
				{
					variantId: 2,
					sku: "MP-PENNE-500",
					variantTitle: "500g",
					unitPriceCents: 1400,
					productName: "Penne Rigate",
					availableQuantity: 8,
				},
			]),
		});
		vi.mocked(fetch).mockResolvedValue(
			new Response(
				JSON.stringify({ id: "order_test", amount: 3690, currency: "INR" }),
				{ status: 200 },
			),
		);
		const service = new PaymentService(repository);

		const result = await service.createRazorpayOrder({
			email: "buyer@example.com",
			fullName: "A customer",
			addressLine1: "1 Pasta Street",
			city: "Mumbai",
			state: "Maharashtra",
			postalCode: "400001",
			country: "India",
			items: [{ variantId: 2, quantity: 2 }],
			shippingMethod: "express",
		});

		expect(result.amount).toBe(3690);
		expect(repository.createPendingOrder).toHaveBeenCalledWith(
			expect.objectContaining({ subtotalCents: 2800, shippingCents: 890 }),
		);
	});

	it("rejects a forged Razorpay signature before contacting Razorpay", async () => {
		const repository = repositoryStub({
			findPayment: vi.fn().mockResolvedValue({
				orderId: "order-1",
				status: "created",
				amountCents: 1400,
			}),
		});
		const service = new PaymentService(repository);

		await expect(
			service.verifyRazorpayPayment({
				razorpayOrderId: "order_test",
				razorpayPaymentId: "pay_test",
				razorpaySignature: "forged",
			}),
		).rejects.toThrow("signature verification failed");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("treats a duplicate verified payment as idempotent", async () => {
		const repository = repositoryStub({
			findPayment: vi.fn().mockResolvedValue({
				orderId: "order-1",
				status: "paid",
				amountCents: 1400,
			}),
		});
		const service = new PaymentService(repository);

		await expect(
			service.verifyRazorpayPayment({
				razorpayOrderId: "order_test",
				razorpayPaymentId: "pay_test",
				razorpaySignature: "unused",
			}),
		).resolves.toEqual({ orderId: "order-1", alreadyVerified: true });
		expect(repository.finalizePaidOrder).not.toHaveBeenCalled();
	});

	it("finalizes a signed captured payment exactly once", async () => {
		const repository = repositoryStub({
			findPayment: vi.fn().mockResolvedValue({
				orderId: "order-1",
				status: "created",
				amountCents: 1400,
			}),
			finalizePaidOrder: vi.fn().mockResolvedValue({
				inventory_available: true,
				paid_count: 1,
				pending_count: 1,
			}),
		});
		vi.mocked(fetch).mockResolvedValue(
			new Response(
				JSON.stringify({
					order_id: "order_test",
					amount: 1400,
					currency: "INR",
					status: "captured",
				}),
				{ status: 200 },
			),
		);
		const service = new PaymentService(repository);
		const razorpaySignature = await signature(
			"order_test|pay_test",
			"test-secret",
		);

		await expect(
			service.verifyRazorpayPayment({
				razorpayOrderId: "order_test",
				razorpayPaymentId: "pay_test",
				razorpaySignature,
			}),
		).resolves.toEqual({ orderId: "order-1", alreadyVerified: false });
		expect(repository.finalizePaidOrder).toHaveBeenCalledTimes(1);
		expect(sendConfirmation).toHaveBeenCalledWith("order-1");
	});
});
