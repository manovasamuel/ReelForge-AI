import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SubscriptionRepository } from "@/lib/db/repositories/subscription.repository";

const isPlaceholderAuth =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

const subRepo = new SubscriptionRepository();

/**
 * Resolves the authenticated user's internal database UUID.
 * In Development Placeholder Mode (or when Clerk is unconfigured), maps to the development identity.
 * In Live Mode, queries the database by clerkId, auto-creating the user record and default free subscription if needed.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  let clerkId = "dev_user_placeholder";
  let email = "dev@reelforge.ai";
  let fullName = "Development User";

  if (!isPlaceholderAuth) {
    try {
      const { auth, currentUser } = await import("@clerk/nextjs/server");
      const authState = await auth();
      if (!authState.userId) {
        return null;
      }
      clerkId = authState.userId;
      const userObj = await currentUser();
      if (userObj) {
        email = userObj.primaryEmailAddress?.emailAddress || `${clerkId}@reelforge.ai`;
        fullName = userObj.fullName || "ReelForge User";
      }
    } catch {
      return null;
    }
  }

  // In offline/CI mode where db is unavailable, return a stable dev identity
  // instead of throwing — prevents cascading API failures in all routes.
  if (!db) {
    return "offline-user";
  }

  // Look up user in database by clerkId
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // If not found (e.g. before webhook fires or in dev mode), create the user record
  const [created] = await db
    .insert(users)
    .values({
      clerkId,
      email,
      fullName,
      tier: "free",
    })
    .returning({ id: users.id });

  // Initialize default free subscription
  try {
    await subRepo.upsertSubscription({
      userId: created.id,
      status: "active",
      planId: "free",
    });
  } catch (err) {
    console.warn("[server-user] Failed to initialize default subscription for new user:", err);
  }

  return created.id;
}

/**
 * Helper to resolve internal user object with { userId } format.
 */
export async function resolveUser(clerkId?: string | null, email?: string): Promise<{ userId: string }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    throw new Error("Unauthorized: Could not resolve user identity.");
  }
  return { userId };
}
