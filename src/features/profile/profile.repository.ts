import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { profiles } from "../../db/schema";
import type { AppProfileRole, ProfileFormInput } from "./profile.types";

type ProfileWrite = ProfileFormInput & {
	clerkUserId: string;
	role: AppProfileRole;
	email: string;
	imageUrl: string | null;
	phoneNumber: string | null;
	phoneVerifiedAt: Date | null;
};

function database() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is not configured.");
	}
	return drizzle(neon(connectionString));
}

/** Persistence boundary for the application-owned profile aggregate. */
export class ProfileRepository {
	async findByClerkUserId(clerkUserId: string) {
		const [profile] = await database()
			.select()
			.from(profiles)
			.where(eq(profiles.clerkUserId, clerkUserId))
			.limit(1);
		return profile ?? null;
	}

	async upsert(profile: ProfileWrite) {
		const [saved] = await database()
			.insert(profiles)
			.values(profile)
			.onConflictDoUpdate({
				target: profiles.clerkUserId,
				set: { ...profile, updatedAt: new Date() },
			})
			.returning();
		return saved;
	}
}
