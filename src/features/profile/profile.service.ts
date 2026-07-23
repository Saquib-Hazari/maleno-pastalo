import type { User } from "@clerk/backend";
import { clerkClient } from "@clerk/tanstack-react-start/server";
import { ProfileRepository } from "./profile.repository";
import type {
	AppProfileRole,
	ProfileFormInput,
	ProfileRecord,
} from "./profile.types";

const ADMIN_EMAIL = "saquibhazari1000@gmail.com";

function clean(value: unknown, label: string, maximum = 140) {
	if (typeof value !== "string") throw new Error(`${label} is required.`);
	const normalized = value.trim().replace(/\s+/g, " ");
	if (!normalized) throw new Error(`${label} is required.`);
	if (normalized.length > maximum) throw new Error(`${label} is too long.`);
	return normalized;
}

function inputFrom(value: unknown): ProfileFormInput {
	if (!value || typeof value !== "object")
		throw new Error("Invalid profile data.");
	const raw = value as Record<string, unknown>;
	return {
		firstName: clean(raw.firstName, "First name", 80),
		lastName: clean(raw.lastName, "Last name", 80),
		addressLine1: clean(raw.addressLine1, "Street address", 200),
		city: clean(raw.city, "City", 100),
		state: clean(raw.state, "State", 100),
		postalCode: clean(raw.postalCode, "Postal code", 24),
		country: clean(raw.country, "Country", 100),
	};
}

function clerkDetails(user: User) {
	const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
	if (!email)
		throw new Error("Your Clerk account needs a primary email address.");
	const primaryPhone = user.primaryPhoneNumber;
	const phoneVerified = primaryPhone?.verification?.status === "verified";
	return {
		email,
		role: (email === ADMIN_EMAIL ? "admin" : "user") as AppProfileRole,
		imageUrl: user.imageUrl || null,
		phoneNumber: phoneVerified ? (primaryPhone?.phoneNumber ?? null) : null,
		phoneVerifiedAt: phoneVerified ? new Date() : null,
	};
}

function toRecord(
	profile: Awaited<ReturnType<ProfileRepository["upsert"]>>,
): ProfileRecord {
	return {
		clerkUserId: profile.clerkUserId,
		role: profile.role,
		email: profile.email,
		firstName: profile.firstName,
		lastName: profile.lastName,
		addressLine1: profile.addressLine1,
		city: profile.city,
		state: profile.state,
		postalCode: profile.postalCode,
		country: profile.country,
		imageUrl: profile.imageUrl,
		phoneNumber: profile.phoneNumber,
		phoneVerifiedAt: profile.phoneVerifiedAt?.toISOString() ?? null,
		updatedAt: profile.updatedAt.toISOString(),
	};
}

/** Coordinates Clerk identity data and the application profile aggregate. */
export class ProfileService {
	constructor(private readonly repository = new ProfileRepository()) {}

	async get(clerkUserId: string) {
		const user = await clerkClient().users.getUser(clerkUserId);
		const existing = await this.repository.findByClerkUserId(clerkUserId);
		const clerk = clerkDetails(user);
		const saved = await this.repository.upsert({
			clerkUserId,
			...clerk,
			firstName: existing?.firstName || user.firstName || "",
			lastName: existing?.lastName || user.lastName || "",
			addressLine1: existing?.addressLine1 || "",
			city: existing?.city || "",
			state: existing?.state || "",
			postalCode: existing?.postalCode || "",
			country: existing?.country || "India",
		});
		return toRecord(saved);
	}

	async save(clerkUserId: string, rawInput: unknown) {
		const input = inputFrom(rawInput);
		await clerkClient().users.updateUser(clerkUserId, {
			firstName: input.firstName,
			lastName: input.lastName,
		});
		const user = await clerkClient().users.getUser(clerkUserId);
		const saved = await this.repository.upsert({
			clerkUserId,
			...clerkDetails(user),
			...input,
		});
		return toRecord(saved);
	}

	async confirmVerifiedPhone(clerkUserId: string, phoneId: string) {
		const user = await clerkClient().users.getUser(clerkUserId);
		const phone = user.phoneNumbers.find((item) => item.id === phoneId);
		if (!phone || phone.verification?.status !== "verified") {
			throw new Error("Verify this phone number before saving it.");
		}
		await clerkClient().users.updateUser(clerkUserId, {
			primaryPhoneNumberID: phone.id,
		});
		return this.get(clerkUserId);
	}
}
