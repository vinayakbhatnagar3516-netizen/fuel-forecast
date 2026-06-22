import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { userRoles } from "@/db/user-roles-schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/** The admin email that always has access */
export const ADMIN_EMAIL = "vinayakbhatnagar3516@gmail.com";

export type AccessLevel = "admin" | "member" | "waitlisted" | "denied";

/**
 * Resolve the access level for the currently authenticated user.
 *
 * Logic:
 *  1. If no userId → "denied"
 *  2. If email matches ADMIN_EMAIL → "admin" (upserts into user_roles)
 *  3. Look up user in user_roles table → role
 *  4. If not found → "waitlisted" (auto-insert first visit)
 */
export async function getAccessLevel(): Promise<{
  level: AccessLevel;
  userId: string | null;
  email: string | null;
}> {
  const session = await auth();
  if (!session.userId) {
    return { level: "denied", userId: null, email: null };
  }

  // Try to get email from Clerk session
  // Note: clerk auth() doesn't expose email directly — we use userId + look up in DB
  const userId = session.userId;

  // Check if admin by email pattern (gets resolved on first DB lookup)
  try {
    const row = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.clerkUserId, userId))
      .limit(1);

    if (row.length > 0) {
      const u = row[0];

      // Auto-promote admin email regardless of stored role
      if (u.email === ADMIN_EMAIL && u.role !== "admin") {
        await db
          .update(userRoles)
          .set({ role: "admin", updatedAt: new Date() })
          .where(eq(userRoles.clerkUserId, userId));
        return { level: "admin", userId, email: u.email };
      }

      return {
        level: u.role as AccessLevel,
        userId,
        email: u.email,
      };
    }

    // Not found — insert as waitlisted (first visit, before Clerk webhook)
    // We don't have the email yet, so this is a placeholder
    // The email will be filled in by the first successful API call or webhook
    await db.insert(userRoles).values({
      clerkUserId: userId,
      email: `pending-${userId.slice(0, 8)}`,
      role: "waitlisted",
    });

    return { level: "waitlisted", userId, email: null };
  } catch (err) {
    console.error("Access control check failed:", err);
    // Fail closed on DB errors. During an outage we cannot verify role;
    // granting "member" would let waitlisted users bypass the waitlist.
    return { level: "denied", userId, email: null };
  }
}

/**
 * Require a specific access level for API routes.
 * Returns an ok:true guard with user info, or a 403/401 NextResponse.
 */
export async function requireAccess(
  minimumLevel: "admin" | "member",
): Promise<
  | { ok: true; userId: string; email: string | null; level: AccessLevel }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session.userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { level, email } = await getAccessLevel();

  if (level === "denied" || level === "waitlisted") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Access denied",
          message:
            level === "waitlisted"
              ? "Your account is on the waitlist. You'll be notified once access is granted."
              : "Authentication required.",
        },
        { status: 403 },
      ),
    };
  }

  if (minimumLevel === "admin" && level !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden", message: "Admin access required." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, userId: session.userId, email, level };
}

/**
 * Upsert a user's role (used by admin panel or webhook).
 */
export async function setUserRole(
  clerkUserId: string,
  email: string,
  role: UserRole,
): Promise<void> {
  const existing = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.clerkUserId, clerkUserId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userRoles)
      .set({
        role,
        email,
        updatedAt: new Date(),
        ...(role === "member" || role === "admin"
          ? { approvedAt: new Date() }
          : {}),
      })
      .where(eq(userRoles.clerkUserId, clerkUserId));
  } else {
    await db.insert(userRoles).values({
      clerkUserId,
      email,
      role,
      ...(role === "member" || role === "admin"
        ? { approvedAt: new Date() }
        : {}),
    });
  }
}

type UserRole = "admin" | "member" | "waitlisted";
