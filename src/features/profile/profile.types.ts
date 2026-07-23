export type AppProfileRole = "admin" | "user";

export type ProfileFormInput = {
	firstName: string;
	lastName: string;
	addressLine1: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
};

export type ProfileRecord = ProfileFormInput & {
	clerkUserId: string;
	role: AppProfileRole;
	email: string;
	imageUrl: string | null;
	phoneNumber: string | null;
	phoneVerifiedAt: string | null;
	updatedAt: string;
};
