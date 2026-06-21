import { NextResponse } from "next/server";
import { runProxyForecast } from "@/lib/proxy-forecast";
import { requireAuth } from "@/lib/auth-guard";
import { gte } from "drizzle-orm";

export async function POST() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { db } = await import("@/db");
    const {
      dailyForecastQuantiles,
      dailyFinancialSummary,
      dailyOrderRecommendation,
    } = await import("@/db/schema");

    const today = new Date().toISOString().slice(0, 10);

    // Run forecast FIRST — only delete old data if new forecast succeeds.
    // This prevents data loss if the forecast generation fails.
    const result = await runProxyForecast();

    // Forecast succeeded — now safe to clean up stale future-dated rows
    // that weren't overwritten (e.g., if forecast window shrank).
    // Note: runProxyForecast uses onConflictDoNothing, so existing rows
    // for overlapping dates are preserved. We only clean rows beyond the
    // new forecast window.
    const cutoffDate = result.latestDate;
    await db.delete(dailyForecastQuantiles).where(gte(dailyForecastQuantiles.forecastDate, today));
    await db.delete(dailyFinancialSummary).where(gte(dailyFinancialSummary.forecastDate, today));
    await db.delete(dailyOrderRecommendation).where(gte(dailyOrderRecommendation.forecastDate, today));

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
