import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { costMatrix } from "@/db/schema";
import type { CostMatrixData } from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

// Max body size for cost matrix updates (100KB — generous for JSON config)
const MAX_BODY_BYTES = 100 * 1024;
// Max JSON nesting depth to prevent deep-nesting attacks
const MAX_JSON_DEPTH = 10;
// Max string length for pump_name
const MAX_NAME_LENGTH = 200;
// Sensible numeric bounds for financial config
const NUMERIC_BOUNDS = {
  commission_per_liter: { min: 0, max: 100 },
  purchase_price_per_liter: { min: 0, max: 500 },
  tank_capacity_liters: { min: 0, max: 1_000_000 },
  stockout_cost_per_liter: { min: 0, max: 500 },
  overstock_cost_per_liter_per_day: { min: 0, max: 100 },
  tanker_capacity_liters: { min: 0, max: 200_000 },
  order_lead_time_days: { min: 0, max: 30 },
  evaporation_loss_pct: { min: 0, max: 100 },
};

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

    // Guard: check JSON nesting depth
    if (getJsonDepth(data) > MAX_JSON_DEPTH) {
      return NextResponse.json(
        { error: `JSON nesting exceeds maximum depth of ${MAX_JSON_DEPTH}` },
        { status: 400 },
      );
    }

    // Validate required top-level fields
    if (!data.pump_name || typeof data.pump_name !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'pump_name'" }, { status: 400 });
    }
    if (data.pump_name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `'pump_name' exceeds max length of ${MAX_NAME_LENGTH} characters` },
        { status: 400 },
      );
    }
    // Sanitize: strip control characters from pump_name
    data.pump_name = data.pump_name.replace(/[\x00-\x1f\x7f]/g, "");
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
      if (constraints.order_lead_time_days != null && constraints.order_lead_time_days > NUMERIC_BOUNDS.order_lead_time_days.max) {
        return NextResponse.json({ error: `order_lead_time_days must be <= ${NUMERIC_BOUNDS.order_lead_time_days.max}` }, { status: 400 });
      }
      if (constraints.tanker_capacity_liters != null && constraints.tanker_capacity_liters > NUMERIC_BOUNDS.tanker_capacity_liters.max) {
        return NextResponse.json({ error: `tanker_capacity_liters exceeds maximum` }, { status: 400 });
      }
    }

    // Validate fuel grade numeric fields
    if (data.by_fuel_grade) {
      for (const [grade, config] of Object.entries(data.by_fuel_grade)) {
        if (config.commission_per_liter != null && (config.commission_per_liter < NUMERIC_BOUNDS.commission_per_liter.min || config.commission_per_liter > NUMERIC_BOUNDS.commission_per_liter.max)) {
          return NextResponse.json({ error: `${grade}: commission_per_liter must be between ${NUMERIC_BOUNDS.commission_per_liter.min}-${NUMERIC_BOUNDS.commission_per_liter.max}` }, { status: 400 });
        }
        if (config.purchase_price_per_liter != null && (config.purchase_price_per_liter < NUMERIC_BOUNDS.purchase_price_per_liter.min || config.purchase_price_per_liter > NUMERIC_BOUNDS.purchase_price_per_liter.max)) {
          return NextResponse.json({ error: `${grade}: purchase_price_per_liter out of range` }, { status: 400 });
        }
        if (config.tank_capacity_liters != null && config.tank_capacity_liters > NUMERIC_BOUNDS.tank_capacity_liters.max) {
          return NextResponse.json({ error: `${grade}: tank_capacity_liters exceeds maximum` }, { status: 400 });
        }
        if (config.evaporation_loss_pct != null && (config.evaporation_loss_pct < NUMERIC_BOUNDS.evaporation_loss_pct.min || config.evaporation_loss_pct > NUMERIC_BOUNDS.evaporation_loss_pct.max)) {
          return NextResponse.json({ error: `${grade}: evaporation_loss_pct must be 0-100` }, { status: 400 });
        }
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

/**
 * Recursively compute JSON nesting depth.
 * Prevents deep-nesting DoS attacks.
 */
function getJsonDepth(value: unknown, depth: number = 0): number {
  if (depth > 50) return depth; // bail-out guard
  if (value !== null && typeof value === "object") {
    if (Array.isArray(value)) {
      return value.length > 0
        ? Math.max(...value.map((v) => getJsonDepth(v, depth + 1)))
        : depth + 1;
    }
    return Object.keys(value).length > 0
      ? Math.max(...Object.values(value).map((v) => getJsonDepth(v, depth + 1)))
      : depth + 1;
  }
  return depth;
}
