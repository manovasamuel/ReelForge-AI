import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isOfflineDevMode } from "@/lib/auth/config";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if ((process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") && (!WEBHOOK_SECRET || WEBHOOK_SECRET.includes("placeholder"))) {
    return new Response("Error: CLERK_WEBHOOK_SECRET must be configured in production", { status: 500 });
  }

  const isPlaceholder = isOfflineDevMode() || !WEBHOOK_SECRET || WEBHOOK_SECRET.includes("placeholder");

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // In production or when configured, verify the Svix cryptographic signature
  if (!isPlaceholder) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occured -- no svix headers", { status: 400 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured -- invalid signature", { status: 400 });
    }
  }

  // If database is not configured (placeholder mode), acknowledge webhook without DB writes
  if (!db) {
    console.log("[Clerk Webhook] Database not configured (placeholder mode). Event ignored:", payload.type);
    return NextResponse.json({ success: true, mode: "placeholder", event: payload.type }, { status: 200 });
  }

  const eventType = payload.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = payload.data;
      const primaryEmail = email_addresses && email_addresses[0] ? email_addresses[0].email_address : `${id}@no-email.com`;
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || "ReelForge User";

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.clerkId, id),
      });

      if (existingUser) {
        // Update user
        await db
          .update(schema.users)
          .set({
            email: primaryEmail,
            fullName,
            avatarUrl: image_url || null,
            updatedAt: new Date(),
          })
          .where(eq(schema.users.clerkId, id));
      } else {
        // Insert new user identity
        const [newUser] = await db
          .insert(schema.users)
          .values({
            clerkId: id,
            email: primaryEmail,
            fullName,
            avatarUrl: image_url || null,
            tier: "free",
          })
          .returning();

        if (newUser) {
          const now = new Date();
          const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

          // 1. Initialize Subscriptions (tier = "free")
          await db.insert(schema.subscriptions).values({
            userId: newUser.id,
            status: "active",
            planId: "free",
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          });

          // 2. Initialize Usage metrics (generic counters only, 0 balances/limits)
          await db.insert(schema.usage).values({
            userId: newUser.id,
            billingPeriodStart: now,
            billingPeriodEnd: periodEnd,
            scraperCallsCount: 0,
            aiPromptTokens: 0,
            aiCompletionTokens: 0,
            totalCostUsd: "0.0000",
          });

          // 3. Initialize User Preferences
          await db.insert(schema.userPreferences).values({
            userId: newUser.id,
            activeScraperProvider: "apify",
            activeAiModel: "gemini-2.5-pro",
            themePreference: "dark",
            autoSaveEnabled: true,
            customPromptOverrides: {},
          });
        }
      }
    } else if (eventType === "user.deleted") {
      const { id } = payload.data;
      if (id) {
        await db.delete(schema.users).where(eq(schema.users.clerkId, id));
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error syncing database in Clerk webhook:", error);
    return NextResponse.json({ error: "Database sync failed" }, { status: 500 });
  }
}
