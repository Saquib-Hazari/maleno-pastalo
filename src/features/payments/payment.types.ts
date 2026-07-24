export type CheckoutItemInput = { variantId: number; quantity: number };

export type CheckoutAddress = {
	email: string;
	fullName: string;
	phoneNumber?: string;
	addressLine1: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
};

export type CreatePaymentInput = CheckoutAddress & {
	items: CheckoutItemInput[];
	shippingMethod: "standard" | "express";
};

export type RazorpayCheckoutOrder = {
	keyId: string;
	providerOrderId: string;
	amount: number;
	currency: "INR";
	orderNumber: string;
};
