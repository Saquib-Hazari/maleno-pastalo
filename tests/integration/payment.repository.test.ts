import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const transaction = vi.fn();
	const query = vi.fn();
	const neon = vi.fn(() => ({ transaction }));
	return { neon, query, transaction };
});

vi.mock("@neondatabase/serverless", () => ({ neon: mocks.neon }));

import { PaymentRepository } from "../../src/features/payments/payment.repository";

describe("PaymentRepository database boundary", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		mocks.neon.mockClear();
		mocks.transaction.mockReset();
		mocks.query.mockReset();
	});

	it("uses one serializable Neon transaction to finalize stock, payment and order", async () => {
		vi.stubEnv("DATABASE_URL", "postgresql://test.example/database");
		mocks.transaction.mockImplementation(async (factory, options) => {
			factory(mocks.query);
			expect(options).toEqual({ isolationLevel: "Serializable" });
			return [[{ pending_count: 1, inventory_available: true, paid_count: 1 }]];
		});

		await expect(
			new PaymentRepository().finalizePaidOrder({
				providerOrderId: "order_test",
				providerPaymentId: "pay_test",
			}),
		).resolves.toEqual({
			pending_count: 1,
			inventory_available: true,
			paid_count: 1,
		});
		expect(mocks.neon).toHaveBeenCalledWith("postgresql://test.example/database");
		expect(mocks.transaction).toHaveBeenCalledTimes(1);
		expect(mocks.query).toHaveBeenCalledTimes(1);
	});
});
