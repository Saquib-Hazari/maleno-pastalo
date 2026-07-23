import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

async function profileService() {
	// Kept inside the server handler so neither Drizzle nor the database driver
	// becomes part of the dashboard's browser bundle.
	const { ProfileService } = await import("./profile.service");
	return new ProfileService();
}

async function currentUserId() {
	const session = await auth();
	if (!session.userId)
		throw new Error("Please sign in to manage your profile.");
	return session.userId;
}

function profileInput(data: unknown) {
	if (!data || typeof data !== "object")
		throw new Error("Invalid profile data.");
	return data;
}

function phoneInput(data: unknown) {
	if (
		!data ||
		typeof data !== "object" ||
		typeof (data as { phoneId?: unknown }).phoneId !== "string"
	) {
		throw new Error("Invalid phone verification request.");
	}
	return { phoneId: (data as { phoneId: string }).phoneId };
}

export const getMyProfile = createServerFn({ method: "GET" }).handler(
	async () => (await profileService()).get(await currentUserId()),
);

export const saveMyProfile = createServerFn({ method: "POST" })
	.validator(profileInput)
	.handler(async ({ data }) =>
		(await profileService()).save(await currentUserId(), data),
	);

export const saveVerifiedPhone = createServerFn({ method: "POST" })
	.validator(phoneInput)
	.handler(async ({ data }) =>
		(await profileService()).confirmVerifiedPhone(
			await currentUserId(),
			data.phoneId,
		),
	);
