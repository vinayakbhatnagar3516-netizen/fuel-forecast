import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Returns the authenticated session context, or a 401 NextResponse. */
export async function requireAuth() {
  const session = await auth();
  if (!session.userId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}
