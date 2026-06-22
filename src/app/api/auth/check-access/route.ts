import { NextResponse } from "next/server";
import { getAccessLevel } from "@/lib/access-control";
import { auth } from "@clerk/nextjs/server";

/**
 * Lightweight endpoint for the client-side DashboardAuthGuard
 * to check the current user's access level.
 */
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json(
      { level: "denied", userId: null },
      { status: 401 },
    );
  }

  const { level, email } = await getAccessLevel();

  return NextResponse.json({
    level,
    userId: session.userId,
    email,
    isAdmin: level === "admin",
    isMember: level === "member",
    isWaitlisted: level === "waitlisted",
  });
}
