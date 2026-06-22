import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  dailyOrderRecommendation,
  dailyFinancialSummary,
  dailyForecastQuantiles,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-guard";

const VALID_FUEL_TYPES = ["combined", "Petrol", "High-Speed Diesel"];

export type OrderPolicy = {
  policy: "conservative" | "balanced" | "aggressive";
  recommendedOrder: number;
  reorderPoint: number;
  orderQuantity: number;
  expectedCost: number;
  pStockout: number;
  safetyBuffer: number;
};

export async function GET(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuelType") || "combined";
    const ft = VALID_FUEL_TYPES.includes(fuelType) ? fuelType : "combined";

    // Latest forecast date
    const latestDateResult = await db
      .select({ maxDate: sql<string>`MAX(forecast_date)` })
      .from(dailyForecastQuantiles);

    const latestDate = latestDateResult[0]?.maxDate;

    if (!latestDate) {
      return NextResponse.json({
        fuelType: ft,
        hasData: false,
        recommendation: null,
        policies: { conservative: null, balanced: null, aggressive: null },
      });
    }

    // Recommendations for the latest date + fuel type
    const orderRows = await db
      .select()
      .from(dailyOrderRecommendation)
      .where(
        and(
          eq(dailyOrderRecommendation.forecastDate, latestDate),
          eq(dailyOrderRecommendation.fuelType, ft),
        ),
      )
      .orderBy(dailyOrderRecommendation.policy);

    // Financial summary for context
    const financialRows = await db
      .select()
      .from(dailyFinancialSummary)
      .where(
        and(
          eq(dailyFinancialSummary.forecastDate, latestDate),
          eq(dailyFinancialSummary.fuelType, ft),
        ),
      )
      .limit(1);

    const fin = financialRows[0];

    // Forecast point for safety buffer calc
    const forecastRows = await db
      .select({ forecastPoint: dailyForecastQuantiles.forecastPoint })
      .from(dailyForecastQuantiles)
      .where(
        and(
          eq(dailyForecastQuantiles.forecastDate, latestDate),
          eq(dailyForecastQuantiles.fuelType, ft),
        ),
      )
      .limit(1);

    const forecastPoint = parseFloat(forecastRows[0]?.forecastPoint ?? "0");

    const policies: Record<string, OrderPolicy | null> = {
      conservative: null,
      balanced: null,
      aggressive: null,
    };

    for (const row of orderRows) {
      const policy = row.policy as "conservative" | "balanced" | "aggressive";
      const recOrder = parseFloat(row.recommendedOrder ?? "0");
      const reorderPt = parseFloat(row.reorderPoint ?? "0");
      const safetyBuffer = Math.max(0, reorderPt - forecastPoint);

      policies[policy] = {
        policy,
        recommendedOrder: recOrder,
        reorderPoint: reorderPt,
        orderQuantity: parseFloat(row.orderQuantity ?? "0"),
        expectedCost: parseFloat(row.expectedCost ?? "0"),
        pStockout: parseFloat(row.pStockout ?? "0"),
        safetyBuffer,
      };
    }

    const balanced = policies.balanced;

    return NextResponse.json({
      fuelType: ft,
      hasData: true,
      forecastDate: latestDate,
      forecastPoint,
      recommendation: balanced
        ? {
            policy: "balanced" as const,
            recommendedOrder: balanced.recommendedOrder,
            pStockout: balanced.pStockout,
          }
        : null,
      policies,
      financial: fin
        ? {
            expectedDailyProfit: parseFloat(fin.expectedDailyProfit ?? "0"),
            expectedMonthlyProfit: parseFloat(fin.expectedMonthlyProfit ?? "0"),
            pLoss: parseFloat(fin.pLoss ?? "0"),
            var5: parseFloat(fin.var5 ?? "0"),
          }
        : null,
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to load order data" },
      { status: 500 },
    );
  }
}
