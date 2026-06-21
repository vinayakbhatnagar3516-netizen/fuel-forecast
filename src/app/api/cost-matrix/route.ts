import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { costMatrix } from "@/db/schema";
import type { CostMatrixData } from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

// Max body size for cost matrix updates (100KB — generous for JSON config)
const MAX_BODY_BYTES = 100 * 1024;

export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const rows = await db.select().from(costMatrix).limit(1);
    if (rows.length === 0) {
      return NextResponse.json(null);
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET /api/cost-matrix error:", error);
    return NextResponse.json({ error: "Failed to fetch cost matrix" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    // Guard: check content-length before parsing
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: `Request body too large (max ${MAX_BODY_BYTES} bytes)` },
        { status: 413 },
      );
    }

    const data: CostMatrixData = await request.json();

    // Validate required top-level fields
    if (!data.pump_name || typeof data.pump_name !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'pump_name'" }, { status: 400 });
    }
    if (!data.by_fuel_grade || typeof data.by_fuel_grade !== "object") {
      return NextResponse.json({ error: "Missing or invalid 'by_fuel_grade'" }, { status: 400 });
    }
    if (!data.financial || typeof data.financial !== "object") {
      return NextResponse.json({ error: "Missing or invalid 'financial'" }, { status: 400 });
    }

    // Validate fuel grades are recognized
    const validGrades = ["Petrol", "High-Speed Diesel"];
    for (const grade of Object.keys(data.by_fuel_grade)) {
      if (!validGrades.includes(grade)) {
        return NextResponse.json(
          { error: `Unrecognized fuel grade: '${grade}'. Valid: ${validGrades.join(", ")}` },
          { status: 400 },
        );
      }
    }

    // Validate numeric fields are non-negative where expected
    const constraints = data.operational_constraints;
    if (constraints) {
      if (constraints.order_lead_time_days != null && constraints.order_lead_time_days < 0) {
        return NextResponse.json({ error: "order_lead_time_days must be >= 0" }, { status: 400 });
      }
    }

    // Upsert: check if a row exists, update or insert
    const existing = await db.select({ id: costMatrix.id }).from(costMatrix).limit(1);

    if (existing.length > 0) {
      await db
        .update(costMatrix)
        .set({ data, updatedAt: new Date() })
        .where(eq(costMatrix.id, existing[0].id));
    } else {
      await db.insert(costMatrix).values({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Distinguish JSON parse errors from DB errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    console.error("PUT /api/cost-matrix error:", error);
    return NextResponse.json({ error: "Failed to save cost matrix" }, { status: 500 });
  }
}
