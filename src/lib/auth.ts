import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";

export type AppRole = "admin" | "user";

const ADMIN_EMAIL = "saquibhazari1000@gmail.com";

type RoleClaims = {
	metadata?: { role?: unknown };
	public_metadata?: { role?: unknown };
	role?: unknown;
	email?: unknown;
	primary_email_address?: unknown;
};

function roleFromClaims(claims: unknown): AppRole {
	const roleClaims = claims as RoleClaims | undefined;
	const role =
		roleClaims?.metadata?.role ??
		roleClaims?.public_metadata?.role ??
		roleClaims?.role;
	return role === "admin" ? "admin" : "user";
}

function emailFromClaims(claims: unknown) {
	const roleClaims = claims as RoleClaims | undefined;
	const email = roleClaims?.email ?? roleClaims?.primary_email_address;
	return typeof email === "string" ? email.toLowerCase() : undefined;
}

/**
 * Server-only Clerk session lookup. Configure a Clerk session-token custom
 * claim of `metadata: "{{user.public_metadata}}"`, then set
 * `user.public_metadata.role` to `admin` for administrators.
 */
export const getSessionAccess = createServerFn({ method: "GET" }).handler(
	async () => {
	const session = await auth();
	if (!session.userId) return { userId: null, role: "user" as const };

	// The user record is the source of truth for the named administrator, but
	// an unavailable Clerk backend must not crash the entire dashboard route.
	// In that case the normal session claim still provides safe user access.
	let email = emailFromClaims(session.sessionClaims);
	try {
		const user = await clerkClient().users.getUser(session.userId);
		email = user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? email;
	} catch (error) {
		console.error("Unable to load Clerk user for role resolution", error);
	}
	return {
			userId: session.userId,
			role:
				email === ADMIN_EMAIL ? "admin" : roleFromClaims(session.sessionClaims),
		};
	},
);
