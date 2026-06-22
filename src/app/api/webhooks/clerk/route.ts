import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { setUserRole } from "@/lib/access-control";

/**
 * Clerk webhook handler for user lifecycle events.
 *
 * Configures user records in Neon so the access-control layer has
 * an email + role on first login. The admin email is auto-promoted
 * by access-control.ts regardless of the role stored here.
 *
 * To enable:
 *   1. Set CLERK_WEBHOOK_SECRET in Vercel env (from Clerk Dashboard)
 *   2. Add this URL in Clerk Dashboard → Webhooks:
 *      https://<your-domain>/api/webhooks/clerk
 *   3. Subscribe to user.created, user.updated, user.deleted
 */

function getEnvSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

/**
 * Verify a Svix-style webhook signature using the Clerk webhook secret.
 */
function verifySignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): boolean {
  // Clerk/Svix secrets are base64-encoded whsec_* values.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");

  const signedContent = `${svixTimestamp}.${payload}`;
  const expected = createHmac("sha256", key).update(signedContent).digest("base64");

  // Svix signatures can be a comma-separated list of v1 signatures.
  const signatures = svixSignature.split(" ").map((s) => s.trim());
  for (const sig of signatures) {
    if (!sig.startsWith("v1,")) continue;
    const actualBase64 = sig.slice(3);
    const actual = Buffer.from(actualBase64, "base64");
    const expectedBuf = Buffer.from(expected, "base64");
    if (actual.length !== expectedBuf.length) continue;
    if (timingSafeEqual(actual, expectedBuf)) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const secret = getEnvSecret();

    const svixId = req.headers.get("svix-id") ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSignature = req.headers.get("svix-signature") ?? "";

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
    }

    const payload = await req.text();

    if (!verifySignature(payload, svixId, svixTimestamp, svixSignature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType: string = event.type;
    const { id: clerkUserId, email_addresses, primary_email_address_id } = event.data ?? {};

    if (!clerkUserId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Prefer primary email, fallback to first email.
    const primary = Array.isArray(email_addresses)
      ? email_addresses.find((e: { id: string; email: string }) => e.id === primary_email_address_id)
      : null;
    const email = primary?.email ?? email_addresses?.[0]?.email ?? `${clerkUserId}@placeholder.local`;

    switch (eventType) {
      case "user.created": {
        // New users are waitlisted by default. Admin promotion happens in access-control.ts.
        await setUserRole(clerkUserId, email, "waitlisted");
        break;
      }
      case "user.updated": {
        // Only update email; preserve existing role.
        const { updateUserEmail } = await import("@/lib/access-control");
        await updateUserEmail(clerkUserId, email);
        break;
      }
      case "user.deleted": {
        const { deleteUserRole } = await import("@/lib/access-control");
        await deleteUserRole(clerkUserId);
        break;
      }
      default:
        // Acknowledge other events we don't care about.
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 500 },
    );
  }
}
