import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { costMatrix } from "@/db/schema";
import type { CostMatrixData } from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

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
    const data: CostMatrixData = await request.json();

    // Basic validation
    if (!data.pump_name || !data.by_fuel_grade || !data.financial) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    console.error("PUT /api/cost-matrix error:", error);
    return NextResponse.json({ error: "Failed to save cost matrix" }, { status: 500 });
  }
}
