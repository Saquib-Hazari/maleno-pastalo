import { createServerFn } from "@tanstack/react-start";
import { getSessionAccess } from "../../lib/auth";
import type { CreatePaymentInput } from "./payment.types";

function createPaymentInput(data: unknown) {
	if (!data || typeof data !== "object")
		throw new Error("Invalid checkout request.");
	return data as CreatePaymentInput;
}

function paymentVerificationInput(data: unknown) {
	if (!data || typeof data !== "object")
		throw new Error("Invalid payment verification.");
	const candidate = data as Record<string, unknown>;
	if (
		typeof candidate.razorpayOrderId !== "string" ||
		typeof candidate.razorpayPaymentId !== "string" ||
		typeof candidate.razorpaySignature !== "string"
	)
		throw new Error("Invalid payment verification.");
	return candidate as {
		razorpayOrderId: string;
		razorpayPaymentId: string;
		razorpaySignature: string;
	};
}

export const createRazorpayCheckout = createServerFn({ method: "POST" })
	.validator(createPaymentInput)
	.handler(async ({ data }) => {
		const access = await getSessionAccess();
		if (!access.userId) throw new Error("Please sign in before checkout.");
		const { PaymentService } = await import("./payment.service");
		return new PaymentService().createRazorpayOrder(data);
	});

export const verifyRazorpayCheckout = createServerFn({ method: "POST" })
	.validator(paymentVerificationInput)
	.handler(async ({ data }) => {
		const access = await getSessionAccess();
		if (!access.userId) throw new Error("Please sign in before checkout.");
		const { PaymentService } = await import("./payment.service");
		return new PaymentService().verifyRazorpayPayment(data);
	});
