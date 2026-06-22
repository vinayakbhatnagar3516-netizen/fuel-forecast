import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailyFuelSummary, fuelTransactions } from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

const VALID_FUEL_TYPES = ["Petrol", "High-Speed Diesel"];
const VALID_PAYMENT_METHODS = ["Cash", "Card", "UPI", "Fleet", "Other"];

export type SaleRecord = {
  date: string;
  fuelType: string;
  totalLiters: number;
  totalRevenue: number;
  totalTransactions: number;
};

// GET /api/sales?fuelType=Petrol&days=30
export async function GET(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuelType") || "Petrol";
    const days = parseInt(searchParams.get("days") || "30", 10);
    const ft = VALID_FUEL_TYPES.includes(fuelType) ? fuelType : "Petrol";
    const limitDays = Math.min(Math.max(days, 7), 365);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limitDays);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const rows = await db
      .select({
        summaryDate: dailyFuelSummary.summaryDate,
        fuelType: dailyFuelSummary.fuelType,
        totalLiters: dailyFuelSummary.totalLiters,
        totalRevenue: dailyFuelSummary.totalRevenue,
        totalTransactions: dailyFuelSummary.totalTransactions,
      })
      .from(dailyFuelSummary)
      .where(
        and(
          eq(dailyFuelSummary.fuelType, ft),
          gte(dailyFuelSummary.summaryDate, cutoffStr),
        ),
      )
      .orderBy(desc(dailyFuelSummary.summaryDate));

    const sales: SaleRecord[] = rows.map((r) => ({
      date: r.summaryDate,
      fuelType: r.fuelType,
      totalLiters: parseFloat(r.totalLiters ?? "0"),
      totalRevenue: parseFloat(r.totalRevenue ?? "0"),
      totalTransactions: r.totalTransactions ?? 0,
    }));

    return NextResponse.json({
      fuelType: ft,
      days: limitDays,
      sales,
    });
  } catch (error) {
    console.error("Sales GET error:", error);
    return NextResponse.json(
      { error: "Failed to load sales data" },
      { status: 500 },
    );
  }
}

// POST /api/sales
// Body: { date, fuelType, totalLiters, totalRevenue, totalTransactions, paymentMethod? }
export async function POST(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const {
      date,
      fuelType,
      totalLiters,
      totalRevenue,
      totalTransactions,
      paymentMethod,
    } = body;

    // Validation
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    const ft = VALID_FUEL_TYPES.includes(fuelType) ? fuelType : null;
    if (!ft) {
      return NextResponse.json(
        { error: "Invalid fuelType. Use Petrol or High-Speed Diesel." },
        { status: 400 },
      );
    }

    const liters = parseFloat(totalLiters);
    const revenue = parseFloat(totalRevenue);
    const transactions = parseInt(totalTransactions, 10);

    if (
      isNaN(liters) ||
      isNaN(revenue) ||
      isNaN(transactions) ||
      liters < 0 ||
      revenue < 0 ||
      transactions < 0
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values. All must be non-negative." },
        { status: 400 },
      );
    }

    // Upsert daily summary
    await db
      .insert(dailyFuelSummary)
      .values({
        summaryDate: date,
        fuelType: ft,
        totalLiters: liters.toFixed(2),
        totalRevenue: revenue.toFixed(2),
        totalTransactions: transactions,
      })
      .onConflictDoUpdate({
        target: [dailyFuelSummary.summaryDate, dailyFuelSummary.fuelType],
        set: {
          totalLiters: liters.toFixed(2),
          totalRevenue: revenue.toFixed(2),
          totalTransactions: transactions,
          createdAt: new Date(),
        },
      });

    // Also insert a single representative transaction so the ML pipeline
    // has transaction-level data to aggregate from.
    const pm = VALID_PAYMENT_METHODS.includes(paymentMethod)
      ? paymentMethod
      : "Cash";
    await db.insert(fuelTransactions).values({
      transactionDatetime: new Date(`${date}T12:00:00Z`),
      fuelType: ft,
      quantityLiters: liters.toFixed(2),
      amountInr: revenue.toFixed(2),
      paymentMethod: pm,
    });

    return NextResponse.json({
      success: true,
      date,
      fuelType: ft,
      totalLiters: liters,
      totalRevenue: revenue,
      totalTransactions: transactions,
    });
  } catch (error) {
    console.error("Sales POST error:", error);
    return NextResponse.json(
      { error: "Failed to save sales data" },
      { status: 500 },
    );
  }
}
