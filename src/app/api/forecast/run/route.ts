import { NextResponse } from "next/server";
import { runProxyForecast } from "@/lib/proxy-forecast";
import { requireAuth } from "@/lib/auth-guard";
import { gte } from "drizzle-orm";

export async function POST() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    // Only clear forecasts for today+ (preserve historical)
    const { db } = await import("@/db");
    const {
      dailyForecastQuantiles,
      dailyFinancialSummary,
      dailyOrderRecommendation,
    } = await import("@/db/schema");

    const today = new Date().toISOString().slice(0, 10);

    await db.delete(dailyForecastQuantiles).where(gte(dailyForecastQuantiles.forecastDate, today));
    await db.delete(dailyFinancialSummary).where(gte(dailyFinancialSummary.forecastDate, today));
    await db.delete(dailyOrderRecommendation).where(gte(dailyOrderRecommendation.forecastDate, today));

    const result = await runProxyForecast();

    return NextResponse.json({
      success: true,
      message: `Forecast generated for ${result.forecastDates} days (${result.totalRows} total rows)`,
      ...result,
    });
  } catch (error) {
    console.error("Forecast run error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
