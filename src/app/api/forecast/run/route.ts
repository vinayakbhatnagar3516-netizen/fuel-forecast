import { NextResponse } from "next/server";
import { runProxyForecast } from "@/lib/proxy-forecast";

export async function POST() {
  try {
    // First clear existing forecast data for a clean run
    const { db } = await import("@/db");
    const {
      dailyForecastQuantiles,
      dailyFinancialSummary,
      dailyOrderRecommendation,
    } = await import("@/db/schema");

    await db.delete(dailyForecastQuantiles);
    await db.delete(dailyFinancialSummary);
    await db.delete(dailyOrderRecommendation);

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
